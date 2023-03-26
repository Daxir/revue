import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import type { UserType } from "@prisma/client";

export async function loginAs(userType: UserType, page: Page) {
  await page.goto("http://localhost:3000/login", {
    waitUntil: "networkidle",
  });
  await page
    .getByRole("textbox", { name: "email" })
    .fill(`${userType.toLowerCase()}@foo.bar`);
  await page.getByRole("textbox", { name: "password" }).fill("password");
  await page.getByText("Login", { exact: true }).click();
  await page.waitForNavigation();
  expect(page.url()).toBe("http://localhost:3000/");
}

export async function registerRandomUser(page: Page) {
  const userEmail = `${Math.random().toString(36).slice(2, 15)}@foo.bar`;
  await page.goto("http://localhost:3000/register");
  await page.getByRole("textbox", { name: "email" }).fill(userEmail);
  await page.getByRole("textbox", { name: "password" }).fill("password");
  await page.getByText("Register", { exact: true }).click();
  await page.waitForNavigation({ waitUntil: "networkidle" });

  expect(page.url()).toBe("http://localhost:3000/");

  return userEmail;
}

export async function loginUser(email: string, page: Page) {
  await page.goto("http://localhost:3000/login");
  await page.getByRole("textbox", { name: "email" }).fill(email);
  await page.getByRole("textbox", { name: "password" }).fill("password");
  await page.getByText("Login", { exact: true }).click();
  await page.waitForNavigation({ waitUntil: "networkidle" });

  expect(page.url()).toBe("http://localhost:3000/");
}

export async function logout(page: Page) {
  await page.goto("http://localhost:3000/logout");
  expect(page.url()).toBe("http://localhost:3000/login");
}
