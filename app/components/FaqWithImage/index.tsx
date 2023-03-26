import {
  Accordion,
  Anchor,
  Center,
  Col,
  Container,
  Grid,
  Group,
  Image,
  Stack,
  Text,
  Title,
  createStyles,
} from "@mantine/core";
import { Link } from "@remix-run/react";
import image from "./image.svg";

const useStyles = createStyles((theme) => ({
  wrapper: {
    paddingTop: theme.spacing.xl * 2,
    paddingBottom: theme.spacing.xl * 2,
  },

  title: {
    marginBottom: theme.spacing.md,
    paddingLeft: theme.spacing.md,
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontFamily: `Greycliff CF, ${theme.fontFamily ?? "sans-serif"}`,
  },

  item: {
    fontSize: theme.fontSizes.sm,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[1]
        : theme.colors.gray[7],
  },
}));

export function FaqWithImage() {
  const { classes } = useStyles();
  return (
    <div className={classes.wrapper}>
      <Container size="lg">
        <Grid id="faq-grid" gutter={50} align="center">
          <Col span={12} md={6}>
            <Stack justify="center">
              <Image src={image} alt="Frequently Asked Questions" />
              <Center>
                <Group>
                  <Text size="xs">
                    <Anchor href="https://www.freepik.com/free-vector/faqs-concept-illustration_12832569.htm#query=faq&position=0&from_view=keyword">
                      Image by storyset
                    </Anchor>{" "}
                    on Freepik
                  </Text>
                </Group>
              </Center>
            </Stack>
          </Col>
          <Col span={12} md={6}>
            <Title order={2} align="left" className={classes.title}>
              Frequently Asked Questions
            </Title>

            <Accordion chevronPosition="right" variant="separated">
              <Accordion.Item
                className={classes.item}
                value="review-verification"
              >
                <Accordion.Control data-testid="review-verification-control">
                  Why can&apos;t I see my review immiediately?
                </Accordion.Control>
                <Accordion.Panel data-testid="review-verification-panel">
                  In order to prevent spamming and malicious actions, your
                  review needs to be verified by one of our moderators. Once
                  reviewed and accepted, you will see your review on the product
                  page.
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item className={classes.item} value="double-standard">
                <Accordion.Control>
                  What exactly is double standard?
                </Accordion.Control>
                <Accordion.Panel>
                  A double standard product is a product to which multiple
                  standards of quality are applied depending on a region this
                  product is offered in.
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item
                className={classes.item}
                value="suggest-a-product"
              >
                <Accordion.Control>
                  I would like to review a product, but I can&apos;t find it.
                  Can you add it for me?
                </Accordion.Control>
                <Accordion.Panel>
                  <Text>
                    Sure. Use our{" "}
                    <Anchor component={Link} to="/suggest">
                      Suggest a Product
                    </Anchor>{" "}
                    form to suggest a product. One of our moderators will review
                    your suggestion and add the product.
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item className={classes.item} value="remove-a-review">
                <Accordion.Control>
                  How can I remove one of my reviews?
                </Accordion.Control>
                <Accordion.Panel>
                  <Text>
                    Unfortunately, to prevent score manipulation, we do not
                    allow you to directly remove or edit your reviews. If you
                    would like to remove your review, please{" "}
                    <Anchor component={Link} to="/contact">
                      contact us
                    </Anchor>{" "}
                    and we will remove it for you.
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Col>
        </Grid>
      </Container>
    </div>
  );
}
