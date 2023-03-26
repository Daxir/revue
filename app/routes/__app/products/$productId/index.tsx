import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import ReviewSummary from "~/components/ReviewSummary";
import { getProductAcceptedReviews } from "~/models/review.server";
import { getReviewParsedContent } from "~/utils";

export async function loader({ params }: LoaderArgs) {
  const reviews = await getProductAcceptedReviews(Number(params.productId));

  return json({
    reviews: reviews.map((review) => getReviewParsedContent(review)),
  });
}

export default function ProductIndexPage() {
  const parameters = useParams();
  const { reviews } = useLoaderData<typeof loader>();
  return (
    <ReviewSummary
      productId={Number.parseInt(parameters.productId ?? "")}
      reviews={reviews}
    />
  );
}
