import type { User } from "@prisma/client";
import { AccountType } from "@prisma/client";
import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import {
  FacebookStrategy,
  GoogleStrategy,
  SocialsProvider,
} from "remix-auth-socials";
import invariant from "tiny-invariant";
import { sessionStorage } from "~/session.server";
import {
  createSocialMediaUser,
  getUserByEmail,
  login,
} from "./models/user.server";

export const authenticator = new Authenticator<
  Pick<User, "userId" | "userType" | "email"> | undefined
>(sessionStorage, {
  sessionErrorKey: "sessionErrorKey",
});

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email");
    const password = form.get("password");
    invariant(typeof email === "string", "username must be a string");
    invariant(email.length > 0, "username must not be empty");

    invariant(typeof password === "string", "password must be a string");
    invariant(password.length > 0, "password must not be empty");

    const user = await login(email, password);
    if (!user) {
      throw new AuthorizationError("Invalid credentials");
    }
    return user;
  }),
);

invariant(process.env.GOOGLE_CLIENT_ID, "GOOGLE_CLIENT_ID must be set");
invariant(process.env.GOOGLE_SECRET, "GOOGLE_SECRET must be set");
invariant(process.env.FACEBOOK_APP_ID, "FACEBOOK_APP_ID must be set");
invariant(process.env.FACEBOOK_SECRET, "FACEBOOK_SECRET must be set");

authenticator.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: `/login/${SocialsProvider.GOOGLE}/callback`,
    },
    async ({ profile }) => {
      let user = await getUserByEmail(profile.emails[0].value);
      if (!user) {
        user = await createSocialMediaUser(
          profile.emails[0].value,
          AccountType.GOOGLE,
        );
      }
      return {
        email: user.email,
        userId: user.userId,
        userType: user.userType,
      };
    },
  ),
);

authenticator.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      callbackURL: `/login/${SocialsProvider.FACEBOOK}/callback`,
    },
    async ({ profile }) => {
      // here you would find or create a user in your database
      invariant(profile.emails, "Facebook profile must have emails");
      let user = await getUserByEmail(profile.emails[0].value);
      if (!user) {
        user = await createSocialMediaUser(
          profile.emails[0].value,
          AccountType.FACEBOOK,
        );
      }
      return {
        email: user.email,
        userId: user.userId,
        userType: user.userType,
      };
    },
  ),
);
