import { expect, test } from "@playwright/test";

/**
 * La biblioteca publica las 120 fichas en el catálogo, pero solo 15 abren el
 * contenido. Estas pruebas cuidan las dos cosas: que los filtros funcionen y
 * que el contenido cerrado no se sirva en la página.
 */

const BASE = "/biblioteca";

test("el catálogo arranca con los 120 ejercicios", async ({ page }) => {
  await page.goto(BASE);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("120 ejercicios");
  await expect(page.getByText(/120 de 120 ejercicios|120.*de.*120/).first()).toBeVisible();
  await expect(page.locator("article").first()).toBeVisible();
});

test("los filtros por nivel y objetivo reducen la lista", async ({ page }) => {
  await page.goto(BASE);
  const total = await page.locator("article").count();
  expect(total).toBeGreaterThan(0);

  // Nivel: Infantil
  await page.getByRole("button", { name: "Infantil", exact: true }).click();
  const infantil = await page.locator("article").count();
  expect(infantil).toBeGreaterThan(0);
  expect(infantil).toBeLessThan(total);

  // Objetivo: Transición, combinado con el nivel
  await page.getByRole("button", { name: "Transición", exact: true }).click();
  const combinado = await page.locator("article").count();
  expect(combinado).toBeGreaterThan(0);
  expect(combinado).toBeLessThanOrEqual(infantil);

  // Limpiar vuelve al total
  await page.getByRole("button", { name: "Limpiar" }).click();
  expect(await page.locator("article").count()).toBe(total);
});

test("la búsqueda por código encuentra el ejercicio", async ({ page }) => {
  await page.goto(BASE);
  await page.getByLabel("Buscar ejercicio").fill("PRO-32");
  await expect(page.locator("article")).toHaveCount(1);
  await expect(page.locator("article").first()).toContainText("PRO-32");
});

test("una ficha de muestra abre su diagrama y cierra con Escape", async ({ page }) => {
  await page.goto(BASE);
  await page.getByLabel("Buscar ejercicio").fill("INF-02");
  await page.getByRole("button", { name: "Ver ficha completa" }).click();

  // El carrito también es un diálogo: hay que apuntar al de la ficha.
  const dialogo = page.locator('[aria-labelledby="ficha-titulo"]');
  await expect(dialogo).toBeVisible();
  await expect(dialogo).toContainText("Cómo se hace");
  await expect(dialogo).toContainText("Variantes");
  await expect(dialogo).toContainText("Error común");

  // El diagrama se dibujó de verdad, no es un recuadro vacío.
  const svg = dialogo.locator('svg[role="img"]');
  await expect(svg).toBeVisible();
  await expect(svg).toHaveAttribute("viewBox", "0 0 466 234");
  expect(await svg.locator("circle, path, rect").count()).toBeGreaterThan(10);

  await page.keyboard.press("Escape");
  await expect(dialogo).toBeHidden();
});

test("las fichas cerradas no traen contenido y ofrecen la biblioteca", async ({ page }) => {
  await page.goto(BASE);
  await page.getByLabel("Buscar ejercicio").fill("PRO-01");

  const tarjeta = page.locator("article").first();
  await expect(tarjeta).toContainText("PRO-01");
  await expect(tarjeta.getByRole("button", { name: /Se abre con la biblioteca/ })).toBeVisible();
  await expect(tarjeta.getByRole("button", { name: "Ver ficha completa" })).toHaveCount(0);
});

test("el contenido de las fichas cerradas no viaja en la página", async ({ page }) => {
  const resp = await page.goto(BASE);
  const html = (await resp!.text()) ?? "";

  // Cualquier desarrollo pertenece al módulo que se carga al abrir, no al HTML inicial.
  expect(html).not.toContain("Cómo se hace</h3>");
  expect(html).not.toContain("url(#");
});
