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
import { FacebookButton, GoogleButton } from "../SocialButtons";

export const validator = withYup(
  yup.object({
    email: yup.string().email().required(),
    password: yup.string().required(),
  }),
);

export function LoginForm(props: PaperProps) {
  return (
    <Paper radius="md" p="xl" withBorder {...props}>
      <Text size="lg" weight={500} align="center">
        Welcome to Revue, login with
      </Text>

      <Group mb="md" mt="md">
        <GoogleButton radius="xl">Sign in with Google</GoogleButton>
        <FacebookButton radius="xl">Login with Facebook</FacebookButton>
      </Group>

      <Divider label="Or continue with email" labelPosition="center" my="lg" />

      <ValidatedForm validator={validator} method="post">
        <Stack>
          <FormTextInput
            required
            name="email"
            label="Email"
            placeholder="your.email@example.com"
          />

          <FormPasswordInput
            required
            name="password"
            label="Password"
            placeholder="Your password"
          />
        </Stack>

        <Group position="apart" mt="xl">
          <Link to="/register">
            <Anchor component="button" type="button" color="dimmed" size="xs">
              Don&apos;t have an account? Register
            </Anchor>
          </Link>
          <Button type="submit" name="intent" value="login">
            Login
          </Button>
        </Group>
      </ValidatedForm>
    </Paper>
  );
}
