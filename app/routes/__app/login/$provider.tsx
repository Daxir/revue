import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { authenticator } from "~/auth.server";

export const loader: LoaderFunction = () => redirect("/login");

export const action: ActionFunction = ({ request, params }) => {
  invariant(params.provider, "Provider is required");
  return authenticator.authenticate(params.provider, request);
};
