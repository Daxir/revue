import { Menu } from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import type { TablerIcon, TablerIconProps } from "@tabler/icons";
import { IconWorld } from "@tabler/icons";
import type { ReactNode } from "react";
import { CircleFlag } from "react-circle-flags";
import NavbarLink from "../NavbarLink";

const data: Record<
  string,
  {
    image: (props: TablerIconProps) => ReactNode;
    label: string;
  }
> = {
  uk: { label: "English", image: FlagUK },
  de: { label: "German", image: FlagDE },
  pl: { label: "Polish", image: FlagPL },
  all: { label: "All", image: FlagWorld },
};

function FlagPL({ size = 24 }: TablerIconProps): ReactNode {
  return (
    <CircleFlag
      countryCode="pl"
      width={size}
      height={size}
      data-testid="icon-poland"
    />
  );
}

function FlagUK({ size = 24 }: TablerIconProps): ReactNode {
  return (
    <CircleFlag
      countryCode="gb"
      width={size}
      height={size}
      data-testid="icon-uk"
    />
  );
}

function FlagDE({ size = 24 }: TablerIconProps): ReactNode {
  return (
    <CircleFlag
      countryCode="de"
      width={size}
      height={size}
      data-testid="icon-germany"
    />
  );
}

function FlagWorld({ size = 24 }: TablerIconProps): ReactNode {
  return <IconWorld size={size} data-testid="icon-world" />;
}

export function RegionPicker() {
  const [openMenu, helpersMenu] = useDisclosure(false);
  const [value, setValue] = useLocalStorage({
    key: "revue-selected-region",
    defaultValue: "all",
  });

  const items = Object.entries(data).map(([key, item]) => (
    <Menu.Item
      icon={item.image({})}
      onClick={() => setValue(key)}
      key={item.label}
      data-testid={`region-picker-${key}`}
    >
      {item.label}
    </Menu.Item>
  ));

  const selected = data[value] ?? data.all;

  return (
    <Menu
      opened={openMenu}
      onChange={helpersMenu.toggle}
      radius="md"
      width="7em"
      position="right"
    >
      <Menu.Target>
        <NavbarLink
          icon={(selected?.image as TablerIcon) ?? <IconWorld />}
          onClick={helpersMenu.toggle}
          label={`Region (${selected?.label ?? "All"})`}
          data-testid="region-picker"
          disableTooltip={openMenu}
        />
      </Menu.Target>
      <Menu.Dropdown>{items}</Menu.Dropdown>
    </Menu>
  );
}
