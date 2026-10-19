import { NextResponse } from "next/server";

import {
  extraerJSON,
  maxTokensDe,
  promptDe,
  validarMesoIA,
  validarMicroIA,
  validarSesionIA,
  type PayloadIA,
  type RespuestaIA,
} from "@/lib/planificador/ia";

/**
 * POST /api/planificador-ia — el navegador manda el pedido compacto (ya
 * armado por el motor) y vuelve la capa de texto escrita por la IA.
 *
 * GET /api/planificador-ia — estado: { ia: true/false }. Con ?ping=1 hace una
 * llamada mínima para confirmar que la key sirve de verdad.
 *
 * La key vive en la variable de entorno GROQ_API_KEY (Vercel) y nunca baja al
 * bundle. Cualquier falla (sin key, 429, timeout, JSON roto) devuelve un
 * estado de error y el planificador sigue funcionando con el texto del motor:
 * la IA es una mejora, no un requisito.
 */

export const dynamic = "force-dynamic";

/**
 * Por defecto el 120b: la capa de texto es redacción de profe y el modelo
 * grande escribe mejor. El 20b es el doble de rápido; si los latidos de la
 * cuota lo piden, GROQ_MODEL=openai/gpt-oss-20b resuelve sin tocar código.
 */
const MODELO = process.env.GROQ_MODEL ?? "openai/gpt-oss-120b";
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

/** El payload viene del navegador: se valida la forma y se pone tope de tamaño. */
function esPayloadIA(v: unknown): v is PayloadIA {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  if (typeof o.params !== "object" || o.params === null) return false;
  if (o.tipo === "sesion") return Array.isArray(o.bloques);
  if (o.tipo === "microciclo") return Array.isArray(o.dias);
  if (o.tipo === "mesociclo") return Array.isArray(o.semanas);
  return false;
}

function cantidadDe(payload: PayloadIA): number {
  if (payload.tipo === "sesion") return payload.bloques.length;
  if (payload.tipo === "microciclo") return payload.dias.length;
  return payload.semanas.length;
}

async function llamarGroq(key: string, system: string, user: string, maxTokens: number): Promise<unknown> {
  const conJson = { response_format: { type: "json_object" as const } };
  let ultimoError = "";

  const extras: Record<string, unknown>[] = [conJson, {}];
  for (const extra of extras) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: MODELO,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature: 0.7,
          max_tokens: maxTokens,
          ...extra,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(25_000),
      });

      if (!res.ok) {
        ultimoError = `groq HTTP ${res.status}`;
        // La key no sirve o no tiene acceso al modelo: reintentar no cambia nada.
        if (res.status === 401 || res.status === 403 || res.status === 429) break;
        // 400 con json_object: el modelo no lo soporta, se reintenta sin el parámetro.
        if (res.status === 400 && "response_format" in extra) continue;
        break;
      }

      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const crudo = data.choices?.[0]?.message?.content ?? "";
      const json = extraerJSON(crudo);
      if (json !== null) return json;
      ultimoError = "respuesta sin JSON";
    } catch (e) {
      // Timeout o red: un reinteno duplicaría la espera, se corta.
      ultimoError = e instanceof Error ? e.message : "error de red";
      break;
    }
  }

  const err = new Error(ultimoError || "error desconocido");
  err.name = "GroqError";
  throw err;
}

export async function POST(req: Request) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return NextResponse.json({ error: "sin_key" }, { status: 503 });

  let payload: PayloadIA;
  try {
    payload = (await req.json()) as PayloadIA;
  } catch {
    return NextResponse.json({ error: "payload" }, { status: 400 });
  }
  if (!esPayloadIA(payload)) return NextResponse.json({ error: "payload" }, { status: 400 });
  if (JSON.stringify(payload).length > 60_000) {
    return NextResponse.json({ error: "payload" }, { status: 400 });
  }

  const { system, user } = promptDe(payload);
  let json: unknown;
  try {
    json = await llamarGroq(key, system, user, maxTokensDe(payload));
  } catch (e) {
    console.warn("planificador-ia: Groq falló", {
      tipo: payload.tipo,
      error: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json({ error: "groq" }, { status: 502 });
  }

  const validador =
    payload.tipo === "sesion"
      ? validarSesionIA
      : payload.tipo === "microciclo"
        ? validarMicroIA
        : validarMesoIA;
  const ok = validador(json, cantidadDe(payload));
  if (!ok) {
    console.warn("planificador-ia: respuesta de Groq no cumple la forma esperada", { tipo: payload.tipo });
    return NextResponse.json({ error: "ia_invalida" }, { status: 502 });
  }

  console.log("planificador-ia: ok", { tipo: payload.tipo, modelo: MODELO });
  return NextResponse.json(ok satisfies RespuestaIA);
}

export async function GET(req: Request) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return NextResponse.json({ ia: false });
  if (new URL(req.url).searchParams.get("ping") !== "1") {
    return NextResponse.json({ ia: true, modelo: MODELO });
  }

  // Verificación real: una llamada mínima (máximo 8 tokens) contra el modelo.
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODELO,
        messages: [{ role: "user", content: "Responde únicamente: OK" }],
        max_tokens: 8,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    return NextResponse.json({ ia: true, ok: res.ok, modelo: MODELO, status: res.status });
  } catch {
    return NextResponse.json({ ia: true, ok: false, modelo: MODELO });
  }
}
