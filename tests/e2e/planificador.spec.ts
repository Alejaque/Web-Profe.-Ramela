import { expect, test } from "@playwright/test";

/**
 * El Planificador tiene que generar de verdad, no mostrar un ejemplo dibujado.
 *
 * Estas pruebas verifican lo que un entrenador comprobaría en dos minutos: que
 * los minutos cerraron, que la sesión cambia cuando pide otra, y que la semana
 * tiene siete días con el partido donde va.
 */

function minutos(bloques: string[]): number {
  return bloques.reduce((t, texto) => t + Number((texto.match(/(\d+)\s*'/) ?? [])[1] ?? 0), 0);
}

test("la sesión se arma sola y los minutos cierran exactos", async ({ page }) => {
  await page.goto("/planificador");

  const sesion = page.locator("ol").first();
  const bloques = await sesion.locator("li").allInnerTexts();
  expect(bloques.length).toBeGreaterThanOrEqual(3);

  // El renglón de arriba dice cuántos minutos pidió.
  const resumen = await page.getByText(/bloques · \d+ minutos/).innerText();
  const pedidos = Number(resumen.match(/(\d+) minutos/)![1]);
  expect(minutos(bloques)).toBe(pedidos);
});

test("cada bloque trae su consigna propia, las medidas y el material", async ({ page }) => {
  await page.goto("/planificador");
  const bloques = page.locator("ol").first().locator("li");
  const total = await bloques.count();
  const consignas = new Set<string>();

  for (let i = 0; i < total; i += 1) {
    const texto = await bloques.nth(i).innerText();
    // La consigna viene del desarrollo de la ficha: es larga y específica.
    const consigna = texto.split("\n").find((l) => /^[A-ZÁÉÍÓÚÑ][^.]+\./.test(l) && l.length > 60);
    expect(consigna, `bloque ${i} sin consigna`).toBeTruthy();
    consignas.add(consigna!);
    expect(texto, `bloque ${i} sin medidas`).toMatch(/\d+\s*×\s*\d+\s*m/);
    expect(texto, `bloque ${i} sin jugadores`).toMatch(/jugadores/);
  }
  // Ningún bloque repite la consigna de otro: no son plantillas.
  expect(consignas.size).toBe(total);
});

test("pedir otra opción cambia la sesión sin romper los minutos", async ({ page }) => {
  await page.goto("/planificador");
  const sesion = page.locator("ol").first();

  const antes = await sesion.innerText();
  await page.getByRole("button", { name: /Otra opción/ }).click();
  await expect(sesion).not.toHaveText(antes);

  const resumen = await page.getByText(/bloques · \d+ minutos/).innerText();
  const pedidos = Number(resumen.match(/(\d+) minutos/)![1]);
  expect(minutos(await sesion.locator("li").allInnerTexts())).toBe(pedidos);
});

test("el microciclo muestra los siete días con el partido el domingo", async ({ page }) => {
  await page.goto("/planificador");
  await page.getByRole("button", { name: /Microciclo/ }).click();

  for (const dia of ["MD+1", "MD-5", "MD-4", "MD-3", "MD-2", "MD-1", "MD"]) {
    await expect(page.getByText(dia, { exact: false }).first()).toBeVisible();
  }
  // El día del partido se distingue y no entrena.
  await expect(page.getByText("Partido").first()).toBeVisible();
  // Y la semana dice cuánto entrena en total.
  await expect(page.getByText(/7 días · \d+ minutos de entrenamiento/)).toBeVisible();
});

test("el mesociclo arma las semanas que se piden y descarga al final", async ({ page }) => {
  await page.goto("/planificador");
  await page.getByRole("button", { name: /Mesociclo/ }).click();

  for (let n = 1; n <= 4; n += 1) {
    await expect(page.getByRole("heading", { name: new RegExp(`Semana ${n}`, "i") })).toBeVisible();
  }
  await expect(page.getByText("Realización").first()).toBeVisible();
  await expect(page.getByText(/semanas · \d+ minutos/)).toBeVisible();
});

test("cambiar los parámetros rearma la sesión", async ({ page }) => {
  await page.goto("/planificador");
  const sesion = page.locator("ol").first();
  const antes = await sesion.innerText();

  await page.getByRole("button", { name: "Infantil", exact: true }).click();
  await expect(sesion).not.toHaveText(antes);

  // Infantil no siempre puede con 90': sólo se ofrece lo que cierra.
  const resumen = await page.getByText(/bloques · \d+ minutos/).innerText();
  const pedidos = Number(resumen.match(/(\d+) minutos/)![1]);
  expect(minutos(await sesion.locator("li").allInnerTexts())).toBe(pedidos);
});

test("sin acceso se ofrece comprar; con el código aparecen las descargas", async ({ page }) => {
  await page.goto("/planificador");
  await expect(page.getByRole("link", { name: /Bajar en PDF y Excel/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "PDF", exact: true })).toHaveCount(0);

  await page.goto("/planificador?acceso=ramela-planificador");
  await expect(page.getByRole("button", { name: "PDF", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Excel", exact: true })).toBeVisible();
});

test("la descarga de Excel llega con contenido", async ({ page }) => {
  await page.goto("/planificador?acceso=ramela-planificador");
  const descarga = page.waitForEvent("download", { timeout: 15000 });
  await page.getByRole("button", { name: "Excel", exact: true }).click();
  const archivo = await descarga;

  expect(archivo.suggestedFilename()).toMatch(/^sesion-.*\.xlsx$/);
  const ruta = await archivo.path();
  expect(ruta).toBeTruthy();

  // Un zip vacío o roto no llega a 2 KB: es la señal de que se escribió de verdad.
  const { statSync } = await import("node:fs");
  expect(statSync(ruta!).size).toBeGreaterThan(2000);
});

/**
 * La franja y el contador de la oferta.
 *
 * Ojo: estos tests asumen que la oferta está vigente. Si algún día fallan por
 * eso, no es un bug: es que se vencieron los tramos de src/lib/ofertas.ts y
 * hay que renovarlos.
 */
test("la home muestra la franja de oferta con precio y cuenta regresiva", async ({ page }) => {
  await page.goto("/");

  const franja = page.getByTestId("franja-oferta");
  await expect(franja).toContainText(/Faltan \d+ días|Falta 1 día|Termina en/);

  // El precio de la oferta y el de lista, los dos visibles.
  await expect(franja).toContainText(/\$\s*29\.900/);
  await expect(franja).toContainText(/\$\s*39\.900/);
  // Y lleva al producto.
  await expect(franja.getByRole("link", { name: "Ver" })).toHaveAttribute("href", "/biblioteca");
});

test("el bloque de la biblioteca y su página dicen cuánto falta", async ({ page }) => {
  await page.goto("/");
  const bloque = page.locator("section#biblioteca");
  await expect(bloque).toContainText(/Cierre de temporada/);
  await expect(bloque).toContainText(/Faltan \d+ días|Falta 1 día|Termina en/);

  await page.goto("/biblioteca");
  await expect(page.getByText(/Faltan \d+ días|Falta 1 día|Termina en/).first()).toBeVisible();
});
