import { expect, test } from "@playwright/test";
import { getReviewById } from "~/models/review.server";
import { loginUser, registerRandomUser } from "./helpers/auth.helper";

const reviewId = 1;

test.describe("Given Review Thumbs", () => {
  test.describe.serial("when thumb up is clicked as helpful review", () => {
    let userEmail = "";
    test.describe
      .serial("and the user hasn't marked a review as helpful before", () => {
      test("then number of helpfuls increased by 1", async ({ page }) => {
        userEmail = await registerRandomUser(page);
        await page.waitForSelector("#homepage-logo");
        const review = await getReviewById(reviewId);
        expect(review).not.toBeNull();
        await page.goto(`http://localhost:3000/products/${reviewId}`);
        const upvotes = Number(
          await page.getByTestId(`action-upvotes-${reviewId}`).innerHTML(),
        );
        await page.getByTestId(`action-thumb-up-${reviewId}`).click();
        await expect(page.getByTestId(`action-upvotes-${reviewId}`)).toHaveText(
          String(upvotes + 1),
        );
        await page.waitForLoadState("networkidle");
      });
    });
    test.describe
      .serial("and the user has marked a review as helpful before", () => {
      test("then number of helpfuls decreased by 1", async ({ page }) => {
        await loginUser(userEmail, page);
        await page.waitForSelector("#homepage-logo");
        await page.goto(`http://localhost:3000/products/${reviewId}`);
        const review = await getReviewById(reviewId);
        expect(review).not.toBeNull();
        const upvotes = Number(
          await page.getByTestId(`action-upvotes-${reviewId}`).innerHTML(),
        );
        await page.getByTestId(`action-thumb-up-${reviewId}`).click();
        await expect(page.getByTestId(`action-upvotes-${reviewId}`)).toHaveText(
          String(upvotes - 1),
        );
        await page.waitForLoadState("networkidle");
      });
    });
  });
  test.describe.serial("when thumb down is clicked as unhelpful review", () => {
    let userEmail = "";
    test.describe
      .serial("and the user hasn't marked a review as unhelpful before", () => {
      test("then number of unhelpfuls increased by 1", async ({ page }) => {
        userEmail = await registerRandomUser(page);
        await page.waitForSelector("#homepage-logo");
        await page.goto(`http://localhost:3000/products/${reviewId}`);
        const downvotes = Number(
          await page.getByTestId(`action-downvotes-${reviewId}`).innerHTML(),
        );
        const review = await getReviewById(reviewId);
        expect(review).not.toBeNull();
        await page.getByTestId(`action-thumb-down-${reviewId}`).click();
        await expect(
          page.getByTestId(`action-downvotes-${reviewId}`),
        ).toHaveText(String(downvotes + 1));
        await page.waitForLoadState("networkidle");
      });
    });
    test.describe
      .serial("and the user has marked a review as unhelpful before", () => {
      test("then number of unhelpfuls decreased by 1", async ({ page }) => {
        await loginUser(userEmail, page);
        await page.waitForSelector("#homepage-logo");
        const review = await getReviewById(reviewId);
        expect(review).not.toBeNull();
        await page.goto(`http://localhost:3000/products/${reviewId}`);
        const downvotes = Number(
          await page.getByTestId(`action-downvotes-${reviewId}`).innerHTML(),
        );
        await page.getByTestId(`action-thumb-down-${reviewId}`).click();
        await expect(
          page.getByTestId(`action-downvotes-${reviewId}`),
        ).toHaveText(String(downvotes - 1));
        await page.waitForLoadState("networkidle");
      });
    });
  });
  test.describe.serial("when thumb up is clicked as helpful review", () => {
    test.describe
      .serial("and the user hasn marked a review as unhelpful before", () => {
      test("then number of helpfuls increased by 1 and unhelpfuls decreased by 1", async ({
        page,
      }) => {
        await registerRandomUser(page);
        await page.waitForSelector("#homepage-logo");
        const review = await getReviewById(reviewId);
        expect(review).not.toBeNull();
        await page.goto(`http://localhost:3000/products/${reviewId}`);
        await page.getByTestId(`action-thumb-down-${reviewId}`).click();
        const upvotes = Number(
          await page.getByTestId(`action-upvotes-${reviewId}`).innerHTML(),
        );
        const downvotes = Number(
          await page.getByTestId(`action-downvotes-${reviewId}`).innerHTML(),
        );
        await page.getByTestId(`action-thumb-up-${reviewId}`).click();
        await expect(
          page.getByTestId(`action-downvotes-${reviewId}`),
        ).toHaveText(String(downvotes - 1));
        await expect(page.getByTestId(`action-upvotes-${reviewId}`)).toHaveText(
          String(upvotes + 1),
        );
        await page.waitForLoadState("networkidle");
      });
    });
  });
  test.describe.serial("when thumb up is clicked as unhelpful review", () => {
    test.describe
      .serial("and the user has marked a review as helpful before", () => {
      test("then number of unhelpfuls increased by 1 and helpfuls decreased by 1", async ({
        page,
      }) => {
        await registerRandomUser(page);
        await page.waitForSelector("#homepage-logo");
        await page.goto(`http://localhost:3000/products/${reviewId}`);
        const review = await getReviewById(reviewId);
        expect(review).not.toBeNull();
        await page.getByTestId(`action-thumb-up-${reviewId}`).click();
        const downvotes = Number(
          await page.getByTestId(`action-downvotes-${reviewId}`).innerHTML(),
        );
        const upvotes = Number(
          await page.getByTestId(`action-upvotes-${reviewId}`).innerHTML(),
        );
        await page.getByTestId(`action-thumb-down-${reviewId}`).click();
        await expect(page.getByTestId(`action-upvotes-${reviewId}`)).toHaveText(
          String(upvotes - 1),
        );
        await expect(
          page.getByTestId(`action-downvotes-${reviewId}`),
        ).toHaveText(String(downvotes + 1));
        await page.waitForLoadState("networkidle");
      });
    });
  });
});
