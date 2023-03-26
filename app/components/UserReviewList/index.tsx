import { Stack } from "@mantine/core";
import type { Product } from "@prisma/client";
import { Link } from "@remix-run/react";
import type { ProductContent } from "~/models/product.server";
import type { ReviewWithUserData } from "~/models/review.server";
import UserReviewBox from "../UserReviewBox";

interface UserReviewListProps {
  reviews: ReviewWithUserData[];
  products: Product[];
}

export default function UserReviewList({
  reviews,
  products,
}: UserReviewListProps) {
  const mappedContents = products.map(
    (product) => product.content,
  ) as ProductContent[];

  return (
    <Stack>
      {reviews.length > 0
        ? reviews.map((review, index) => (
            <Link
              key={review.review.reviewId}
              style={{ textDecoration: "none" }}
              to={`/products/${review.review.productId}`}
            >
              <UserReviewBox
                review={review}
                features={mappedContents[index].features_list}
              />
            </Link>
          ))
        : null}
    </Stack>
  );
}
