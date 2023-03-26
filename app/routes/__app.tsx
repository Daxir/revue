import { AppShell, Center, Navbar, Stack } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useCatch, useLoaderData } from "@remix-run/react";
import {
  IconClipboardCopy,
  IconClipboardList,
  IconClipboardPlus,
  IconDeviceAnalytics,
  IconExclamationMark,
  IconHelp,
  IconHome2,
  IconLogin,
  IconLogout,
  IconPackage,
  IconUser,
  IconBook
} from "@tabler/icons";
import { useEffect } from "react";
import { authenticator } from "~/auth.server";
import NavbarLink from "~/components/NavbarLink";
import { NotFound } from "~/components/NotFoundComponent";
import { RegionPicker } from "~/components/RegionPicker";
import RevueLogo from "~/components/RevueLogo";
import ThemeSwitcher from "~/components/ThemeSwitcher";

export async function loader({ request }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request);

  return json({
    status: user ? user.userType : "GUEST",
  });
}

export default function IndexPage() {
  const { status } = useLoaderData<typeof loader>();
  const isGuest = status === "GUEST";
  const isAdmin = status === "ADMIN";
  const isModerator = status === "MODERATOR";

  return (
    <AppShell
      padding="md"
      navbar={
        <Navbar
          height={"100%"}
          width={{ base: 80 }}
          p="md"
          sx={(theme) => ({
            backgroundColor: theme.fn.variant({
              variant: "filled",
              color: theme.primaryColor,
            }).background,
          })}
        >
          <Center>
            <RevueLogo />
          </Center>
          <Navbar.Section grow mt={50}>
            <Stack justify="center" spacing={0}>
              <NavbarLink icon={IconHome2} label="Home" key="Home" to="/" />
              <NavbarLink icon={IconPackage} label="Products" to="/products" />
              {!isGuest ? (
                <>
                  <NavbarLink
                    icon={IconClipboardList}
                    label="My Reviews"
                    to="/my-reviews"
                  />
                  <NavbarLink
                    icon={IconClipboardPlus}
                    label="Offer Product"
                    to="/offer-product"
                  />
                </>
              ) : null}
              {isAdmin || isModerator ? (
                <NavbarLink
                  icon={IconDeviceAnalytics}
                  label="Admin Panel"
                  to="/admin"
                />
              ) : null}
              {isAdmin || isModerator ? (
                <NavbarLink
                  icon={IconBook}
                  label="Event Log"
                  to="/logs"
                />
              ) : null}                            
              {isModerator ? (
                <NavbarLink
                  icon={IconClipboardCopy}
                  label="Moderation Panel"
                  to="/moderator"
                />
              ) : null}
            </Stack>
          </Navbar.Section>
          <Navbar.Section>
            <Stack justify="center" spacing={0}>
              <RegionPicker />
              <NavbarLink icon={IconHelp} label="FAQ" to="/faq" />
              <ThemeSwitcher />
              {isGuest ? (
                <NavbarLink icon={IconLogin} label="Login" to="/login" />
              ) : (
                <>
                  <NavbarLink icon={IconUser} label="Account" to="/account" />
                  <NavbarLink icon={IconLogout} label="Logout" to="/logout" />
                </>
              )}
            </Stack>
          </Navbar.Section>
        </Navbar>
      }
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[3],
        },
      })}
    >
      <Outlet />
    </AppShell>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  useEffect(() => {
    showNotification({
      title: "Error",
      message: error.message,
      icon: <IconExclamationMark />,
      color: "red",
    });
  }, [error.message]);

  return;
}

export function CatchBoundary() {
  const caught = useCatch();
  useEffect(() => {
    showNotification({
      title: "Error",
      message: caught.status,
      icon: <IconExclamationMark />,
      color: "red",
    });
  }, [caught]);

  return <NotFound />;
}
