import type { LoaderFunction } from "@remix-run/node";
import invariant from "tiny-invariant";
import { authenticator } from "~/auth.server";

export const loader: LoaderFunction = ({ request, params }) => {
  invariant(params.provider, "Provider is required");
  return authenticator.authenticate(params.provider, request, {
    successRedirect: "/",
    failureRedirect: "/login",
  });
};
