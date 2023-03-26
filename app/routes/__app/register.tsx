import { Center } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { IconExclamationMark } from "@tabler/icons";
import { useEffect } from "react";
import { validationError } from "remix-validated-form";
import { authenticator } from "~/auth.server";
import { RegisterForm, validator } from "~/components/RegisterForm";
import { createUser, getUserByEmail } from "~/models/user.server";

export async function loader({ request }: LoaderArgs) {
  return authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const fieldValues = await validator.validate(formData);
  if (fieldValues.error) return validationError(fieldValues.error);
  const { email, password } = fieldValues.data;

  const intent = formData.get("intent");
  if (intent === "register") {
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return json(
        { errors: { general: "Could not register" } },
        { status: 400 },
      );
    }

    await createUser(email, password);
    await authenticator.authenticate("form", request, {
      successRedirect: "/",
      context: {
        formData,
      },
      throwOnError: true,
    });
  }

  return redirect("/login");
}

export default function RegisterPage() {
  const actionData = useActionData<typeof action>();

  useEffect(() => {
    if (actionData && "errors" in actionData) {
      showNotification({
        autoClose: false,
        title: "Error!",
        message: Object.values(actionData.errors).join("\n"),
        color: "red",
        icon: <IconExclamationMark />,
        id: "register-error",
      });
    }
  }, [actionData]);

  return (
    <Center style={{ height: "100%" }}>
      <RegisterForm />
    </Center>
  );
}
