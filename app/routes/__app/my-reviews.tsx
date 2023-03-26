import { Container, Divider, ScrollArea, Stack, Title } from "@mantine/core";
import type { Product } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { authenticator } from "~/auth.server";
import { EmptyState } from "~/components/EmptyState";
import UserReviewList from "~/components/UserReviewList";
import { getProductById } from "~/models/product.server";
import {
  getCountOfHelpfulReviews,
  getCountOfUnhelpfulReviews,
  getHasUserMarkedReviewAsHelpful,
  getHasUserMarkedReviewAsUnhelpful,
  getReviewsByUserId,
} from "~/models/review.server";
import { getParsedProductContent } from "~/utils";

export async function loader({ request }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request);
  invariant(user, "Expected user exists");

  const reviews = (await getReviewsByUserId(Number(user.userId))) ?? [];
  const products = (await Promise.all(
    reviews.map((review) => {
      return getProductById(Number(review.productId));
    }),
  )) as Product[];

  const reviewsWithMetricsAndUserOpinion = await Promise.all(
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

  return json({
    products: products.map((product) => getParsedProductContent(product)),
    reviews: reviewsWithMetricsAndUserOpinion ?? [],
  });
}

export default function MyReviews() {
  const { products, reviews } = useLoaderData<typeof loader>();

  return (
    <Container size="lg">
      <Stack>
        {reviews.length > 0 ? (
          <ScrollArea>
            <Stack>
              <Title order={2}>My Reviews</Title>
              <Divider my="sm" />
              <UserReviewList reviews={reviews} products={products} />
            </Stack>
          </ScrollArea>
        ) : (
          <EmptyState
            title="It's empty here..."
            description="None of your reviews were found."
          />
        )}
      </Stack>
    </Container>
  );
}
