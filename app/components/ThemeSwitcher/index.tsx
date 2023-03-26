import { useMantineColorScheme } from "@mantine/core";
import { IconMoonStars, IconSun } from "@tabler/icons";
import NavbarLink from "../NavbarLink";

export default function ThemeSwitcher() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  return (
    <NavbarLink
      icon={dark ? IconMoonStars : IconSun}
      label={dark ? "Dark Mode" : "Light Mode"}
      onClick={toggleColorScheme}
    />
  );
}
