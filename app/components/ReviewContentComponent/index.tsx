import {
  Badge,
  Blockquote,
  Checkbox,
  Divider,
  Group,
  Paper,
  Rating,
  Space,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconArrowNarrowDown, IconArrowNarrowUp } from "@tabler/icons";
import type { ReviewContent, ReviewWithUserData } from "~/models/review.server";
import ReviewActionThumbs from "../ReviewActionThumbs";

const badgeColorMap = {
  negative: "red",
  neutral: "gray",
  positive: "green",
};

interface ReviewContentComponentProps {
  review: ReviewWithUserData;
  features: string[];
  userId: number | undefined;
}

export default function ReviewContentComponent({
  review,
  features,
  userId,
}: ReviewContentComponentProps) {
  const reviewContent = review.review.content as ReviewContent;
  return (
    <Paper p="md" data-testid={`review-${review.review.reviewId}`}>
      <Stack>
        <Group spacing="xl" position="apart">
          <Group>
            {reviewContent.grade}/10
            <Rating
              count={5}
              value={reviewContent.grade / 2}
              fractions={2}
              readOnly
            />
            <Badge color={badgeColorMap[reviewContent.category]}>
              {reviewContent.category}
            </Badge>
            {reviewContent.verified ? (
              <Badge color="green">Verified purchase</Badge>
            ) : null}
          </Group>
          <Group>
            <Checkbox
              label="Double quality"
              checked={reviewContent.double_quality}
              readOnly
            />
          </Group>
        </Group>
        {reviewContent.description ? (
          <Blockquote cite="">{reviewContent.description}</Blockquote>
        ) : null}
        <Group>
          {reviewContent.advantages ? (
            <Stack>
              <Title order={3}>
                Advantages <IconArrowNarrowUp size={24} />
              </Title>
              <Text>{reviewContent.advantages}</Text>
            </Stack>
          ) : null}
          {reviewContent.advantages && reviewContent.disadvantages ? (
            <Divider orientation="vertical" />
          ) : null}
          {reviewContent.disadvantages ? (
            <Stack>
              <Title order={3}>
                Disadvantages <IconArrowNarrowDown size={24} />
              </Title>
              <Text>{reviewContent.disadvantages}</Text>
            </Stack>
          ) : null}
        </Group>
        <Space h="sm" />
        <Stack>
          {features.length > 0
            ? features.map((feature, index) => (
                <Group key={feature}>
                  {feature}
                  <Rating
                    count={5}
                    value={reviewContent?.feature_grades[index] / 2 || 0}
                    fractions={2}
                    readOnly
                  />
                </Group>
              ))
            : null}
          <ReviewActionThumbs
            reviewWithOptionalUserData={review}
            userId={userId}
          />
        </Stack>
      </Stack>
    </Paper>
  );
}
