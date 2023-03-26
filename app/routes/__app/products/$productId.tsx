import { Carousel } from "@mantine/carousel";
import {
  Center,
  Container,
  Divider,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import type { Product } from "@prisma/client";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { IconCircleCheck } from "@tabler/icons";
import { CircleFlag } from "react-circle-flags";
import invariant from "tiny-invariant";
import { authenticator } from "~/auth.server";
import ProductCard from "~/components/ProductCard";
import ProductReviewList from "~/components/ProductReviewList";
import type {
  ProductContent,
  ProductWithContent,
} from "~/models/product.server";
import { getAllProducts, getProductById } from "~/models/product.server";
import {
  addReviewHelpful,
  addReviewUnhelpful,
  deleteReviewHelpful,
  deleteReviewUnhelpful,
  getCountOfHelpfulReviews,
  getCountOfUnhelpfulReviews,
  getHasUserMarkedReviewAsHelpful,
  getHasUserMarkedReviewAsUnhelpful,
  getProductAcceptedReviews,
} from "~/models/review.server";
import { getParsedProductContent } from "~/utils";

export async function loader({ params, request }: LoaderArgs) {
  invariant(params.productId, "Expected product id parameter");
  invariant(Number(params.productId), "Expected a number");

  const product = (await getProductById(
    Number(params.productId),
  )) as ProductWithContent;
  if (!product) {
    throw new Response("Product not found", { status: 404 });
  }

  const linkedProducts = await Promise.all(
    product.content.linked_products?.map((productId) => {
      return getProductById(productId);
    }) ?? [],
  );

  const sameCategoryProducts = await getAllProducts();

  const reviews = await getProductAcceptedReviews(Number(params.productId));
  const user = await authenticator.isAuthenticated(request);

  let reviewsWithMetricsAndUserData;
  let reviewsWithMetrics;
  if (user) {
    reviewsWithMetricsAndUserData = await Promise.all(
      reviews.map(async (review) => {
        return {
          review,
          userData: {
            markedAsHelpfulCount: await getCountOfHelpfulReviews(
              Number(review.reviewId),
            ),
            markedAsUnhelpfulCount: await getCountOfUnhelpfulReviews(
              Number(review.reviewId),
            ),
            hasCurrentUserMarkedReviewAsHelpful:
              await getHasUserMarkedReviewAsHelpful(
                Number(review.reviewId),
                user.userId,
              ),
            hasCurrentUserMarkedReviewAsUnhelpful:
              await getHasUserMarkedReviewAsUnhelpful(
                Number(review.reviewId),
                user.userId,
              ),
          },
        };
      }),
    );
  } else {
    reviewsWithMetrics = await Promise.all(
      reviews.map(async (review) => {
        return {
          review,
          userData: {
            markedAsHelpfulCount: await getCountOfHelpfulReviews(
              Number(review.reviewId),
            ),
            markedAsUnhelpfulCount: await getCountOfUnhelpfulReviews(
              Number(review.reviewId),
            ),
          },
        };
      }),
    );
  }

  return json({
    product: getParsedProductContent(product),
    linkedProducts: linkedProducts
      .filter((product) => product !== null)
      .map((product) => getParsedProductContent(product as Product)),
    reviews: user
      ? reviewsWithMetricsAndUserData ?? []
      : reviewsWithMetrics ?? [],
    userId: user?.userId,
    sameCategoryProducts: sameCategoryProducts
      .filter((production) => {
        return (
          production.category === product.category &&
          production.productId !== product.productId
        );
      })
      .map((product) => getParsedProductContent(product)),
  });
}

export async function action({ params, request }: ActionArgs) {
  invariant(params.productId, "Expected product id parameter");
  invariant(Number(params.productId), "Expected a number");
  const formData = await request.formData();
  const { intent, markedHelpful, markedUnhelpful, reviewId, userId } =
    Object.fromEntries(formData);

  switch (intent) {
    case "markAsHelpful": {
      if (markedHelpful === "true") {
        return deleteReviewHelpful(Number(reviewId), Number(userId));
      }
      if (markedUnhelpful === "false") {
        return addReviewHelpful(Number(reviewId), Number(userId));
      }
      return Promise.all([
        deleteReviewUnhelpful(Number(reviewId), Number(userId)),
        addReviewHelpful(Number(reviewId), Number(userId)),
      ]);
    }
    case "markAsUnhelpful": {
      if (markedUnhelpful === "true") {
        return deleteReviewUnhelpful(Number(reviewId), Number(userId));
      }
      if (markedHelpful === "false") {
        return addReviewUnhelpful(Number(reviewId), Number(userId));
      }
      return Promise.all([
        deleteReviewHelpful(Number(reviewId), Number(userId)),
        addReviewUnhelpful(Number(reviewId), Number(userId)),
      ]);
    }
  }
  return null;
}

export default function ProductDetailsPage() {
  const { product, linkedProducts, reviews, userId, sameCategoryProducts } =
    useLoaderData<typeof loader>();

  const parsedContent = product.content as ProductContent;
  const similarProducts = [
    ...sameCategoryProducts.filter((sameCategoryProduct) => {
      return !linkedProducts.includes(sameCategoryProduct);
    }),
    ...linkedProducts,
  ];

  return (
    <Container size="xl" mt={30}>
      <Group>
        <Stack
          sx={{
            flex: 4,
          }}
          mr={10}
        >
          <Title order={1} align="center">
            {product.name}
          </Title>
          <Group position="apart">
            <Text weight="bold">Manufactured by</Text>
            <Text>{parsedContent.manufacturer}</Text>
          </Group>
          <Divider my="xs" />
          <Group position="apart">
            <Text weight="bold">Available in</Text>
            <Group>
              {parsedContent.countries.map((country) => (
                <CircleFlag
                  countryCode={country.toLowerCase()}
                  key={country}
                  width="30"
                  data-testid={`flag-${country}`}
                  height="30"
                />
              ))}
            </Group>
          </Group>
        </Stack>
        <Center sx={{ flex: 6 }}>
          <Image
            src={parsedContent.media}
            height="300px"
            width="auto"
            withPlaceholder
          />
        </Center>
      </Group>
      <Stack>
        <Title order={2}>Description</Title>
        <Text>{parsedContent.description}</Text>
      </Stack>
      <Divider my="md" />
      {parsedContent.features_list?.length > 0 ? (
        <>
          <Stack mb="md">
            <Title order={2}>Features</Title>
            <SimpleGrid
              cols={3}
              spacing="xl"
              breakpoints={[
                { maxWidth: 980, cols: 2, spacing: "xl" },
                { maxWidth: 755, cols: 1, spacing: "xl" },
              ]}
            >
              {parsedContent.features_list.map((feature) => (
                <Group
                  key={feature}
                  data-testid={`detail-${feature}`}
                  align="center"
                >
                  <ThemeIcon color="teal" size={24} radius="xl">
                    <IconCircleCheck size={16} />
                  </ThemeIcon>
                  <Text>{feature}</Text>
                </Group>
              ))}
            </SimpleGrid>
          </Stack>
          <Divider my="sm" />
        </>
      ) : null}
      {similarProducts.length > 0 ? (
        <>
          <Stack>
            <Title order={2}>Similar products</Title>
            <Carousel
              withIndicators
              height="100%"
              slideSize="33.333333%"
              slideGap="md"
              loop
              align="start"
              slidesToScroll={3}
            >
              {similarProducts.map((product) => (
                <Carousel.Slide key={product.productId}>
                  <ProductCard product={product} />
                </Carousel.Slide>
              ))}
            </Carousel>
          </Stack>
          <Divider my="sm" />
        </>
      ) : null}
      {reviews ? (
        <ProductReviewList
          reviews={reviews}
          productContent={parsedContent}
          userId={userId}
        />
      ) : null}
    </Container>
  );
}
