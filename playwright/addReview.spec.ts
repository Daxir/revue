import { expect, test } from "@playwright/test";
import type { User } from "@prisma/client";
import type { ReviewContent } from "~/models/review.server";
import { getReviewsByUserId } from "~/models/review.server";
import { getUserByEmail } from "~/models/user.server";
import { registerRandomUser } from "./helpers/auth.helper";

test.describe("Given add review", () => {
  test.describe("when when valid data is provided", () => {
    test("then review is added", async ({ page }) => {
      const userEmail = await registerRandomUser(page);
      const user = (await getUserByEmail(userEmail)) as User;
      await page.waitForSelector("#homepage-logo");
      await page.goto("http://localhost:3000/products/2/review");
      await page.locator("#advantages").fill("pros");
      await page.locator("#disadvantages").fill("con");
      await page.locator("#description").fill("description");
      await page.getByTestId("grade-rating").click();
      await page.getByTestId("featureGrades[0]-rating").click();
      await page.getByTestId("featureGrades[1]-rating").click();
      await page.getByText("Submit", { exact: true }).click();
      await page.waitForSelector(`text=Submit`, { state: "hidden" });
      const reviews = await getReviewsByUserId(user.userId);
      const reviewContent = reviews[0].content as ReviewContent;
      expect(reviewContent).toBeTruthy();
      expect(reviews[0].status).toBe("NEW");
      expect(reviews[0].productId).toBe(2);
      expect(reviews[0].userId).toBe(user.userId);
      expect(reviewContent.advantages).toBe("pros");
      expect(reviewContent.disadvantages).toBe("con");
      expect(reviewContent.description).toBe("description");
      expect(reviewContent.double_quality).toBe(false);
      expect(reviewContent.verified).toBe(false);
      expect(reviewContent.category).toBe("neutral");
      expect(reviewContent.grade).toBeGreaterThan(4);
      expect(reviewContent.grade).toBeLessThan(7);
      expect(reviewContent.language).toEqual(["PL", "DE", "UK"]);
      expect(reviewContent.helpful).toBe(0);
      expect(reviewContent.feature_grades[0]).toBeGreaterThan(4);
      expect(reviewContent.feature_grades[0]).toBeLessThan(7);
      expect(reviewContent.feature_grades[1]).toBeGreaterThan(4);
      expect(reviewContent.feature_grades[1]).toBeLessThan(7);
      await page.goto("http://localhost:3000/products/2/review");
      await page.waitForSelector(`text=Submit`, { state: "hidden" });
      await page
        .getByText("Please wait for the acceptence of your review.")
        .isVisible();
    });
    test.describe('and "double quality" checkbox is marked', () => {
      test('then added review has "double quality" set', async ({ page }) => {
        const userEmail = await registerRandomUser(page);
        const user = (await getUserByEmail(userEmail)) as User;
        await page.waitForSelector("#homepage-logo");
        await page.goto("http://localhost:3000/products/2/review");
        await page.getByText("Is Double Quality").click();
        await page.locator("#advantages").fill("pros");
        await page.locator("#disadvantages").fill("con");
        await page.locator("#description").fill("description");
        await page.getByText("Submit", { exact: true }).click();
        await page.waitForSelector(`text=Submit`, { state: "hidden" });
        const reviews = await getReviewsByUserId(user.userId);
        const reviewContent = reviews[0].content as ReviewContent;
        expect(reviewContent).toBeTruthy();
        expect(reviewContent.double_quality).toBeTruthy();
      });
    });
  });
  test.describe("when when invalid data is provided", () => {
    test("then review is not added", async ({ page }) => {
      const userEmail = await registerRandomUser(page);
      const user = (await getUserByEmail(userEmail)) as User;
      await page.waitForSelector("#homepage-logo");
      await page.goto("http://localhost:3000/products/1/review");
      await page.locator("#advantages").fill("pros");
      await page.locator("#disadvantages").fill("con");
      const button = page.locator("button", { hasText: "Submit" });
      await button.click();
      expect(await button.isHidden()).toBeFalsy();
      const reviews = await getReviewsByUserId(user.userId);
      expect(reviews).toHaveLength(0);
    });
  });
});
