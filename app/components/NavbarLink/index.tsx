import { Tooltip, UnstyledButton, createStyles } from "@mantine/core";
import { Link, useLocation } from "@remix-run/react";
import type { TablerIcon } from "@tabler/icons";
import { forwardRef } from "react";

const useStyles = createStyles((theme) => ({
  link: {
    width: 50,
    height: 50,
    borderRadius: theme.radius.md,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.white,
    opacity: 0.85,

    "&:hover": {
      opacity: 1,
      backgroundColor: theme.fn.lighten(
        theme.fn.variant({ variant: "filled", color: theme.primaryColor })
          .background ?? "",
        0.1,
      ),
    },
  },

  active: {
    opacity: 1,
    "&, &:hover": {
      backgroundColor: theme.fn.lighten(
        theme.fn.variant({ variant: "filled", color: theme.primaryColor })
          .background ?? "",
        0.15,
      ),
    },
  },
}));

interface NavbarLinkProps {
  icon: TablerIcon;
  label: string;
  onClick?(): void;
  to?: string;
  "data-testid"?: string;
  disableTooltip?: boolean;
}

const NavbarLink = forwardRef<HTMLButtonElement, NavbarLinkProps>(
  (
    {
      icon: Icon,
      label,
      onClick,
      to,
      "data-testid": dataTestId = "",
      disableTooltip = false,
    }: NavbarLinkProps,
    reference,
  ) => {
    const { classes, cx } = useStyles();
    const location = useLocation();
    const active =
      to === "/"
        ? location.pathname === to
        : location.pathname.startsWith(to ?? " ");

    return (
      <Tooltip
        label={label}
        position="right"
        transitionDuration={0}
        disabled={disableTooltip}
      >
        {to ? (
          <Link to={to}>
            <UnstyledButton
              ref={reference}
              onClick={onClick}
              className={cx(classes.link, { [classes.active]: active })}
              data-testid={dataTestId}
            >
              <Icon stroke={1.5} />
            </UnstyledButton>
          </Link>
        ) : (
          <UnstyledButton
            ref={reference}
            onClick={onClick}
            className={cx(classes.link, { [classes.active]: active })}
            data-testid={dataTestId}
          >
            <Icon stroke={1.5} />
          </UnstyledButton>
        )}
      </Tooltip>
    );
  },
);

NavbarLink.displayName = "NavbarLink";

export default NavbarLink;
