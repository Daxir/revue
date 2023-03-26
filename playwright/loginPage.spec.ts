import { expect, test } from "@playwright/test";

test.describe("Given Login Page", () => {
  test.describe("when user logs in with correct credentials", () => {
    test("then user is redirected to main page", async ({ page }) => {
      await page.goto("http://localhost:3000/login");
      await page.getByRole("textbox", { name: "email" }).fill("user2@foo.bar");
      await page.getByRole("textbox", { name: "password" }).fill("password");
      await page.getByText("Login", { exact: true }).click();
      await page.waitForNavigation({ waitUntil: "networkidle" });

      expect(page.url()).toBe("http://localhost:3000/");
    });
  });

  test.describe("when user logs in with incorrect credentials", () => {
    test("then invalid credentails error is displayed", async ({ page }) => {
      await page.goto("http://localhost:3000/login");
      await page.getByRole("textbox", { name: "email" }).fill("fake@user.com");
      await page.getByRole("textbox", { name: "password" }).fill("password");
      await page.getByText("Login", { exact: true }).click();
      await expect(
        page.getByText("Invalid credentials", { exact: true }),
      ).toBeVisible();
    });
  });

  test.describe("when admin logs in with correct credentials", () => {
    test("then admin is redirected to main page", async ({ page }) => {
      await page.goto("http://localhost:3000/login");
      await page.getByRole("textbox", { name: "email" }).fill("admin@foo.bar");
      await page.getByRole("textbox", { name: "password" }).fill("password");
      await page.getByText("Login", { exact: true }).click();
      await page.waitForNavigation({ waitUntil: "networkidle" });

      expect(page.url()).toBe("http://localhost:3000/");
    });
  });

  test.describe("when admin logs in with incorrect credentials", () => {
    test("then invalid credentails error is displayed", async ({ page }) => {
      await page.goto("http://localhost:3000/login");
      await page.getByRole("textbox", { name: "email" }).fill("fake@user.com");
      await page.getByRole("textbox", { name: "password" }).fill("password");
      await page.getByText("Login", { exact: true }).click();
      await expect(
        page.getByText("Invalid credentials", { exact: true }),
      ).toBeVisible();
    });
  });

  test.describe("when moderator logs in with correct credentials", () => {
    test("then moderator is redirected to main page", async ({ page }) => {
      await page.goto("http://localhost:3000/login");
      await page
        .getByRole("textbox", { name: "email" })
        .fill("moderator@foo.bar");
      await page.getByRole("textbox", { name: "password" }).fill("password");
      await page.getByText("Login", { exact: true }).click();
      await page.waitForNavigation({ waitUntil: "networkidle" });

      expect(page.url()).toBe("http://localhost:3000/");
    });
  });

  test.describe("when moderator logs in with incorrect credentials", () => {
    test("then invalid credentails error is displayed", async ({ page }) => {
      await page.goto("http://localhost:3000/login");
      await page.getByRole("textbox", { name: "email" }).fill("fake@user.com");
      await page.getByRole("textbox", { name: "password" }).fill("password");
      await page.getByText("Login", { exact: true }).click();
      await expect(
        page.getByText("Invalid credentials", { exact: true }),
      ).toBeVisible();
    });
  });

  test.describe("when user clicks on no account prompt", () => {
    test("then user is redirected to register page", async ({ page }) => {
      await page.goto("http://localhost:3000/login");
      await page
        .getByText("Don't have an account? Register", { exact: true })
        .click();

      expect(page.url()).toBe("http://localhost:3000/register");
    });
  });

  test.describe("when user clicks on google login", () => {
    test("then user is redirected to google login page", async ({ page }) => {
      await page.goto("http://localhost:3000/login");
      await page.getByText("Sign in with Google", { exact: true }).click();

      await page.waitForNavigation({ waitUntil: "networkidle" });

      await expect(page).toHaveURL(/accounts\.google\.com/);
    });
  });

  test.describe("when user clicks on facebook login", () => {
    test("then user is redirected to facebook login page", async ({ page }) => {
      await page.goto("http://localhost:3000/login");
      await page.getByText("Login with Facebook", { exact: true }).click();

      await page.waitForNavigation({ waitUntil: "networkidle" });

      await expect(page).toHaveURL(/facebook\.com/);
    });
  });
});
