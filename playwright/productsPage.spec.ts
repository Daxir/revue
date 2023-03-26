import { expect, test } from "@playwright/test";
import { ProductCategory } from "@prisma/client";
import { getProductsPage } from "~/models/product.server";

test.describe("Given Products Page", () => {
  test.describe("when user comes to page", () => {
    test("loads all of products", async ({ page }) => {
      await page.goto("http://localhost:3000/products");

      const productsFromDatabase = await getProductsPage(
        "",
        1,
        10,
        ["DETERGENT", "DISHWASHER_CUBE", "THERMAL_MUG"],
        "all",
        "ACCEPTED"
      );

      const testIds = productsFromDatabase.map(
        (product) => `product-${product.productId}`,
      );

      for (const testId of testIds) {
        await expect(page.getByTestId(testId)).toBeVisible();
      }
    });
  });
  test.describe("when user searches for non existing products", () => {
    test("then it displays no products found", async ({ page }) => {
      await page.goto("http://localhost:3000/products");

      await page.getByTestId("search-input").fill("non existing product");

      await expect(page.getByTestId("empty-state")).toBeVisible();
    });
  });
  test.describe("when user filters displayed categories", () => {
    test("then it displays only products from selected categories", async ({
      page,
    }) => {
      await page.goto("http://localhost:3000/products");

      await page.getByTestId("category-select-button").click();

      await expect(page.getByTestId("category-select-popover")).toBeVisible();

      await page
        .getByTestId(`category-${ProductCategory.DETERGENT}-checkbox`)
        .check();

      await expect(page.getByTestId("product-1")).toBeVisible();
      await expect(page.getByTestId("product-2")).toBeHidden();
      await expect(page.getByTestId("product-3")).toBeHidden();
    });
    test("then the url is updated with selected categories", async ({
      page,
    }) => {
      await page.goto("http://localhost:3000/products");

      await page.getByTestId("category-select-button").click();

      await expect(page.getByTestId("category-select-popover")).toBeVisible();

      await page
        .getByTestId(`category-${ProductCategory.DETERGENT}-checkbox`)
        .check();

      await expect(page).toHaveURL(/categories=DETERGENT/);
    });
  });
  test.describe("when user changes the region", () => {
    test("then it displays only products from selected region", async ({
      page,
    }) => {
      await page.goto("http://localhost:3000/products");

      await page.getByTestId("region-picker").click();

      await page.getByTestId("region-picker-uk").click();

      await expect(page.getByTestId("product-1")).toBeHidden();
      await expect(page.getByTestId("product-2")).toBeVisible();
      await expect(page.getByTestId("product-3")).toBeVisible();
    });
    test("then the url is updated with selected region", async ({ page }) => {
      await page.goto("http://localhost:3000/products");

      await page.getByTestId("region-picker").click();

      await page.getByTestId("region-picker-uk").click();

      await expect(page).toHaveURL(/region=uk/);
    });
  });
});
