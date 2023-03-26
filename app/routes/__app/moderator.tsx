import { Button, Center, ScrollArea, Stack, Table } from "@mantine/core";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { authenticator } from "~/auth.server";
import { EmptyState } from "~/components/EmptyState";
import ReviewContentComponent from "~/components/ReviewContentComponent";
import type { ProductContent } from "~/models/product.server";
import {
  acceptReviewById,
  getNewReviewsWithFeatures,
  rejectReviewById,
} from "~/models/review.server";

export async function loader({ request }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });

  invariant(user, "User does not exist");
  if (user.userType !== "MODERATOR") {
    throw redirect("/");
  }

  const reviews = await getNewReviewsWithFeatures();
  return json({
    reviews,
  });
}

export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();
  const reviewId = form.get("reviewId");
  const uncheckedUser = await authenticator.isAuthenticated(request);
  const intent = form.get("intent");
  if (reviewId === null) throw new Error("Review not found");
  if (intent === "accept") {
    await acceptReviewById(Number(reviewId), uncheckedUser?.userId as number);
  } else if (intent === "reject") {
    await rejectReviewById(Number(reviewId), uncheckedUser?.userId as number);
  }
  return null;
};

export default function ModeratorPage() {
  const { reviews } = useLoaderData<typeof loader>();
  return (
    <ScrollArea data-testid="moderator-page">
      <Center>
        <Table
          horizontalSpacing="md"
          verticalSpacing="xs"
          sx={{ tableLayout: "auto", minWidth: 700, maxWidth: 1000 }}
        >
          <thead>
            <tr>
              <th>Review</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length > 0 ? (
              <>
                {reviews.map((review) => (
                  <tr
                    key={review.reviewId}
                    data-testid={`review-row-${review.reviewId}`}
                  >
                    <td>
                      <ReviewContentComponent
                        key={review.reviewId}
                        review={{ review }}
                        features={
                          (review.product.content as ProductContent)
                            .features_list
                        }
                        userId={undefined}
                      />
                    </td>
                    <td>
                      <Stack align="center" spacing="xl">
                        <form method="post">
                          <input
                            type="hidden"
                            name="reviewId"
                            value={review.reviewId}
                          />
                          <Button
                            name="intent"
                            value="accept"
                            type="submit"
                            color="green"
                            variant="subtle"
                          >
                            Accept
                          </Button>
                        </form>
                        <form method="post">
                          <input
                            type="hidden"
                            name="reviewId"
                            value={review.reviewId}
                          />
                          <Button
                            name="intent"
                            value="reject"
                            type="submit"
                            color="red"
                            variant="subtle"
                          >
                            Reject
                          </Button>
                        </form>
                      </Stack>
                    </td>
                  </tr>
                ))}
              </>
            ) : (
              <tr>
                <td colSpan={2}>
                  <EmptyState
                    title="No reviews to accept..."
                    description="It seems like there are no existing reviews to accept for you."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Center>
    </ScrollArea>
  );
}
