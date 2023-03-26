import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { registerRandomUser } from "./helpers/auth.helper";

async function loginAsUser(page: Page, password: string, email: string) {
    await page.goto("http://localhost:3000/login", {
      waitUntil: "networkidle",
    });
    await page.getByRole("textbox", { name: "email" }).fill(email);
    await page.getByRole("textbox", { name: "password" }).fill(password);
    await page.getByText("Login", { exact: true }).click();
    await page.waitForNavigation();
    expect(page.url()).toBe("http://localhost:3000/");
  }

async function logout(page: Page) {
    await page.goto("http://localhost:3000/logout");
    expect(page.url()).toBe("http://localhost:3000/login");
}

test.describe("Given user account page", () => {
    test.describe("when user filled new password and conifrmed it by current password", () => {
      test("then user's password is changed", async ({ page }) => {
        const email = await registerRandomUser(page)

        await page.waitForSelector("#homepage-logo");
  
        await page.goto("http://localhost:3000/account", {
          waitUntil: "networkidle",
        });

        expect(page.url()).toBe("http://localhost:3000/account");

        await page.getByLabel("New Password").fill("newpassword");
        await page.getByLabel("Password confirmation").fill("newpassword");

        await page.getByLabel("Current Password").fill("password");

        await page.getByText("Update Account", { exact: true }).click();

        await page.waitForSelector("#homepage-logo");

        expect(page.url()).toBe("http://localhost:3000/");

        await logout(page)

        await loginAsUser(page, "newpassword", email)
      });
    });

    test.describe("when user filled new password and passed incorrect current password", () => {
      test("then user's password isn't changed", async ({ page }) => {
        await registerRandomUser(page)

        await page.waitForSelector("#homepage-logo");
  
        await page.goto("http://localhost:3000/account", {
          waitUntil: "networkidle",
        });

        expect(page.url()).toBe("http://localhost:3000/account");

        await page.getByLabel("New Password").fill("newpassword");
        await page.getByLabel("Password confirmation").fill("newpassword");

        await page.getByLabel("Current Password").fill("invalidPassword");

        await page.getByText("Update Account", { exact: true }).click();

        await expect(
          page.getByText("Invalid credentials", { exact: true }),
        ).toBeVisible();
      });
    });

    test.describe("when user filled new email and conifrmed it by current password", () => {
      test("then user's email is changed", async ({ page }) => {
        const email = await registerRandomUser(page)

        await page.waitForSelector("#homepage-logo");
  
        await page.goto("http://localhost:3000/account", {
          waitUntil: "networkidle",
        });

        expect(page.url()).toBe("http://localhost:3000/account");

        await page.getByLabel("New Email").fill("new"+email);
        await page.getByLabel("Email confirmation").fill("new"+email);

        await page.getByLabel("Current Password").fill("password");

        await page.getByText("Update Account", { exact: true }).click();

        await page.waitForSelector("#homepage-logo");

        expect(page.url()).toBe("http://localhost:3000/");

        await logout(page)

        await loginAsUser(page, "password", "new"+email)
      });
    });

    test.describe("when user filled new email and passed incorrect current password", () => {
      test("then user's password isn't changed", async ({ page }) => {
        const email = await registerRandomUser(page)

        await page.waitForSelector("#homepage-logo");
  
        await page.goto("http://localhost:3000/account", {
          waitUntil: "networkidle",
        });

        expect(page.url()).toBe("http://localhost:3000/account");

        await page.getByLabel("New Email").fill("new"+email);
        await page.getByLabel("Email confirmation").fill("new"+email);

        await page.getByLabel("Current Password").fill("invalidPassword");

        await page.getByText("Update Account", { exact: true }).click();

        await expect(
          page.getByText("Invalid credentials", { exact: true }),
        ).toBeVisible();
      });
    });
  });
  
  
  
