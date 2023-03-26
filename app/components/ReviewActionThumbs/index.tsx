import { ActionIcon, Group, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useFetcher } from "@remix-run/react";
import { IconThumbDown, IconThumbUp } from "@tabler/icons";
import { useState } from "react";
import type { ReviewWithUserData } from "~/models/review.server";

interface ReviewActionThumbsProps {
  reviewWithOptionalUserData: ReviewWithUserData;
  userId: number | undefined;
}

export default function ReviewActionThumbs({
  reviewWithOptionalUserData,
  userId,
}: ReviewActionThumbsProps) {
  const fetcher = useFetcher();
  const { userData, review } = reviewWithOptionalUserData;
  const [reviewMarkedAsHelpful, setReviewMarkedAsHelpful] = useDisclosure(
    userData?.hasCurrentUserMarkedReviewAsHelpful ?? false,
  );
  const [reviewMarkedAsUnhelpful, setReviewMarkedAsUnhelpful] = useDisclosure(
    userData?.hasCurrentUserMarkedReviewAsUnhelpful ?? false,
  );

  const [markedAsHelpfulCount, setMarkedAsHelpfulCount] = useState(
    userData?.markedAsHelpfulCount as number,
  );
  const [markedAsUnhelpfulCount, setMarkedAsUnhelpfulCount] = useState(
    userData?.markedAsUnhelpfulCount as number,
  );

  const handleMarkAsHelpful = () => {
    setReviewMarkedAsHelpful.toggle();
    setMarkedAsHelpfulCount(reviewMarkedAsHelpful ? markedAsHelpfulCount - 1 : markedAsHelpfulCount + 1);
    if (reviewMarkedAsUnhelpful) {
      setReviewMarkedAsUnhelpful.toggle();
      setMarkedAsUnhelpfulCount(
        reviewMarkedAsUnhelpful ? markedAsUnhelpfulCount - 1 : markedAsUnhelpfulCount + 1,
      );

    }
  };

  const handleMarkAsUnhelpful = () => {
    setReviewMarkedAsUnhelpful.toggle();
    setMarkedAsUnhelpfulCount(
      reviewMarkedAsUnhelpful ? markedAsUnhelpfulCount - 1 : markedAsUnhelpfulCount + 1,
    );
    if (reviewMarkedAsHelpful) {
      setReviewMarkedAsHelpful.toggle();
      setMarkedAsHelpfulCount(reviewMarkedAsHelpful ? markedAsHelpfulCount - 1 : markedAsHelpfulCount + 1);
    }
  };

  return (
    <fetcher.Form replace method="post">
      <Group spacing="xl">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="reviewId" value={review.reviewId} />
        <input
          type="hidden"
          name="markedHelpful"
          value={
            userData?.hasCurrentUserMarkedReviewAsHelpful ? "true" : "false"
          }
        />
        <input
          type="hidden"
          name="markedUnhelpful"
          value={
            userData?.hasCurrentUserMarkedReviewAsUnhelpful ? "true" : "false"
          }
        />
        <Stack spacing="xs">
          <Group spacing="xs">
            <Text data-testid={`action-upvotes-${review.reviewId}`}>
              {markedAsHelpfulCount}
            </Text>
            {userId ? (
              <ActionIcon
                type="submit"
                name="intent"
                value="markAsHelpful"
                variant={reviewMarkedAsHelpful ? "default" : "subtle"}
                onClick={handleMarkAsHelpful}
                disabled={fetcher.state !== "idle"}
                data-testid={`action-thumb-up-${review.reviewId}`}
              >
                <IconThumbUp size={24} color="green" />
              </ActionIcon>
            ) : (
              <IconThumbUp size={24} color="green" />
            )}
          </Group>
        </Stack>
        <Stack spacing="xs">
          <Group spacing="xs">
            <Text data-testid={`action-downvotes-${review.reviewId}`}>
              {markedAsUnhelpfulCount}
            </Text>

            {userId ? (
              <ActionIcon
                type="submit"
                name="intent"
                value="markAsUnhelpful"
                variant={reviewMarkedAsUnhelpful ? "default" : "subtle"}
                onClick={handleMarkAsUnhelpful}
                disabled={fetcher.state !== "idle"}
                data-testid={`action-thumb-down-${review.reviewId}`}
              >
                <IconThumbDown size={24} color="red" />
              </ActionIcon>
            ) : (
              <IconThumbDown size={24} color="red" />
            )}
          </Group>
        </Stack>
      </Group>
    </fetcher.Form>
  );
}
