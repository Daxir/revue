import { expect, test } from "@playwright/test";
import { UserType } from "@prisma/client";
import { loginAs, registerRandomUser } from "./helpers/auth.helper";

const testIds = [7, 9].map((id) => `user-review-${id}`);

test.describe("Given User Reviews Page", () => {
  test.describe(`When "My Reviews" from menu is clicked`, () => {
    test.describe("When user has own reviews", () => {
      test("then all of this reviews is displayed", async ({ page }) => {
        await loginAs(UserType.USER, page);
        await page.waitForSelector("#homepage-logo");
        await page.goto("http://localhost:3000/my-reviews");
        for (const testId of testIds) {
          await expect(page.getByTestId(testId)).toBeVisible();
        }
      });
      test.describe("and any user review is clicked", () => {
        test("then user is redirected to specific by review product page", async ({
          page,
        }) => {
          await loginAs(UserType.USER, page);
          await page.waitForSelector("#homepage-logo");
          await page.goto("http://localhost:3000/my-reviews");
          await page.getByTestId(testIds[1]).click();
          expect(page.url()).toBe("http://localhost:3000/products/2");
        });
      });
    });
    test.describe("When user hasn't any own reviews", () => {
      test("then 404 page is displayed", async ({ page }) => {
        await registerRandomUser(page);
        await page.waitForSelector("#homepage-logo");
        await page.goto("http://localhost:3000/my-reviews");
        await expect(page.getByTestId("empty-state")).toBeVisible();
      });
    });
  });
});
