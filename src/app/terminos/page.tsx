import type { Metadata } from "next";
import { LegalShell } from "@/components/LegalShell";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: "Términos y condiciones | Profe. Alejandro Ramela" };

const wa = `https://wa.me/${LEGAL.whatsapp}`;

export default function TerminosPage() {
  const secciones: { titulo: string; parrafos: string[] }[] = [
    { titulo: "1. Quién vende", parrafos: [
      `Este sitio es operado por ${LEGAL.nombre} (“${LEGAL.marca}”), con domicilio en ${LEGAL.domicilio}.${LEGAL.cuit ? ` CUIT: ${LEGAL.cuit}.` : ""} Contacto: WhatsApp ${LEGAL.whatsappVisible}.`] },
    { titulo: "2. Qué se vende", parrafos: [
      "Los productos son contenidos digitales de formación: guías en PDF, planillas de Excel y materiales relacionados, a los que se accede mediante enlaces a carpetas en línea. No se envía ningún producto físico.",
      "El material tiene fines educativos y de formación deportiva. Salvo que se indique expresamente lo contrario, no otorga habilitaciones oficiales ni garantiza resultados deportivos o laborales."] },
    { titulo: "3. Precios y medios de pago", parrafos: [
      "Los precios están expresados en pesos argentinos (ARS) y se muestran antes de pagar. Se puede pagar con Mercado Pago (tarjetas, dinero en cuenta u otros medios que esa plataforma habilite) o por transferencia.",
      "Los pagos con Mercado Pago son procesados por esa plataforma, con sus propias condiciones. Los datos de tu tarjeta no pasan por este sitio."] },
    { titulo: "4. Entrega y acceso", parrafos: [
      "Con Mercado Pago, cuando el pago se aprueba y volvés al sitio, se muestran los botones de acceso a tu material. Con transferencia, el acceso se envía por WhatsApp una vez acreditado el pago, normalmente dentro de las " + LEGAL.plazoEntregaTransferencia + ".",
      "Guardá los enlaces de acceso. Si los perdés, escribinos por WhatsApp con tu comprobante de pago."] },
    { titulo: "5. Licencia de uso", parrafos: [
      "La compra otorga una licencia personal e intransferible. Podés usar el material con tus propios grupos y grabar copias impresas para tu uso.",
      "No está permitido reenviar, publicar, subir a otras plataformas, revender ni compartir los enlaces de acceso. Ante un uso indebido, podemos suspender el acceso."] },
    { titulo: "6. Derecho de arrepentimiento", parrafos: [
      `Podés arrepentirte de tu compra dentro de ${LEGAL.plazoArrepentimiento} desde que la realizás o desde que el contenido queda disponible, lo que te resulte más favorable. No tenés que dar motivos ni pagar ningún costo.`,
      `Para hacerlo, usá el botón de arrepentimiento (https://${LEGAL.sitio}/arrepentimiento). Recibís un código de solicitud y te respondemos dentro de ${LEGAL.plazoRespuesta}.`] },
    { titulo: "7. Reintegros", parrafos: [
      `Aceptada la solicitud, devolvemos el total pagado por el mismo medio de pago dentro de ${LEGAL.plazoReintegro}. Si pagaste por transferencia, te pedimos los datos de una cuenta a tu nombre.`,
      "Al reintegrar el pago, se da de baja el acceso al material."] },
    { titulo: "8. Problemas con el material", parrafos: [
      "Si un archivo no abre, falta contenido o tiene un error, escribinos por WhatsApp. Lo corregimos o lo reenviamos. Si no logramos solucionarlo, te devolvemos el pago."] },
    { titulo: "9. Propiedad intelectual", parrafos: [
      `Los textos, guías, diagramas, planillas, diseños y logos pertenecen a ${LEGAL.nombre} y están protegidos por la Ley 11.723 de Propiedad Intelectual. Todos los derechos reservados.`] },
    { titulo: "10. Datos personales", parrafos: [
      "Para gestionar tu compra y darte soporte usamos tu nombre, tu número de WhatsApp, tu email (si lo informás) y los datos del pedido. No vendemos ni cedemos tus datos a terceros, salvo a Mercado Pago para procesar el pago.",
      "El carrito se guarda en tu propio dispositivo. Podés pedirnos por WhatsApp acceder a tus datos, corregirlos o eliminarlos.",
      "Si considerás que se vulneraron tus derechos, podés presentar un reclamo ante la Agencia de Acceso a la Información Pública, órgano de control de la Ley 25.326 de Protección de Datos Personales."] },
    { titulo: "11. Defensa del consumidor", parrafos: [
      "Si tenés un reclamo, podés presentarlo ante la oficina de Defensa del Consumidor de tu jurisdicción."] },
    { titulo: "12. Jurisdicción", parrafos: [
      "Para cualquier controversia son competentes los tribunales ordinarios del domicilio del consumidor."] },
    { titulo: "13. Cambios en estos términos", parrafos: [
      `Podemos actualizar estos términos. Los cambios rigen para las compras posteriores a la fecha de actualización. Última actualización: ${LEGAL.actualizado}.`] },
  ];
  return (
    <LegalShell title="Términos y condiciones" intro="Leelos antes de comprar. Incluyen la política de reembolso, el derecho de arrepentimiento y cómo cuidamos tus datos.">
      {secciones.map((s) => (
        <section key={s.titulo} className="mb-7 last:mb-0">
          <h2 className="font-display text-2xl font-extrabold uppercase text-[#071634]">{s.titulo}</h2>
          {s.parrafos.map((p) => (<p key={p} className="mt-2">{p}</p>))}
        </section>
      ))}
      <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
        <a href="/arrepentimiento" className="rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-400">Botón de arrepentimiento</a>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition hover:brightness-95">Consultar por WhatsApp</a>
      </div>
    </LegalShell>
  );
}
