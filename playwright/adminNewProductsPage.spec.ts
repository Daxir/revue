import { expect, test } from "@playwright/test";
import { ProductCategory, ProductStatus, UserType } from "@prisma/client";
import { changeStatusOfProduct, getProductsPage } from "~/models/product.server";
import { loginAs } from "./helpers/auth.helper";

test.describe.configure({ mode: 'serial' });

test.describe("Given admin page", () => {
    test.describe("when admin tries to access new products in admin panel when there are new products in the database", () => {
      test("then admin gets list of products with status new", async ({ page }) => {
        await loginAs(UserType.ADMIN, page);
        await page.waitForSelector("#homepage-logo");
        await page.goto("http://localhost:3000/admin/new-products", {
            waitUntil: "networkidle",
          });
        const newProducts = await getProductsPage(
            "",
            1,
            10,
            ["DETERGENT", "DISHWASHER_CUBE", "THERMAL_MUG"],
            "all",
            "NEW"
          );
          const testNames = newProducts.map(
            (product) => `${product.name}`,
          );
          for (const name of testNames) {
            await expect(page.getByText(name)).toBeVisible();
          }
      });

    });

    test.describe("when admin accesses new products in admin panel and tries to add product", () => {
        test("then the product is visible for other users and is no longer on the new products page",  async ({ page }) => {
            await loginAs(UserType.ADMIN, page);
            await page.waitForSelector("#homepage-logo");
            await changeStatusOfProduct(13, ProductStatus.NEW);
            await page.goto("http://localhost:3000/admin/new-products", {
                waitUntil: "networkidle",
              });
            const productName = "Product 13";
            const row = page.locator("tr", { hasText: productName });
            await row.locator("button", {hasText: "Add"}).click();
            await page.getByText("Yes", {exact: true}).click();
            await expect(page.getByText(productName)).toBeHidden();
            await page.goto("http://localhost:3000/products", {
                waitUntil: "networkidle",
              });
            await expect(page.getByText(productName)).toBeVisible();
        });
    });

    test.describe("when admin accesses new products in admin panel and tries to reject product", () => {
        test("then the product is visible for other users and is no longer on the new products page",  async ({ page }) => {
            await loginAs(UserType.ADMIN, page);
            await page.waitForSelector("#homepage-logo");
            await changeStatusOfProduct(14, ProductStatus.NEW);
            await page.goto("http://localhost:3000/admin/new-products", {
                waitUntil: "networkidle",
              });
            const productName = "Product 14";
            const row = page.locator("tr", { hasText: productName });
            await row.locator("button", {hasText: "Delete"}).click();
            await expect(page.getByText(productName)).toBeHidden();
            await page.goto("http://localhost:3000/products", {
                waitUntil: "networkidle",
              });
            await expect(page.getByText(productName)).toBeHidden();
        });
    });
    
    test.describe("when admin tries to access new products in admin panel when there is no new products in the database", () => {
        test("then admin gets empty state page", async ({ page }) => {
          await loginAs(UserType.ADMIN, page);
          await page.waitForSelector("#homepage-logo");
          const newProducts = await getProductsPage(
            "",
            1,
            10,
            ["DETERGENT", "DISHWASHER_CUBE", "THERMAL_MUG"],
            "all",
            "NEW"
          );
          const newProductsIds = newProducts.map(
            (product) => product.productId,
          );
          for (const newProductId of newProductsIds) {
            await changeStatusOfProduct(newProductId, ProductStatus.ACCEPTED)
          }
          await page.goto("http://localhost:3000/admin/new-products", {
            waitUntil: "networkidle",
          });
          await expect(page.getByTestId("empty-state")).toBeVisible();
        });
    });

    test.describe("when admin tries to edit category of new product and submits changes", () => {
        test("then the product is accepted and visible for other users with edited category value", async ({ page }) => {
            await loginAs(UserType.ADMIN, page);
            await page.waitForSelector("#homepage-logo");
            await changeStatusOfProduct(13, ProductStatus.NEW);
            await page.goto("http://localhost:3000/admin/new-products", {
                waitUntil: "networkidle",
              });
            const productName = "Product 13";
            const row = page.locator("tr", { hasText: productName });
            await row.locator("button", {hasText: "Edit"}).click();
            const selectCategory = page.getByLabel("Category");
            await selectCategory.click();
            await page.getByText("Dishwasher cube").click();
            await page.getByText("Submit").click();
            await expect(page.getByText(productName)).toBeHidden();
            await page.goto("http://localhost:3000/products", {
                waitUntil: "networkidle",
              });
            await page.getByTestId("category-select-button").click();
            await page.getByTestId(`category-${ProductCategory.DISHWASHER_CUBE}-checkbox`).check();
            await expect(page.getByText(productName)).toBeVisible();
        });
    });
    test.describe("when admin tries to edit description of new product and submits changes", () => {
        test("then the product is accepted and visible for other users with edited description value", async ({ page }) => {
          await loginAs(UserType.ADMIN, page);
          await page.waitForSelector("#homepage-logo");
          await changeStatusOfProduct(14, ProductStatus.NEW);
          await page.goto("http://localhost:3000/admin/new-products", {
            waitUntil: "networkidle",
          });
            const productName = "Product 14";
            const row = page.locator("tr", { hasText: productName });
            await row.locator("button", {hasText: "Edit"}).click();
            await page.getByRole("textbox", { name: "description" }).fill("Edit test description");
            await page.getByText("Submit").click();
            await expect(page.getByText(productName)).toBeHidden();
            await page.goto("http://localhost:3000/products", {
                waitUntil: "networkidle",
              });
            await expect(page.getByText(productName)).toBeVisible();
            await page.goto("http://localhost:3000/products/14", {
                waitUntil: "networkidle",
              });
            await expect(page.getByText("Edit test description")).toBeVisible();
        });
    });

    test.describe("when admin tries to edit name of new product and submits changes", () => {
        test("then the product is accepted and visible for other users with edited name", async ({ page }) => {
          await loginAs(UserType.ADMIN, page);
          await page.waitForSelector("#homepage-logo");
          await changeStatusOfProduct(13, ProductStatus.NEW);
          await page.goto("http://localhost:3000/admin/new-products", {
            waitUntil: "networkidle",
          });
            const productName = "Product 13";
            const newProductName = "TEST PRODUCT NAME";
            const row = page.locator("tr", { hasText: productName });
            await row.locator("button", {hasText: "Edit"}).click();
            await page.getByRole("textbox", { name: "name" }).fill(newProductName);
            await page.getByText("Submit").click();
            await expect(page.getByText(newProductName)).toBeHidden();
            await page.goto("http://localhost:3000/products", {
                waitUntil: "networkidle",
              });
            await expect(page.getByText(newProductName)).toBeVisible();
            await changeStatusOfProduct(13, ProductStatus.NEW);
            await page.goto("http://localhost:3000/admin/new-products", {
                waitUntil: "networkidle",
            });
            const row2 = page.locator("tr", { hasText: newProductName });
            await row2.locator("button", {hasText: "Edit"}).click();
            await page.getByRole("textbox", { name: "name" }).fill(productName);
            await page.getByText("Submit").click();
        });
    });

    
    test.describe("when admin tries to edit manufacturer of new product and submits changes", () => {
        test("then the product is accepted and visible for other users with edited manufacturer", async ({ page }) => {
          await loginAs(UserType.ADMIN, page);
          await page.waitForSelector("#homepage-logo");
          await changeStatusOfProduct(14, ProductStatus.NEW);
          await page.goto("http://localhost:3000/admin/new-products", {
            waitUntil: "networkidle",
          });
            const productName = "Product 14";
            const row = page.locator("tr", { hasText: productName });
            await row.locator("button", {hasText: "Edit"}).click();
            await page.getByRole("textbox", { name: "manufacturer" }).fill("new manufacturer test");
            await page.getByText("Submit").click();
            await page.goto("http://localhost:3000/products/14", {
                waitUntil: "networkidle",
              });
            await expect(page.getByText("new manufacturer test")).toBeVisible();
        });
    });


    test.describe("when admin tries to leave empty manufacturer of new product and tries to submit changes", () => {
        test("then the product is not added", async ({ page }) => {
          await loginAs(UserType.ADMIN, page);
          await page.waitForSelector("#homepage-logo");
          await changeStatusOfProduct(14, ProductStatus.NEW);
          await page.goto("http://localhost:3000/admin/new-products", {
            waitUntil: "networkidle",
          });
            const productName = "Product 14";
            const row = page.locator("tr", { hasText: productName });
            await row.locator("button", {hasText: "Edit"}).click();
            await page.getByRole("textbox", { name: "manufacturer" }).fill("");
            await page.getByText("Submit").click();
            await page.goto("http://localhost:3000/admin/new-products", {
                waitUntil: "networkidle",
              });
            await expect(page.getByText(productName)).toBeVisible();
        });
    });


})