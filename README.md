# Welcome to Revue

Table of content:

- [Welcome to Revue](#welcome-to-revue)
    - [Technologies](#technologies)
  - [Development](#development)
    - [Setup VS Code](#setup-vs-code)
    - [Before first run](#before-first-run)
    - [How to run](#how-to-run)
  - [Guides](#guides)
    - [Vitest and React Testing Library (Unit/Integration)](#vitest-and-react-testing-library-unitintegration)
    - [Playwright (E2E)](#playwright-e2e)
    - [Prisma and changing database schema](#prisma-and-changing-database-schema)
    - [Supabase](#supabase)
  - [User accounts](#user-accounts)

---

### Technologies

In this project we use:

- [Remix](https://remix.run/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [React](https://reactjs.org/docs/getting-started.html)
- [Mantine](https://mantine.dev/)
- [Vitest](https://vitest.dev/guide/)
- [Playwright](https://playwright.dev/)
- [Prisma](https://www.prisma.io/docs/)
- [Docker](https://docs.docker.com/)
- [Supabase](https://supabase.io/docs/)

---

## Development

### Setup VS Code

1. Install extensions:
   - [Prisma](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma)
   - [Eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
   - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
   - (Optional)
     [React-Snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets)
   - (Optional)
     [Playwright extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)

Once installed, make sure to reload VS Code.

2. (Optional) If you want to debug in VS Code
   1. Create in `.vscode` file `launch.json`
   2. Add this to the file
      ```json
      {
        "configurations": [
          {
            "command": "npm dev",
            "name": "Run Dev Version Opinion Collector",
            "request": "launch",
            "type": "node-terminal"
          },
          {
            "command": "npm build",
            "name": "Build project",
            "request": "launch",
            "type": "node-terminal"
          }
        ]
      }
      ```
   3. Check if is working by clicking Run and Debug Section

### Before first run

1. Prepare `.env` file with variables:
   ```
   DATABASE_URL = '<contact-a-team-member-for-this-secret>'
   SUPABASE_URL = '<contact-a-team-member-for-this-secret>'
   SUPABASE_ANON_KEY = '<contact-a-team-member-for-this-secret>'
   SESSION_SECRET = '<contact-a-team-member-for-this-secret>'
   GOOGLE_SECRET = '<contact-a-team-member-for-this-secret>'
   GOOGLE_CLIENT_ID = '<contact-a-team-member-for-this-secret>'
   FACEBOOK_APP_ID = '<contact-a-team-member-for-this-secret>'
   FACEBOOK_SECRET = '<contact-a-team-member-for-this-secret>'
   ```
2. Run commands:
    ```sh
    npm install
    npx prisma generate
    npx playwright install
    ```
3. (Testing) Install Docker: https://www.docker.com/

### How to run

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

---

## Guides

### Vitest and React Testing Library (Unit/Integration)

[Documentation of Vitest](https://vitest.dev/guide/)

[Documentation of React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

If you want to test component with Vitest.

1. Create file `<nameOfComponent>.test.tsx`
2. Add imports at the beginning of the file:

   ```typescript
   import { render, screen } from "@testing-library/react";
   import { describe, expect, test } from "vitest";

   vi.mock("@remix-run/react", () => ({ Link: () => {} }));
   ```

   Please note that we need to mock `Link` from `@remix-run/react` because remix
   does not expose its `Router`.

3. In the same file, write the description of the test:
   ```typescript
   describe("Given [Name Of Component]", () => {
     describe("when [component use case]", () => {
       test("then [expected behavior]", () => {
         // your test code
       });
     });
   });
   ```
4. Run test using command:

   (Please make sure that you have Docker installed and running)

   ```sh
   npm run test
   ```

   This runs tests in watch mode (re-run tests on file changes)

5. (Optional) Running tests without watch mode (runs once):

   (Please make sure that you have Docker installed and running)

   ```sh
   npm run test:run
   ```

6. (Optional) Running tests in Vitest UI:

   (Please make sure that you have Docker installed and running)

   ```sh
   npm run test:ui
   ```

---

### Playwright (E2E)

[Documentation of Playwright](https://playwright.dev/docs/intro)

If you want test a functionality with Playwright.

1. In `playwright` folder, create file `<nameOfFunctionality>.spec.ts`
2. In the same file, write the description of the test:

   ```typescript
   describe("Given [Name Of Functionality]", () => {
     describe("when [functionality use case]", () => {
       test("then [expected behavior]", () => {
         // your test code
       });
     });
   });
   ```

3. To run all Playwright tests in console (headless mode) use command:

(Please make sure that you have Docker installed and running)

```sh
 npm run playwright:test
```

**Note:** If any of the tests fail, Playwright will not run test database
cleanup. To ensure the database is clean, you need to kill the container
manually.

```sh
npm run docker:down
```

If you want a more interactive experience, you can run tests via VS Code
extension (link in [Setup VS Code](#setup-vs-code)). A guide how to use this
extension is available
[here](https://playwright.dev/docs/getting-started-vscode) (just ignore
Installation section, already done).

---

### Prisma and changing database schema

[Prisma documentation](https://www.prisma.io/docs/)

If you need to change database's schema, make necessary changes in
`schema.prisma` file, then run the command
`npx prisma migrate dev --name <overview_of_your_changes>`. Since we have a
single database, notify other database user of your changes and create a
seperate pull request immediately for your new migration to have it merged
quicker and avoid conflicts with other developers.

Also before creating a migration make sure to check if everything is correct,
because Supabase seems to have a lock period after creating a migration, so you
can't create another for some time.

### UNDER NO CONDITION EDIT THE DATABASE SCHEMA MANUALLY OR USE `NPX PRISMA DB PUSH` COMMAND, PLEASE

---

### Supabase

[Supabase database](https://app.supabase.com/project/hoaijvwmvagidfnseyrb)
During development, you can add entities directly to the database here. Contact
team leader for access.

## User accounts

If you want to log in as a `user`, you can create a new user account via
`/register` or use the following credentials:

```
email: user@revue.co.uk
password: User1234
```

If you want to log in as an `admin`, use the following credentials:

```
email: admin@revue.co.uk
password: Admin123
```

If you want to log in as a `moderator`, use the following credentials:

```
email: moderator@revue.co.uk
password: Moderator123
```
