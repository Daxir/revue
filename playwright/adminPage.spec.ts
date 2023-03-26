import { expect, test } from "@playwright/test";
import { UserType } from "@prisma/client";
import { loginAs } from "./helpers/auth.helper";

test.describe("Given admin page", () => {
  test.describe("when logged user with admin/moderator permissions try to access the page", () => {
    test("then admin is directed to Admin Panel", async ({ page }) => {
      await loginAs(UserType.ADMIN, page);
      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/admin");

      await expect(page).toHaveURL(/\/admin/);
      await expect(page.getByTestId("admin-page")).toBeVisible();
    });
    test("then moderator is directed to Admin Panel", async ({ page }) => {
      await loginAs(UserType.MODERATOR, page);
      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/admin");

      await expect(page).toHaveURL(/\/admin/);
      await expect(page.getByTestId("admin-page")).toBeVisible();
    });
  });

  test.describe("when logged user without admin/moderator perissions try to access the page", () => {
    test("then they are redirected to the main page", async ({ page }) => {
      await loginAs(UserType.USER, page);
      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/admin");

      await expect(page).toHaveURL("http://localhost:3000/");
      await expect(page).not.toHaveURL(/\/admin/);
      await expect(page.getByTestId("admin-page")).toBeHidden();
    });
  });

  test.describe("when not logged user tries to access the page", () => {
    test("then they are redirected to the main page", async ({ page }) => {
      await page.goto("http://localhost:3000/admin");

      await expect(page).toHaveURL("http://localhost:3000/");
      await expect(page).not.toHaveURL(/\/admin/);
      await expect(page.getByTestId("admin-page")).toBeHidden();
    });
  });
});
