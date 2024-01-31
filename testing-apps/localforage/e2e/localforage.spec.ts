import { expect, test } from "@playwright/test";

test.describe("localforage", () => {

  test("interoperability", async ({ page }) => {

    await page.goto("/");

    const data = await page.locator("h1").textContent();

    expect(data).toBe("hello world");

  });

  test("lazy loading", async ({ page }) => {

    await page.goto("/");

    await page.waitForSelector("h1");

    await page.goto("/lazy");

    const data = await page.locator("#lazy").textContent();

    expect(data).toBe("hello world");

  });

});
