import {
  ColorSchemeProvider,
  MantineProvider,
  createEmotionCache,
} from "@mantine/core";
import type { ColorScheme } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { NotificationsProvider } from "@mantine/notifications";
import { StylesPlaceholder } from "@mantine/remix";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { useState } from "react";
import styles from "~/styles/global.css";
import { theme } from "./theme";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Revue",
  viewport: "width=device-width,initial-scale=1",
});

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

createEmotionCache({ key: "mantine" });

export default function App() {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("dark");
  const toggleColorScheme = (value?: ColorScheme) => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  };

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ ...theme, colorScheme }}
        withGlobalStyles
        withNormalizeCSS
      >
        <ModalsProvider>
          <NotificationsProvider>
            <html lang="en">
              <head>
                <StylesPlaceholder />
                <Meta />
                <Links />
              </head>
              <body>
                <Outlet />
                <ScrollRestoration />
                <Scripts />
                <LiveReload />
              </body>
            </html>
          </NotificationsProvider>
        </ModalsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
