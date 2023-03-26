import {
  Anchor,
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

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  const { classes } = useStyles();

  return (
    <Container className={classes.root} data-testid="empty-state">
      <SimpleGrid
        spacing={80}
        cols={2}
        breakpoints={[{ maxWidth: "sm", cols: 1, spacing: 40 }]}
      >
        <Image src={image} className={classes.mobileImage} />
        <div>
          <Title className={classes.title}>{title}</Title>
          <Text color="dimmed" size="lg">
            {description}
          </Text>
        </div>
        <Stack justify="center">
          <Image src={image} className={classes.desktopImage} />
          <Center>
            <Group>
              <Text size="xs">
                <Anchor href="https://pl.freepik.com/darmowe-wektory/ilustracja-pusta-koncepcja_7117865.htm">
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
