import { Paper, createStyles } from "@mantine/core";
import type { ReviewWithUserData } from "~/models/review.server";
import ReviewContentComponent from "../ReviewContentComponent";

interface UserReviewBoxProps {
  review: ReviewWithUserData;
  features: string[];
}

const useStyles = createStyles((theme) => ({
  paperBox: {
    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },
}));

export default function UserReviewBox({
  review,
  features,
}: UserReviewBoxProps) {
  const { classes } = useStyles();

  return (
    <Paper
      p="md"
      className={classes.paperBox}
      data-testid={`user-review-${review.review.reviewId}`}
    >
      <ReviewContentComponent
        review={review}
        features={features ?? []}
        userId={review.review.userId}
      />
    </Paper>
  );
}
