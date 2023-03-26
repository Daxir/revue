import { expect, test } from "@playwright/test";

test.describe("Given Register page", () => {
  test.describe("when user is logged in", () => {
    test("then user is redirected out of the register page", async ({
      page,
    }) => {
      await page.goto("http://localhost:3000/login", {
        waitUntil: "networkidle",
      });
      await page.getByRole("textbox", { name: "email" }).fill("user2@foo.bar");
      await page.getByRole("textbox", { name: "password" }).fill("password");
      await page.getByText("Login", { exact: true }).click();
      await page.waitForNavigation();
      await page.waitForSelector("#homepage-logo");
      expect(page.url()).toBe("http://localhost:3000/");

      await page.goto("http://localhost:3000/register");
      await page.waitForSelector("#homepage-logo");
      expect(page.url()).toBe("http://localhost:3000/");
    });
  });

  test.describe("when user is not logged in", () => {
    test.describe("and provides valid data", () => {
      test("then user is registered and redirected to the home page", async ({
        page,
      }) => {
        await page.goto("http://localhost:3000/register");
        await page
          .getByRole("textbox", { name: "email" })
          .fill(`${Math.random().toString(36).slice(2, 15)}@foo.bar`);
        await page.getByRole("textbox", { name: "password" }).fill("password");
        await page.getByText("Register", { exact: true }).click();
        await page.waitForNavigation({ waitUntil: "networkidle" });

        expect(page.url()).toBe("http://localhost:3000/");
      });
    });

    test.describe("and provides invalid data", () => {
      test.describe("being already existing email", () => {
        test("then user is not registered and error is shown", async ({
          page,
        }) => {
          await page.goto("http://localhost:3000/register");
          await page
            .getByRole("textbox", { name: "email" })
            .fill("user2@foo.bar");
          await page
            .getByRole("textbox", { name: "password" })
            .fill("password");
          await page.getByText("Register", { exact: true }).click();

          await page.waitForSelector("#register-error");
          expect(
            await page.getByText("Could not register").isVisible(),
          ).toBeTruthy();
        });
      });

      test.describe("being empty", () => {
        test.describe("email", () => {
          test("then user is not registered and error is shown", async ({
            page,
          }) => {
            await page.goto("http://localhost:3000/register");
            await page.getByRole("textbox", { name: "email" }).fill("");
            await page
              .getByRole("textbox", { name: "password" })
              .fill("password");
            await page.getByText("Register", { exact: true }).click();

            await page.waitForSelector("[role=alert]");
            expect(
              await page.getByText("email is a required field").isVisible(),
            ).toBeTruthy();
          });
        });

        test.describe("password", () => {
          test("then user is not registered and error is shown", async ({
            page,
          }) => {
            await page.goto("http://localhost:3000/register");
            await page
              .getByRole("textbox", { name: "email" })
              .fill("baz@foo.bar");
            await page.getByRole("textbox", { name: "password" }).fill("");
            await page.getByText("Register", { exact: true }).click();

            await page.waitForSelector("[role=alert]");
            expect(
              await page
                .getByText("password must be at least 8 characters", {
                  exact: true,
                })
                .isVisible(),
            ).toBeTruthy();
          });
        });

        test.describe("being invalid email", () => {
          test("then user is not registered and error is shown", async ({
            page,
          }) => {
            await page.goto("http://localhost:3000/register");
            await page.getByRole("textbox", { name: "email" }).fill("foo");
            await page
              .getByRole("textbox", { name: "password" })
              .fill("password");
            await page.getByText("Register", { exact: true }).click();

            await page.waitForSelector("[role=alert]");
            expect(
              await page.getByText("email must be a valid email").isVisible(),
            ).toBeTruthy();
          });
        });
      });
    });
  });
});
