import { Center, Stack, Text, Title } from "@mantine/core";
import { Outlet } from "@remix-run/react";
import type { ProductContent } from "~/models/product.server";
import type { ReviewWithUserData } from "~/models/review.server";
import ReviewContentComponent from "../ReviewContentComponent";

interface ProductReviewListProps {
  reviews: ReviewWithUserData[];
  productContent: ProductContent;
  userId: number | undefined;
}

export function ProductReviewList({
  reviews,
  productContent,
  userId,
}: ProductReviewListProps) {
  return (
    <>
      <Title order={2}>Reviews</Title>
      <Stack justify="space-around" align="center">
        <Outlet />
        <Stack sx={{ width: "90%" }}>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <ReviewContentComponent
                key={review.review.reviewId}
                review={review}
                features={productContent.features_list}
                userId={userId}
              />
            ))
          ) : (
            <Center>
              <Text italic>No one has reviewed this product yet.</Text>
            </Center>
          )}
        </Stack>
      </Stack>
    </>
  );
}

export default ProductReviewList;
