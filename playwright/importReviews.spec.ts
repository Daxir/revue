import { expect, Page, test } from "@playwright/test";
import { UserType } from "@prisma/client";
import { loginAs } from "./helpers/auth.helper";
import { prisma } from "~/db.server";

test.describe.configure({ mode: 'serial' });

async function importAndVerify(products: number[], contents: number, page: Page) {
    await page.locator("button", { hasText: "Import" }).click();
    await page.waitForSelector('div.mantine-Modal-title');
    await page.locator("span", { hasText: "OK" }).click();
    for (const product of products) {
        await page.goto("http://localhost:3000/products/" + String(product), {
        waitUntil: "networkidle",
        });
        await expect(page.locator("div.mantine-Blockquote-body", { hasText: "Content" })).toHaveCount(contents);

    };
}

test.beforeEach(async ({ page }) => {
    await loginAs(UserType.ADMIN, page);
    await page.waitForSelector("#homepage-logo");
    await page.goto("http://localhost:3000/admin/reviews", {
          waitUntil: "networkidle",
        });
  });

test.describe("Given import page", () => {

  test.describe("when admin loads a valid CSV file", () => {

    test.afterEach(async ({}) => {
        await prisma.review.updateMany({
          where: {
            content: {
                path: ['description'],
                string_contains: "Content",
            }},
            data: {
              status: "REJECTED",
            }
        });
      });

    // 3.3.8.1a
    test("where file has one valid review for one product", async ({ page }) => {
        await page.setInputFiles('input[type="file"]', './playwright/fixtures/valid_one_review.csv');
        await expect(page.locator("h4", { hasText: "Product 1" })).toBeVisible();
        await expect(page.locator("div.mantine-Text-root", { hasText: "Reviews found 1" })).toBeVisible();
        await importAndVerify([1], 1, page);
    });

    // 3.3.8.1b
    test("where file has one valid review for two products each", async ({ page }) => {
        await page.setInputFiles('input[type="file"]', './playwright/fixtures/valid_many_products.csv');
        await expect(page.locator("h4", { hasText: "Product 1" })).toBeVisible();
        await expect(page.locator("h4", { hasText: "Product 2" })).toBeVisible();
        await expect(page.locator("div.mantine-Text-root", { hasText: "Reviews found 1" })).toHaveCount(2);
        await importAndVerify([1, 2], 1, page);
    });

    // 3.3.8.1c
    test("where file has more than one valid reviews for one product", async ({ page }) => {
        await page.setInputFiles('input[type="file"]', './playwright/fixtures/valid_many_reviews.csv');
        await expect(page.locator("h4", { hasText: "Product 1" })).toBeVisible();
        await expect(page.locator("div.mantine-Text-root", { hasText: "Reviews found 3" })).toBeVisible();
        await importAndVerify([1], 3, page);
    });

    // 3.3.8.3a (?)
    test("where file has no reviews for known products", async ({ page }) => {
        await page.setInputFiles('input[type="file"]', './playwright/fixtures/valid_no_product.csv');
        await expect(page.locator("h4", { hasText: "Product not found" })).toBeVisible();
        await expect(page.locator("div.mantine-Text-root", { hasText: "Reviews found 4" })).toBeVisible();
    });

    // 3.3.8.3b (?)
    test("where file has some broken rows", async ({ page }) => {
        await page.setInputFiles('input[type="file"]', './playwright/fixtures/valid_brken_rows.csv');
        await expect(page.locator("h4", { hasText: "Product 1" })).toBeVisible();
        await expect(page.locator("div.mantine-Text-root", { hasText: "Reviews found 1" })).toBeVisible();
        await expect(page.locator("button", { hasText: "Show unrecognized rows (4)" })).toBeVisible();
        await importAndVerify([1], 1, page);
    });
  });

  test.describe("when admin loads an invalid CSV file", () => {

    // 3.3.8.2
    test("where file is empty", async ({ page }) => {
        await page.setInputFiles('input[type="file"]', './playwright/fixtures/invalid_empty.csv');
        await expect(page.locator("div.mantine-Modal-title", { hasText: "No header" })).toBeVisible();
        await page.locator("span", { hasText: "OK" }).click();
        await expect(page.locator("button", { hasText: "Show unrecognized rows" })).toBeHidden();
    });

    // 3.3.8.4a
    test("where file has no header", async ({ page }) => {
        await page.setInputFiles('input[type="file"]', './playwright/fixtures/invalid_no_header.csv');
        await expect(page.locator("div.mantine-Modal-title", { hasText: "No header" })).toBeVisible();
        await page.locator("span", { hasText: "OK" }).click();
        await expect(page.locator("button", { hasText: "Show unrecognized rows (4)" })).toBeVisible();
    });

    // 3.3.8.4b
    test("where file has only broken rows", async ({ page }) => {
        await page.setInputFiles('input[type="file"]', './playwright/fixtures/invalid_broken_rows.csv');
        await expect(page.locator("button", { hasText: "Show unrecognized rows (5)" })).toBeVisible();
    });


  });
//
});