import {
  Anchor,
  Button,
  Center,
  Container,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
  Title,
  createStyles,
} from "@mantine/core";
import { Link } from "@remix-run/react";
import image from "./image.svg";

const useStyles = createStyles((theme) => ({
  root: {
    paddingTop: 80,
    paddingBottom: 80,
  },

  title: {
    fontWeight: 900,
    fontSize: 34,
    marginBottom: theme.spacing.md,
    fontFamily: `Greycliff CF, ${theme.fontFamily ?? ""}`,

    [theme.fn.smallerThan("sm")]: {
      fontSize: 32,
    },
  },

  control: {
    [theme.fn.smallerThan("sm")]: {
      width: "100%",
    },
  },

  mobileImage: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  desktopImage: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },
}));

export function NotFound() {
  const { classes } = useStyles();

  return (
    <Container className={classes.root} data-testid="not-found-component">
      <SimpleGrid
        spacing={80}
        cols={2}
        breakpoints={[{ maxWidth: "sm", cols: 1, spacing: 40 }]}
      >
        <Image src={image} className={classes.mobileImage} />
        <div>
          <Title className={classes.title}>Something is not right...</Title>
          <Text color="dimmed" size="lg">
            Page you are trying to open does not exist. You may have mistyped
            the address, or the page has been moved to another URL. If you think
            this is an error contact support.
          </Text>
          <Button
            variant="outline"
            size="md"
            mt="xl"
            className={classes.control}
            component={Link}
            to="/"
          >
            Get back to home page
          </Button>
        </div>
        <Stack justify="center">
          <Image src={image} className={classes.desktopImage} />
          <Center>
            <Group>
              <Text size="xs">
                <Anchor href="https://www.freepik.com/free-vector/error-404-concept-illustration_7741849.htm#query=404&position=4&from_view=keyword">
                  Image by storyset
                </Anchor>{" "}
                on Freepik
              </Text>
            </Group>
          </Center>
        </Stack>
      </SimpleGrid>
    </Container>
  );
}
