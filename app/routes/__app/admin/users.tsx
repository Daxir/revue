import {
  ActionIcon,
  Badge,
  Center,
  ScrollArea,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { AccountType, UserType } from "@prisma/client";
import { json } from "@remix-run/node";
import type { ActionArgs } from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { IconTrash } from "@tabler/icons";
import type { FormEvent } from "react";
import { EmptyState } from "~/components/EmptyState";
import { deleteUserById, getAllUsers } from "~/models/user.server";
import { authenticator } from "~/auth.server";

export async function loader() {
  return json({ users: await getAllUsers() });
}

const getAccountTypeBadgeColor = (accountType: AccountType) => {
  switch (accountType) {
    case AccountType.GOOGLE: {
      return "yellow";
    }
    case AccountType.FACEBOOK: {
      return "blue";
    }
    default: {
      return;
    }
  }
};

const getUserTypeBadgeColor = (userType: UserType) => {
  switch (userType) {
    case UserType.ADMIN: {
      return "pink";
    }
    case UserType.MODERATOR: {
      return "orange";
    }
    default: {
      return;
    }
  }
};

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  const admin = await authenticator.isAuthenticated( request, {
  failureRedirect: "/login",
  });

  if (intent === "delete") {
    const userId = formData.get("userId");
    if (userId) {
      return deleteUserById(Number(userId), admin?.userId as number);
    }
  }
  return null;
}

export default function AdminUsersPage() {
  const { users } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    openConfirmModal({
      title: "Are you sure you want to delete this user?",
      children: (
        <Text size="sm">
          This action is irreversible. All of the user&apos;s data will be
          deleted.
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: () => {
        if (formData) {
          submit(formData, {
            method: "post",
          });
        }
      },
    });
  }

  const rows = users.map(({ userId, email, userType, accountType }) => (
    <tr key={userId}>
      <td>{email}</td>
      <td>
        <Badge color={getUserTypeBadgeColor(userType)} variant="filled">
          {userType}
        </Badge>
      </td>
      <td>
        <Badge color={getAccountTypeBadgeColor(accountType)} variant="outline">
          {accountType}
        </Badge>
      </td>
      <td
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Form
          style={{ display: "inline" }}
          method="post"
          onSubmit={handleSubmit}
        >
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="intent" value="delete" />
          <Tooltip label="Delete user" withArrow>
            <ActionIcon
              type="submit"
              color="red.6"
              variant="outline"
              aria-label="delete"
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Tooltip>
        </Form>
      </td>
    </tr>
  ));
  return (
    <ScrollArea>
      <Center>
        <Table
          horizontalSpacing="md"
          verticalSpacing="xs"
          sx={{ tableLayout: "auto", minWidth: 700, maxWidth: 1000 }}
        >
          <thead>
            <tr>
              <th>Email</th>
              <th>User Type</th>
              <th>Account Type</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <tr>
                <td>
                  <EmptyState
                    title="No users found..."
                    description="It seems like there are no existing users in your database. This is
                                particularly peculiar, as you are logged in as an administrator,
                                implying you should have at least one user in your database."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Center>
    </ScrollArea>
  );
}
