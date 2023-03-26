import { expect, test } from "@playwright/test";
import { UserType } from "@prisma/client";
import { getProductsPage } from "~/models/product.server";
import { getParsedProductContent } from "~/utils";
import { loginAs } from "./helpers/auth.helper";

test.describe("Given linking products", () => {
  test.describe("products should be linked", () => {
    test("when given products have the same name and different countries", async ({
      page,
    }) => {
      await loginAs(UserType.ADMIN, page);
      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/admin/products", {
        waitUntil: "networkidle",
      });

      const productName = "Proszek pierdzioszek";
      const firstProductId = 4;
      const secondProductId = 5;

      expect(
        await page.getByTestId(`checkbox-${firstProductId}`).isVisible(),
      ).toBeTruthy();
      await page.getByTestId(`checkbox-${firstProductId}`).check();
      await expect(
        page.getByTestId(`checkbox-${firstProductId}`),
      ).toBeChecked();

      expect(
        await page.getByTestId(`checkbox-${secondProductId}`).isVisible(),
      ).toBeTruthy();
      await page.getByTestId(`checkbox-${secondProductId}`).check();
      await expect(
        page.getByTestId(`checkbox-${secondProductId}`),
      ).toBeChecked();

      await page.getByTestId("link").click();

      const productsFromDatabaseAfterLink = await getProductsPage(
        productName,
        1,
        10,
        ["DETERGENT"],
        "",
        "all",
      );

      const products = productsFromDatabaseAfterLink
        .map((product) => {
          return getParsedProductContent(product);
        })
        .map((parsedProduct) => {
          return {
            productId: parsedProduct.productId,
            linkedProducts: parsedProduct.content.linked_products,
          };
        });

      const firstProduct = products.find(
        (product) => product.productId === firstProductId,
      );
      const secondProduct = products.find(
        (product) => product.productId === secondProductId,
      );
      expect(firstProduct?.linkedProducts[0]).toEqual(secondProduct?.productId);
      expect(secondProduct?.linkedProducts[0]).toEqual(firstProduct?.productId);
    });

    test("when given products have the same manufacturer", async ({ page }) => {
      await loginAs(UserType.ADMIN, page);
      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/admin/products", {
        waitUntil: "networkidle",
      });

      const productName = "Proszek pierdzioszek";
      const firstProductId = 7;
      const secondProductId = 8;

      expect(
        await page.getByTestId(`checkbox-${firstProductId}`).isVisible(),
      ).toBeTruthy();
      await page.getByTestId(`checkbox-${firstProductId}`).check();
      await expect(
        page.getByTestId(`checkbox-${firstProductId}`),
      ).toBeChecked();

      expect(
        await page.getByTestId(`checkbox-${secondProductId}`).isVisible(),
      ).toBeTruthy();
      await page.getByTestId(`checkbox-${secondProductId}`).check();
      await expect(
        page.getByTestId(`checkbox-${secondProductId}`),
      ).toBeChecked();

      await page.getByTestId("link").click();

      const productsFromDatabaseAfterLink = await getProductsPage(
        productName,
        1,
        10,
        ["DETERGENT", "THERMAL_MUG"],
        "",
        "all",
      );

      const products = productsFromDatabaseAfterLink
        .map((product) => {
          return getParsedProductContent(product);
        })
        .filter((parsedProduct) => {
          parsedProduct.content.manufacturer === "Merol";
        })
        .map((parsedProduct) => {
          return {
            productId: parsedProduct.productId,
            linkedProducts: parsedProduct.content.linked_products,
          };
        });

      const firstProduct = products.find(
        (product) => product.productId === firstProductId,
      );
      const secondProduct = products.find(
        (product) => product.productId === secondProductId,
      );
      expect(firstProduct?.linkedProducts[0]).toEqual(secondProduct?.productId);
      expect(secondProduct?.linkedProducts[0]).toEqual(firstProduct?.productId);
    });

    test("when given products have the same category", async ({ page }) => {
      await loginAs(UserType.ADMIN, page);
      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/admin/products", {
        waitUntil: "networkidle",
      });

      const productName = "Proszek pierdzioszek";
      const firstProductId = 9;
      const secondProductId = 10;

      expect(
        await page.getByTestId(`checkbox-${firstProductId}`).isVisible(),
      ).toBeTruthy();
      await page.getByTestId(`checkbox-${firstProductId}`).check();
      await expect(
        page.getByTestId(`checkbox-${firstProductId}`),
      ).toBeChecked();

      expect(
        await page.getByTestId(`checkbox-${secondProductId}`).isVisible(),
      ).toBeTruthy();
      await page.getByTestId(`checkbox-${secondProductId}`).check();
      await expect(
        page.getByTestId(`checkbox-${secondProductId}`),
      ).toBeChecked();

      await page.getByTestId("link").click();

      const productsFromDatabaseAfterLink = await getProductsPage(
        productName,
        1,
        10,
        ["DETERGENT"],
        "",
        "all",
      );

      const products = productsFromDatabaseAfterLink
        .map((product) => {
          return getParsedProductContent(product);
        })
        .map((parsedProduct) => {
          return {
            productId: parsedProduct.productId,
            linkedProducts: parsedProduct.content.linked_products,
          };
        });

      const firstProduct = products.find(
        (product) => product.productId === firstProductId,
      );
      const secondProduct = products.find(
        (product) => product.productId === secondProductId,
      );
      expect(firstProduct?.linkedProducts[0]).toEqual(secondProduct?.productId);
      expect(secondProduct?.linkedProducts[0]).toEqual(firstProduct?.productId);
    });
  });

  test.describe("products should not be linked", () => {
    test("when given products have the same name and same country", async ({
      page,
    }) => {
      await loginAs(UserType.ADMIN, page);
      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/admin/products", {
        waitUntil: "networkidle",
      });

      const firstProductId = 4;
      const secondProductId = 6;

      expect(
        await page.getByTestId(`checkbox-${firstProductId}`).isVisible(),
      ).toBeTruthy();
      await page.getByTestId(`checkbox-${firstProductId}`).check();
      await expect(
        page.getByTestId(`checkbox-${firstProductId}`),
      ).toBeChecked();

      expect(
        await page.getByTestId(`checkbox-${secondProductId}`),
      ).toBeHidden();

      await expect(page.getByTestId("link")).toBeDisabled();
    });

    test("when only one product is checked", async ({ page }) => {
      await loginAs(UserType.ADMIN, page);
      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/admin/products", {
        waitUntil: "networkidle",
      });

      const productId = 4;

      expect(
        await page.getByTestId(`checkbox-${productId}`).isVisible(),
      ).toBeTruthy();
      await page.getByTestId(`checkbox-${productId}`).check();
      await expect(page.getByTestId(`checkbox-${productId}`)).toBeChecked();

      await expect(page.getByTestId("link")).toBeDisabled();
    });
  });
});
