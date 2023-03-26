import { Button, Checkbox, Container, Popover } from "@mantine/core";
import { upperFirst, useClickOutside, useDisclosure } from "@mantine/hooks";
import { ProductCategory } from "@prisma/client";
import { IconArrowNarrowDown, IconArrowNarrowUp } from "@tabler/icons";

const data = Object.values(ProductCategory).map((category) => ({
  value: category,
  label: upperFirst(category.replace("_", " ").toLowerCase()),
}));

export function CategorySelect() {
  const [isVisible, helpers] = useDisclosure(false);
  const reference = useClickOutside(helpers.close);

  return (
    <Container ref={reference}>
      <Popover opened>
        {/* Popover is always opened to prevent dismounting and losing form data */}
        <Popover.Target>
          <Button
            onClick={helpers.toggle}
            variant="subtle"
            rightIcon={
              isVisible ? <IconArrowNarrowUp /> : <IconArrowNarrowDown />
            }
            data-testid="category-select-button"
          >
            Filter categories
          </Button>
        </Popover.Target>
        <Popover.Dropdown
          sx={{
            display: isVisible ? "block" : "none",
          }}
          data-testid="category-select-popover"
        >
          <Checkbox.Group orientation="vertical">
            {data.map((item) => (
              <Checkbox
                name="categories"
                mb={10}
                key={item.value}
                label={item.label}
                value={item.value}
                data-testid={`category-${item.value}-checkbox`}
              />
            ))}
          </Checkbox.Group>
        </Popover.Dropdown>
      </Popover>
    </Container>
  );
}
