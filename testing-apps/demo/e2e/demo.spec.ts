import { expect, test } from "@playwright/test";

test.describe("demo", () => {

  test("getItem()", async ({ page }) => {

    await page.goto("/");

    const data = await page.locator("#get-item").textContent();

    expect(data).toBe("hello world");

  });

  test("schema error", async ({ page }) => {

    await page.goto("/");

    const data = await page.locator("#schema-error").textContent();

    expect(data).toBe("schema error");

  });

  test("length", async ({ page }) => {

    await page.goto("/");

    const data = Number.parseInt(await page.locator("#length").textContent() ?? "0", 10);

    expect(data).toBeGreaterThan(1);

  });

  test("keys", async ({ page }) => {

    await page.goto("/");

    const data = (await page.locator("#keys").textContent() ?? "").split(",").length;

    expect(data).toBeGreaterThan(1);

  });

  test("service", async ({ page }) => {

    await page.goto("/");

    const data = await page.locator("#service").textContent();

    expect(data).toBe("service");

  });

  test("removeItem", async ({ page }) => {

    await page.goto("/");

    const data = await page.locator("#remove-item").textContent();

    expect(data).toBe("removeItem");

  });

  test("clear", async ({ page }) => {

    await page.goto("/");

    const data = await page.locator("#clear").textContent();

    expect(data).toBe("clear");

  });

  test("has", async ({ page }) => {

    await page.goto("/");

    const data = await page.locator("#has").textContent();

    expect(data).toBe("has");

  });

});
