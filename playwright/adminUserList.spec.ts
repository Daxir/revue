import { expect, test } from "@playwright/test";
import { UserType } from "@prisma/client";
import { loginAs, logout, registerRandomUser } from "./helpers/auth.helper";

test.describe("Given admin user list", () => {
  test.describe("when user deletion is confirmed", () => {
    test("then user is deleted", async ({ page }) => {
      const userEmail = await registerRandomUser(page);
      await page.waitForSelector("#homepage-logo");

      await logout(page);

      await loginAs(UserType.ADMIN, page);

      await page.goto("http://localhost:3000/admin/users", {
        waitUntil: "networkidle",
      });

      const row = page.locator("tr", { hasText: userEmail });
      await row.locator("button").click();

      await page.waitForSelector("text=Confirm");
      await page.getByText("Confirm", { exact: true }).click();

      await page.waitForSelector(`text=${userEmail}`, { state: "hidden" });
      expect(await row.isVisible()).toBeFalsy();
    });
  });
  test.describe("when user deletion is cancelled", () => {
    test("then user is not deleted", async ({ page }) => {
      const userEmail = "deletable@foo.bar";
      await loginAs(UserType.ADMIN, page);
      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/admin/users", {
        waitUntil: "networkidle",
      });

      const row = page.locator("tr", { hasText: userEmail });
      await row.locator("button").click();

      await page.waitForSelector("text=Cancel");
      await page.getByText("Cancel", { exact: true }).click();

      await page.waitForSelector(`text=${userEmail}`);
      expect(await row.isVisible()).toBeTruthy();
    });
  });
  test.describe("when user deletion is aborted", () => {
    test("then user is not deleted", async ({ page }) => {
      const userEmail = "deletable@foo.bar";
      await loginAs(UserType.ADMIN, page);
      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/admin/users", {
        waitUntil: "networkidle",
      });

      const row = page.locator("tr", { hasText: userEmail });
      await row.locator("button").click();

      await page.waitForSelector(".mantine-Modal-close");
      await page.locator(".mantine-Modal-close").click();

      await page.waitForSelector(`text=${userEmail}`);
      expect(await row.isVisible()).toBeTruthy();
    });
  });
});
