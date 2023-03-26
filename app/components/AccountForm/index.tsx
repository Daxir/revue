import type { PaperProps } from "@mantine/core";
import { Button, Divider, Group, Paper, Stack, Text } from "@mantine/core";
import { withYup } from "@remix-validated-form/with-yup";
import { ValidatedForm } from "remix-validated-form";
import * as yup from "yup";
import FormPasswordInput from "../FormPasswordInput";
import FormTextInput from "../FormTextInput";

export const validator = withYup(
  yup.object({
    newPassword: yup.string().notRequired().test(
      "len",
      "Your new password is too short",
      (value) => {
        if (value === undefined) {
          return true;
        }
        return value.length === 0 || (value.length >= 8);
      }
    ),
    passwordConfirmation: yup
      .string()
      .oneOf([yup.ref("newPassword"), null], "Passwords don't match!")
      .notRequired(),
    newEmail: yup.string().notRequired(),
    emailConfirmation: yup
      .string()
      .oneOf([yup.ref("newEmail"), null], "Email don't match!")
      .notRequired(),
    currentPassword: yup.string().min(8, "Password must be at least 8 characters long").required(),
  }),
);

export function ChangePassword(props: PaperProps) {
  return (
    <Paper radius="md" p="xl" withBorder {...props}>
      <Stack align="center">
        <ValidatedForm validator={validator} method="post">
          <Group position="apart" spacing="xl">
            <Stack>
              <Text size="lg" weight={500} align="center">
                Change Password
              </Text>
              <FormPasswordInput
                name="newPassword"
                label="New Password"
                placeholder="Your new password"
                description="Password must be at least 8 characters long"
              />
              <FormPasswordInput
                name="passwordConfirmation"
                label="Password confirmation"
                placeholder="Your new password"
              />
            </Stack>
            <Divider size="sm" orientation="vertical" />
            <Stack>
              <Text size="lg" weight={500} align="center">
                Change Email
              </Text>
              <FormTextInput
                name="newEmail"
                label="New Email"
                placeholder="Your new email"
                description="Password must be at least 8 characters long"
              />
              <FormTextInput
                name="emailConfirmation"
                label="Email confirmation"
                placeholder="Your new email"
              />
            </Stack>
          </Group>
          <Stack>
            <FormPasswordInput
              name="currentPassword"
              label="Current Password"
              placeholder="Your current password"
            />
            <Button type="submit" name="intent" value="updateAccount">
              Update Account
            </Button>
          </Stack>
        </ValidatedForm>
      </Stack>
    </Paper>
  );
}
