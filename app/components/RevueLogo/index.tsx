import { ThemeIcon, useMantineTheme } from "@mantine/core";
import { IconBrandRevolut, IconBrandVimeo } from "@tabler/icons";

export default function RevueLogo() {
  const theme = useMantineTheme();

  return (
    <ThemeIcon radius="xl" color="white" size="xl">
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
        }}
      >
        <IconBrandRevolut color={theme.primaryColor} />
        <IconBrandVimeo
          color={theme.primaryColor}
          size="15"
          style={{
            marginLeft: "-0.4rem",
            strokeWidth: 2.3,
          }}
        />
      </div>
    </ThemeIcon>
  );
}
