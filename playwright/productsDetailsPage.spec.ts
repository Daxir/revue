import { expect, test } from "@playwright/test";

test.describe("Given Product Detail Page", () => {
  test.describe("when user comes to existing product", () => {
    test("then it display correct number of features", async ({ page }) => {
      await page.goto("http://localhost:3000/products/1");

      const testIds = ["detail-Lorem", "detail-Ipsum"];

      for (const testId of testIds) {
        await expect(page.getByTestId(testId)).toBeVisible();
      }
    });

    test("then it display correct number of countries", async ({ page }) => {
      await page.goto("http://localhost:3000/products/1");

      const testIds = ["flag-PL", "flag-DE"];

      expect(testIds?.length).toBe(2);

      for (const testId of testIds) {
        await expect(page.getByTestId(testId)).toBeVisible();
      }
    });
  });

  test.describe("when user comes to non existing product", () => {
    test("then it displays 404 page", async ({ page }) => {
      await page.goto("http://localhost:3000/products/2137");

      await expect(page.getByTestId("not-found-component")).toBeVisible();
    });
  });

  test.describe("when user comes to a product page with no accepted reviews", () => {
    test("then there are no reviews", async ({ page }) => {
      await page.goto("http://localhost:3000/products/3");
      await expect(
        page.getByText("No one has reviewed this product yet.", {
          exact: true,
        }),
      ).toBeVisible();
    });
  });

  test.describe("when user comes to a product page with accepted and rejected reviews", () => {
    test("then accepted reviews are listed", async ({ page }) => {
      await page.goto("http://localhost:3000/products/1");

      const testIds = [1].map((id) => `review-${id}`);

      for (const testId of testIds) {
        await expect(page.getByTestId(testId)).toBeVisible();
      }
    });

    test("then rejected and new reviews are not listed", async ({ page }) => {
      await page.goto("http://localhost:3000/products/1");

      const testIds = [7, 8].map((id) => `review-${id}`);

      for (const testId of testIds) {
        await expect(page.getByTestId(testId)).toBeHidden();
      }
    });
  });

  test.describe("when user views product", () => {
    test("then products with same category should be seen", async ({
      page,
    }) => {
      await page.goto("http://localhost:3000/products/1");

      const similarProductIds = [4, 5, 8].map((id) => `product-${id}`);

      for (const simProdId of similarProductIds) {
        await expect(page.getByTestId(simProdId)).toBeVisible();
      }
    });

    test("then linked products should be seen", async ({ page }) => {
      await page.goto("http://localhost:3000/products/11");

      const similarProductIds = [12].map((id) => `product-${id}`);

      for (const simProdId of similarProductIds) {
        await expect(page.getByTestId(simProdId)).toBeVisible();
      }
    });
  });
});
