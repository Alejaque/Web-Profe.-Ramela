import { expect, test } from "@playwright/test";

/**
 * La Biblioteca se destaca en la home y en la página de muestras, y explica su
 * ventaja (pago único contra suscripción) sin nombrar a la competencia: nombrarla
 * la ataría a precios de terceros que cambian.
 */

const PRECIO = /\$\s*29\.900/;
const LISTA = /\$\s*39\.900/;

test("la home muestra el bloque de la Biblioteca con sus tres diagramas", async ({ page }) => {
  await page.goto("/");

  const bloque = page.locator("section#biblioteca");
  await expect(bloque).toBeVisible();
  await expect(bloque.getByRole("heading", { level: 2 })).toContainText("15 ejercicios gratis");

  const diagramas = bloque.locator('img[src^="/biblioteca/"]');
  await expect(diagramas).toHaveCount(3);

  // Los tres SVG existen de verdad y se sirven como imagen, no como recuadro vacío.
  for (let i = 0; i < 3; i += 1) {
    const src = await diagramas.nth(i).getAttribute("src");
    expect(src).toBeTruthy();
    const resp = await page.request.get(src!);
    expect(resp.status()).toBe(200);
    expect(resp.headers()["content-type"]).toContain("svg");
  }
});

test("el bloque publica la oferta de lanzamiento y el botón está habilitado", async ({ page }) => {
  await page.goto("/");

  const bloque = page.locator("section#biblioteca");
  await expect(bloque.getByText(PRECIO)).toBeVisible();
  await expect(bloque.locator(".line-through")).toContainText(/39\.900/);
  await expect(bloque).toContainText("Oferta lanzamiento");

  // Si el producto no estuviera habilitado, el botón diría "Próximamente".
  await expect(bloque.getByRole("button", { name: "Próximamente" })).toHaveCount(0);
  await expect(bloque.getByRole("button", { name: /Llevate las 120 fichas/ })).toBeEnabled();
});

test("el bloque lleva a la biblioteca y se puede agregar al carrito", async ({ page }) => {
  await page.goto("/");

  const bloque = page.locator("section#biblioteca");
  await bloque.getByRole("button", { name: /Llevate las 120 fichas/ }).click();
  await expect(bloque.getByRole("button", { name: /En tu carrito/ })).toBeVisible();

  await bloque.getByRole("link", { name: /Ver los 15 gratis/ }).click();
  await expect(page).toHaveURL(/\/biblioteca$/);
});

test("la página de muestras ofrece seguir con los ejercicios gratis", async ({ page }) => {
  await page.goto("/muestra-gratis");

  const modulo = page.locator('section[aria-labelledby="seguir-probando"]');
  await expect(modulo).toBeVisible();
  await expect(modulo).toContainText("sin mail y sin registro");

  await modulo.getByRole("link", { name: /Ver los 15 ejercicios gratis/ }).click();
  await expect(page).toHaveURL(/\/biblioteca$/);
});

test("la biblioteca explica el pago único y no nombra competidores", async ({ page }) => {
  const resp = await page.goto("/biblioteca");
  const html = ((await resp!.text()) ?? "").toLowerCase();

  await expect(page.getByRole("heading", { name: /Pago único/ })).toBeVisible();
  // Las 120 tarjetas del catálogo también usan dt/dd: hay que escopear al comparativo.
  await expect(page.locator("#comparacion-pago-unico dt")).toHaveCount(6);
  await expect(page.getByText(/US\$ 48 a 85 por año/)).toBeVisible();

  // La comparación es de modelo, no de marcas: nada de nombrar a terceros.
  for (const marca of ["toplidercoach", "easy2coach", "coaching manual", "futbolsesion", "cruyff"]) {
    expect(html).not.toContain(marca);
  }
});

test("el cierre de la biblioteca muestra el precio tachado", async ({ page }) => {
  await page.goto("/biblioteca");

  const cierre = page.locator("section").filter({ hasText: "Llevate las 120 fichas" });
  await expect(cierre.getByText(PRECIO)).toBeVisible();
  await expect(cierre.locator(".line-through")).toContainText(LISTA);
  await expect(cierre).toContainText("Oferta lanzamiento");
});
