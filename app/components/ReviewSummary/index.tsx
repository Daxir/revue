import {
  Button,
  Flex,
  Paper,
  Rating,
  Slider,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import type { Review } from "@prisma/client";
import { Link } from "@remix-run/react";
import { IconStar } from "@tabler/icons";
import type { ReviewContent } from "~/models/review.server";

interface ReviewSummaryProps {
  productId: Review["productId"];
  reviews: Review[];
}

export default function ReviewSummary({
  productId,
  reviews,
}: ReviewSummaryProps) {
  const reviewsContent = reviews.map(
    (review) => review.content as ReviewContent,
  );
  const averageRating =
    reviewsContent.reduce(
      (accumulator, review) => accumulator + review.grade,
      0,
    ) / reviewsContent.length;
  return (
    <Flex sx={{ width: "90%" }} justify="space-around" mb="lg">
      <Stack
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Flex align="center">
          <Text fw="bold" sx={{ fontSize: "2.2em" }}>
            {(averageRating || 0).toPrecision(2).replace(".", ",")}
          </Text>
          <Text>/10</Text>
        </Flex>
        <Rating count={5} value={averageRating / 2} fractions={2} readOnly />
        <Text>({reviewsContent.length}) reviews</Text>
      </Stack>
      <Stack sx={{ gap: "0" }}>
        {[...Array.from({ length: 11 }).keys()].reverse().map((index) => (
          <Flex
            key={`feature-${index}`}
            align="center"
            justify="space-between"
            sx={{ width: "20em" }}
          >
            <IconStar color="teal" size="18px" />
            <Text ml="xs" mr="xs" fw="bold" sx={{ flex: "1" }}>
              {index}
            </Text>
            <Slider
              sx={{ width: "100%", flex: "12" }}
              disabled
              label={null}
              size="xs"
              color={index <= averageRating ? "teal" : "gray"}
              max={reviewsContent.length}
              defaultValue={
                reviewsContent.filter((review) => review.grade === index).length
              }
              styles={(theme) => ({
                root: {
                  cursor: "default",
                },
                mark: {
                  display: "none",
                },
                bar: {
                  backgroundColor: theme.colors.teal[6],
                  display: reviewsContent.some(
                    (review) => review.grade === index,
                  )
                    ? "block"
                    : "none",
                },
              })}
            />
            <Text ml="xs" sx={{ flex: "1" }}>
              {reviewsContent.filter((review) => review.grade === index).length}
            </Text>
          </Flex>
        ))}
      </Stack>
      <Paper
        sx={{
          display: "flex",
          height: "10rem",
          justifyContent: "space-around",
          flexDirection: "column",
          alignSelf: "center",
        }}
        shadow="sm"
        radius="md"
        p="md"
      >
        <Title order={3}>Are you familiar with this product?</Title>
        <Text fz="sm">
          Please share your opinion about it to help other users!
        </Text>
        <Flex justify="center">
          <Link prefetch="render" to={`/products/${productId}/review`}>
            <Button>Add your review</Button>
          </Link>
        </Flex>
      </Paper>
    </Flex>
  );
}
