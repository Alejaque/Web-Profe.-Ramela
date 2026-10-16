import { expect, test } from "@playwright/test";

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test(`ofertas, beneficio y carrito en ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    const infantil = page.locator("article").filter({ has: page.getByRole("heading", { name: "Formación en Fútbol Infantil", exact: true }) });
    const juvenil = page.locator("article").filter({ has: page.getByRole("heading", { name: "Formación en Fútbol Juvenil", exact: true }) });
    const pack = page.locator("article").filter({ has: page.getByRole("heading", { name: "Pack Infantil + Juvenil", exact: true }) });
    await expect(infantil.locator("del")).toHaveText(/44\.900/);
    await expect(juvenil.locator("del")).toHaveText(/54\.900/);
    await expect(infantil).toContainText(/34\.900/);
    await expect(juvenil).toContainText(/39\.900/);
    await expect(pack).toContainText(/69\.900/);
    await expect(pack).toContainText(/74\.800/);
    await expect(pack).toContainText(/4\.900/);
    const benefit = juvenil.getByRole("link", { name: "Validar mi compra del Infantil" });
    const url = new URL((await benefit.getAttribute("href"))!);
    expect(url.hostname).toBe("wa.me");
    expect(url.searchParams.get("text")).toMatch(/34\.900/);
    expect(url.searchParams.get("text")).toContain("antes de pagar");
    // Los próximos lanzamientos siguen deshabilitados.
    await expect(page.getByRole("button", { name: "Próximamente", exact: true }).first()).toBeDisabled();
    await infantil.getByRole("button", { name: "Agregar al carrito" }).click();
    await juvenil.getByRole("button", { name: "Agregar al carrito" }).click();
    await juvenil.getByRole("button", { name: /En tu carrito/ }).click();
    const cart = page.getByRole("dialog");
    await expect(cart).toBeVisible();
    await expect(cart).toContainText(/74\.800/);
    await cart.getByRole("button", { name: /Cambiar al pack de los dos/ }).click();
    await expect(cart).toContainText(/69\.900/);
    await expect(cart.getByRole("button", { name: /Quitar/ })).toHaveCount(1);
    await cart.getByRole("button", { name: "Continuar con la compra" }).click();
    await cart.getByLabel("Nombre y apellido").fill("Prueba sin compra");
    await cart.getByLabel("Email").fill("prueba@example.com");
    await cart.getByLabel("WhatsApp", { exact: true }).fill("3644000000");
    await cart.getByRole("button", { name: /Confirmar pedido/ }).click();
    await expect(cart.getByRole("button", { name: /Pagar.*69\.900.*Mercado Pago/ })).toBeVisible();
    const wa = new URL((await cart.getByRole("link", { name: "Enviar pedido por WhatsApp" }).getAttribute("href"))!);
    expect(wa.searchParams.get("text")).toContain("Pack Infantil + Juvenil");
    expect(wa.searchParams.get("text")).toMatch(/69\.900/);
    // Prueba del retorno de error; nunca se envía una preferencia ni un cobro real.
    await page.route("**/api/mp", async (route) => {
      expect(route.request().postDataJSON().slugs).toEqual(["pack-infantil-juvenil"]);
      await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Prueba controlada" }) });
    });
    await cart.getByRole("button", { name: /Pagar.*Mercado Pago/ }).click();
    await expect(cart).toContainText("Usá la transferencia de abajo");
    await expect(cart).toContainText("aleramela");
    await cart.getByRole("button", { name: "Cerrar carrito" }).click();
    await pack.scrollIntoViewIfNeeded();
    await expect(page.locator("body")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/ofertas-${viewport.width}.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
}

test("retorno sin pago verificado no promete aprobación ni muestra material", async ({ page }) => {
  await page.goto("/?pago=ok");
  await expect(page.getByRole("heading", { name: "Revisemos tu pago" })).toBeVisible();
  await expect(page.getByText("¡Pago confirmado!", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /^Abrir:/ })).toHaveCount(0);
});

test("pack aprobado muestra ambos cursos y nunca el contenedor", async ({ page }) => {
  await page.route("**/api/entrega?*", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ items: [
      { slug: "curso-infantil", name: "Formación en Fútbol Infantil", url: "https://example.com/infantil" },
      { slug: "curso-juvenil", name: "Formación en Fútbol Juvenil", url: null },
    ] }),
  }));
  await page.goto("/?pago=ok&payment_id=123456789");
  await expect(page.getByRole("heading", { name: "¡Pago confirmado!" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Abrir: Formación en Fútbol Infantil" })).toHaveAttribute("href", "https://example.com/infantil");
  await expect(page.getByText("Formación en Fútbol Juvenil: te lo enviamos por WhatsApp.", { exact: true })).toBeVisible();
});
