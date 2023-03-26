import { Center } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import type { ActionArgs, LoaderArgs} from "@remix-run/node";
import { redirect , json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { IconExclamationMark } from "@tabler/icons";
import { useEffect } from "react";
import { AuthorizationError } from "remix-auth";
import { validationError } from "remix-validated-form";
import invariant from "tiny-invariant";
import { authenticator } from "~/auth.server";
import { ChangePassword, validator } from "~/components/AccountForm";
import { changeEmail, changeUserPassword } from "~/models/user.server";

export async function loader({ request }: LoaderArgs) {
  return authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
}

interface ActionData {
  errors?: {
    general?: string;
  };
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const fieldValues = await validator.validate(formData);
  if (fieldValues.error) return validationError(fieldValues.error);
  const { newPassword, newEmail, currentPassword } = fieldValues.data;

  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  invariant(user, "Error during authentication!");

  formData.append("password", currentPassword);
  formData.append("email", user.email);

  try {
    await authenticator.authenticate("form", request, {
      context: {
        formData,
      },
      throwOnError: true,
    });

    if (newPassword) {
      await changeUserPassword(user.userId, newPassword);
    }
    if (newEmail) {
      await changeEmail(user.userId, newEmail)
    }

    return redirect("/login");
  } catch(error) {
    if (error instanceof AuthorizationError) {
      return json({ errors: { general: error.message } }, { status: 400 });
    } 
    return error;
  }
}

export default function AccountPage() {
  const actionData = useActionData<ActionData>();

  useEffect(() => {
    if (actionData?.errors) {
      showNotification({
        title: "Error",
        message: actionData.errors?.general,
        icon: <IconExclamationMark />,
        color: "red",
      });
    }
  }, [actionData]);

  return (
    <Center h="100%">
      <ChangePassword />
    </Center>
  );
}
