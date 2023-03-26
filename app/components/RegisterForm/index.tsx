import type { PaperProps } from "@mantine/core";
import {
  Anchor,
  Button,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { Link } from "@remix-run/react";
import { withYup } from "@remix-validated-form/with-yup";
import { ValidatedForm } from "remix-validated-form";
import * as yup from "yup";
import FormPasswordInput from "../FormPasswordInput";
import FormTextInput from "../FormTextInput";

export const validator = withYup(
  yup.object({
    email: yup.string().email().required(),
    password: yup.string().min(8).required(),
  }),
);

export function RegisterForm(props: PaperProps) {
  return (
    <Paper radius="md" p="xl" withBorder {...props}>
      <Text size="lg" weight={500} align="center">
        Welcome to Revue, register with
      </Text>

      <Divider label="Or continue with email" labelPosition="center" my="lg" />

      <ValidatedForm validator={validator} method="post">
        <Stack>
          <FormTextInput
            name="email"
            required
            label="Email"
            placeholder="your.email@example.com"
          />

          <FormPasswordInput
            name="password"
            required
            label="Password"
            placeholder="Your password"
            description="Password must be at least 8 characters long"
          />
        </Stack>

        <Group position="apart" mt="xl">
          <Anchor component={Link} to="/login" color="dimmed" size="xs">
            Already have an account? Login
          </Anchor>
          <Button type="submit" name="intent" value="register">
            Register
          </Button>
        </Group>
      </ValidatedForm>
    </Paper>
  );
}
