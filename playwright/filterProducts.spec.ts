import { expect, test } from "@playwright/test";

test.describe("given product page with no user logged in", () => {
  test.describe("when filtered by name 'Product 3'", () => {
    test("then should find product with name 'Product 3'", async ({ page }) => {
      await page.goto("http://localhost:3000/products", {
        waitUntil: "networkidle",
      });

      await page.getByRole("searchbox", { name: "Search" }).fill("Product 3");

      const row = page.locator("a", { hasText: "Product 3" });

      expect(await row.isVisible()).toBeTruthy();
    });
  });

  test.describe("when filtered by name 'unexisting product'", () => {
    test("then should not find any product", async ({ page }) => {
      await page.goto("http://localhost:3000/products", {
        waitUntil: "networkidle",
      });

      await page.getByRole("searchbox", { name: "Search" }).fill("unexisting product");

      const row = page.locator("a", { hasText: "unexisting product" });

      expect(await row.isVisible()).toBeFalsy();
    });
  });
});
