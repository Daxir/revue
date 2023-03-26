import { expect, test } from "@playwright/test";
import { ProductCategory } from "@prisma/client";
import { getProductsPage } from "~/models/product.server";
import { registerRandomUser } from "./helpers/auth.helper";

test.describe("Given Products Page", () => {
  test.describe("when user comes to page and s/he is logged", () => {
    test("loads all of products", async ({ page }) => {
      await registerRandomUser(page);

      await page.waitForSelector("#homepage-logo");

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
  test.describe("when user searches for non existing products and s/he is logged", () => {
    test("then it displays no products found", async ({ page }) => {
      await registerRandomUser(page);

      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/products");

      await page.getByTestId("search-input").fill("non existing product");

      await expect(page.getByTestId("empty-state")).toBeVisible();
    });
  });
  test.describe("when user filters displayed categories and s/he is logged", () => {
    test("then it displays only products from selected categories", async ({
      page,
    }) => {
      await registerRandomUser(page);

      await page.waitForSelector("#homepage-logo");

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
    test("then the url is updated with selected categories and s/he is logged", async ({
      page,
    }) => {
      await registerRandomUser(page);

      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/products");

      await page.getByTestId("category-select-button").click();

      await expect(page.getByTestId("category-select-popover")).toBeVisible();

      await page
        .getByTestId(`category-${ProductCategory.DETERGENT}-checkbox`)
        .check();

      await expect(page).toHaveURL(/categories=DETERGENT/);
    });
  });
  test.describe("when user changes the region and s/he is logged", () => {
    test("then it displays only products from selected region", async ({
      page,
    }) => {
      await registerRandomUser(page);

      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/products");

      await page.getByTestId("region-picker").click();

      await page.getByTestId("region-picker-uk").click();

      await expect(page.getByTestId("product-1")).toBeHidden();
      await expect(page.getByTestId("product-2")).toBeVisible();
      await expect(page.getByTestId("product-3")).toBeVisible();
    });
    test("then the url is updated with selected region", async ({ page }) => {
      await registerRandomUser(page);

      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/products");

      await page.getByTestId("region-picker").click();

      await page.getByTestId("region-picker-uk").click();

      await expect(page).toHaveURL(/region=uk/);
    });
  });
});

test.describe("Given Product Detail Page", () => {
    test.describe("when user comes to existing product and s/he is logged", () => {
      test("then it display correct number of features", async ({ page }) => {
        await registerRandomUser(page);

        await page.waitForSelector("#homepage-logo");

        await page.goto("http://localhost:3000/products/1");
  
        const testIds = ["detail-Lorem", "detail-Ipsum"];
  
        for (const testId of testIds) {
          await expect(page.getByTestId(testId)).toBeVisible();
        }
      });
  
      test("then it display correct number of countries and s/he is logged", async ({ page }) => {
        await registerRandomUser(page);

        await page.waitForSelector("#homepage-logo");

        await page.goto("http://localhost:3000/products/1");
  
        const testIds = ["flag-PL", "flag-DE"];
  
        expect(testIds?.length).toBe(2);
  
        for (const testId of testIds) {
          await expect(page.getByTestId(testId)).toBeVisible();
        }
      });
    });
  
    test.describe("when user comes to non existing product and s/he is logged", () => {
      test("then it displays 404 page", async ({ page }) => {
        await registerRandomUser(page);

        await page.waitForSelector("#homepage-logo");

        await page.goto("http://localhost:3000/products/2137");
  
        await expect(page.getByTestId("not-found-component")).toBeVisible();
      });
    });
  
    test.describe("when user comes to a product page with no accepted reviews and s/he is logged", () => {
      test("then there are no reviews", async ({ page }) => {
        await registerRandomUser(page);

        await page.waitForSelector("#homepage-logo");

        await page.goto("http://localhost:3000/products/3");
        await expect(
          page.getByText("No one has reviewed this product yet.", {
            exact: true,
          }),
        ).toBeVisible();
      });
    });
  
    test.describe("when user comes to a product page with accepted and rejected reviews and s/he is logged", () => {
      test("then accepted reviews are listed", async ({ page }) => {
        await registerRandomUser(page);

        await page.waitForSelector("#homepage-logo");

        await page.goto("http://localhost:3000/products/1");
  
        const testIds = [1].map((id) => `review-${id}`);
  
        for (const testId of testIds) {
          await expect(page.getByTestId(testId)).toBeVisible();
        }
      });
  
      test("then rejected and new reviews are not listed", async ({ page }) => {
        await registerRandomUser(page);

        await page.waitForSelector("#homepage-logo");

        await page.goto("http://localhost:3000/products/1");
  
        const testIds = [7, 8].map((id) => `review-${id}`);
  
        for (const testId of testIds) {
          await expect(page.getByTestId(testId)).toBeHidden();
        }
      });
    });
  });

  test.describe("Given Region Picker", () => {
    test.describe("when region has been chosen and s/he is logged", () => {
      test("then saves the value in local storage", async ({ page }) => {
        await registerRandomUser(page);

        await page.waitForSelector("#homepage-logo");
        
        await page.goto("http://localhost:3000/");
  
        await page.getByTestId("region-picker").click();
  
        await page.getByTestId("region-picker-uk").click();
  
        let localStorage = await page.context().storageState();
  
        expect(
          JSON.parse(
            localStorage.origins
              .find((origin) => origin.origin === "http://localhost:3000")
              ?.localStorage.find((item) => item.name === "revue-selected-region")
              ?.value ?? "",
          ),
        ).toEqual("uk");
  
        await page.getByTestId("region-picker").click();
  
        await page.getByTestId("region-picker-de").click();
  
        localStorage = await page.context().storageState();
  
        expect(
          JSON.parse(
            localStorage.origins
              .find((origin) => origin.origin === "http://localhost:3000")
              ?.localStorage.find((item) => item.name === "revue-selected-region")
              ?.value ?? "",
          ),
        ).toEqual("de");
  
        await page.getByTestId("region-picker").click();
  
        await page.getByTestId("region-picker-pl").click();
  
        localStorage = await page.context().storageState();
  
        expect(
          JSON.parse(
            localStorage.origins
              .find((origin) => origin.origin === "http://localhost:3000")
              ?.localStorage.find((item) => item.name === "revue-selected-region")
              ?.value ?? "",
          ),
        ).toEqual("pl");
      });
    });
  });
  
