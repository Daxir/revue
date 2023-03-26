import { Center } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { json, redirect } from "@remix-run/node";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { IconExclamationMark } from "@tabler/icons";
import { useEffect } from "react";
import { AuthorizationError } from "remix-auth";
import { authenticator } from "~/auth.server";
import { LoginForm } from "~/components/LoginForm";

interface ActionData {
  errors?: {
    general?: string;
  };
}

export async function loader({ request }: LoaderArgs) {
  return authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === "login") {
    try {
      const user = await authenticator.authenticate("form", request, {
        successRedirect: "/",
        context: {
          formData,
        },
        throwOnError: true,
      });
      return user;
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return json({ errors: { general: error.message } }, { status: 400 });
      } else if (error instanceof Response) {
        return error;
      }
    }
  }

  return redirect("/login");
}

export default function LoginPage() {
  const actionData = useActionData<ActionData>();

  useEffect(() => {
    if (actionData) {
      showNotification({
        title: "Error",
        message: actionData.errors?.general,
        icon: <IconExclamationMark />,
        color: "red",
      });
    }
  }, [actionData]);

  return (
    <Center style={{ height: "100%" }}>
      <LoginForm />
    </Center>
  );
}
