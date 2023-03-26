import { expect, test } from "@playwright/test";
import { UserType } from "@prisma/client";
import { changeReviewToNewById } from "~/models/review.server";
import { loginAs } from "./helpers/auth.helper";

test.describe("Given moderator page", () => {
  test.describe("when logged user with moderator permissions tries to access the page", () => {
    const reviewToReject = 5;
    const reviewToAccept = 6;
    test.beforeEach(async () => {
      await changeReviewToNewById(reviewToAccept);
      await changeReviewToNewById(reviewToReject);
    });
    test("then moderator is directed to Moderator Panel", async ({ page }) => {
      await loginAs(UserType.MODERATOR, page);
      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/moderator");

      await expect(page).toHaveURL(/\/moderator/);
      await expect(page.getByTestId("moderator-page")).toBeVisible();
    });
    test("then list of new reviews is displayed", async ({ page }) => {
      await loginAs(UserType.MODERATOR, page);
      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/moderator");

      const testIds = [3, 4].map((id) => `review-${id}`);

      for (const testId of testIds) {
        await expect(page.getByTestId(testId)).toBeVisible();
      }
    });
    test("then accepted and rejected reviews are not displayed", async ({
      page,
    }) => {
      await loginAs(UserType.MODERATOR, page);
      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/moderator");

      const testIds = [1, 2, 7].map((id) => `review-${id}`);

      for (const testId of testIds) {
        await expect(page.getByTestId(testId)).toBeHidden();
      }
    });
    test("then they can accept a review", async ({ page }) => {
      await loginAs(UserType.MODERATOR, page);
      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/moderator", {
        waitUntil: "networkidle",
      });

      const productId = 1;
      const reviewTestId = `review-row-${reviewToAccept}`;

      await page
        .getByTestId(reviewTestId)
        .getByText("Accept", { exact: true })
        .click();

      await expect(page.getByTestId(reviewTestId)).toBeHidden();

      await page.goto(`http://localhost:3000/products/${productId}`, {
        waitUntil: "networkidle",
      });

      await expect(page.getByTestId(`review-${reviewToAccept}`)).toBeVisible();
    });
    test("then they can reject a review", async ({ page }) => {
      await loginAs(UserType.MODERATOR, page);
      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/moderator", {
        waitUntil: "networkidle",
      });

      const productId = 1;
      const reviewTestId = `review-row-${reviewToReject}`;

      await page
        .getByTestId(reviewTestId)
        .getByText("Reject", { exact: true })
        .click();

      await expect(page.getByTestId(reviewTestId)).toBeHidden();

      await page.goto(`http://localhost:3000/products/${productId}`, {
        waitUntil: "networkidle",
      });

      await expect(page.getByTestId(`review-${reviewToReject}`)).toBeHidden();
    });
  });

  test.describe("when logged user with admin perissions tries to access the page", () => {
    test("then they are redirected to the main page", async ({ page }) => {
      await loginAs(UserType.ADMIN, page);
      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/moderator");

      await expect(page).toHaveURL("http://localhost:3000/");
      await expect(page).not.toHaveURL(/\/moderator/);
      await expect(page.getByTestId("moderator-page")).toBeHidden();
    });
  });
  test.describe("when logged user without moderator perissions try to access the page", () => {
    test("then they are redirected to the main page", async ({ page }) => {
      await loginAs(UserType.USER, page);
      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/moderator");

      await expect(page).toHaveURL("http://localhost:3000/");
      await expect(page).not.toHaveURL(/\/moderator/);
      await expect(page.getByTestId("moderator-page")).toBeHidden();
    });
  });

  test.describe("when not logged user tries to access the page", () => {
    test("then they are redirected to the main page", async ({ page }) => {
      await page.goto("http://localhost:3000/moderator");

      await expect(page).toHaveURL("http://localhost:3000/");
      await expect(page).not.toHaveURL(/\/moderator/);
      await expect(page.getByTestId("moderator-page")).toBeHidden();
    });
  });
});
