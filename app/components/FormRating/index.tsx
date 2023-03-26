import { Rating, type RatingProps } from "@mantine/core";

interface FormRatingProps {
  name: string;
}

export default function FormRating({
  name,
  ...rest
}: FormRatingProps & RatingProps) {
  return <Rating name={name} fractions={2} {...rest} />;
}
