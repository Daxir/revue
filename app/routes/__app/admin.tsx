import { Group, Paper, createStyles } from "@mantine/core";
import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Link, Outlet, useLocation } from "@remix-run/react";
import invariant from "tiny-invariant";
import { authenticator } from "~/auth.server";

export async function loader({ request }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });

  invariant(user, "User does not exist");
  if (user.userType !== "ADMIN" && user.userType !== "MODERATOR") {
    throw redirect("/");
  }

  return null;
}

const useStyles = createStyles((theme) => ({
  link: {
    display: "block",
    lineHeight: 1,
    padding: "8px 12px",
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },

    [theme.fn.smallerThan("sm")]: {
      borderRadius: 0,
      padding: theme.spacing.md,
    },
  },

  linkActive: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
        .color,
    },
  },
}));

export default function AdminPage() {
  const { classes, cx } = useStyles();
  const location = useLocation();

  return (
    <>
      <Paper
        sx={{
          marginTop: -16,
          marginLeft: -16,
          marginRight: -16,
          marginBottom: 16,
          borderBottom: "0.5px solid rgba(173, 181, 189, 0.3)",
          height: 60,
        }}
        radius={0}
        p="xs"
        shadow="none"
        data-testid="admin-page"
      >
        <Group
          spacing="xs"
          position="right"
          sx={{
            height: "100%",
            marginRight: 32,
          }}
        >
          <Link
            to="/admin/users"
            className={cx(classes.link, {
              [classes.linkActive]: location.pathname === "/admin/users",
            })}
          >
            Users
          </Link>
          <Link
            to="/admin/products"
            className={cx(classes.link, {
              [classes.linkActive]: location.pathname === "/admin/products",
            })}
          >
            Products
          </Link>
          <Link
            to="/admin/new-products"
            className={cx(classes.link, {
              [classes.linkActive]: location.pathname === "/admin/new-products",
            })}
          >
            New products
          </Link>
          <Link
            to="/admin/reviews"
            className={cx(classes.link, {
              [classes.linkActive]: location.pathname === "/admin/reviews",
            })}
          >
            Import reviews
          </Link>
        </Group>
      </Paper>
      <Outlet />
    </>
  );
}
