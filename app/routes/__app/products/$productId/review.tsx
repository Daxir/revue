import {
  Button,
  Center,
  Flex,
  Paper,
  Stack,
  Text,
  createStyles,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { ReviewStatus } from "@prisma/client";
import { type ActionArgs, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { withYup } from "@remix-validated-form/with-yup";
import { serverError } from "remix-utils";
import { ValidatedForm, validationError } from "remix-validated-form";
import invariant from "tiny-invariant";
import * as yup from "yup";
import FormCheckbox from "~/components/FormCheckbox";
import FormRating from "~/components/FormRating";
import FormTextArea from "~/components/FormTextArea";
import FormTextInput from "~/components/FormTextInput";
import type { ProductWithContent } from "~/models/product.server";
import { getProductById } from "~/models/product.server";
import { addReview, getUserReviewByProduct } from "~/models/review.server";
import { authenticator } from "../../../../auth.server";

const schema = yup
  .object({
    region: yup.string().required(),
    grade: yup.number().min(0).max(5).required(),
    description: yup.string().max(200).required(),
    advantages: yup.string().max(200).required(),
    disadvantages: yup.string().max(200).required(),
    doubleQuality: yup.string(),
    featureGrades: yup
      .array()
      .min(1)
      .max(10)
      .of(yup.number().min(0).max(5).required())
      .required(),
  })
  .optional();

export const validator = withYup(schema);

export async function loader({ params, request }: ActionArgs) {
  invariant(params.productId, "Expected product id parameter");
  invariant(Number(params.productId), "Expected a number");
  const product = await getProductById(Number(params.productId));
  const productFeatures = (product?.content as ProductWithContent["content"])
    .features_list;
  const user = await authenticator.isAuthenticated(request);
  invariant(user, "User is not authenticated");
  const userReview = await getUserReviewByProduct(
    Number(params.productId),
    user.userId,
  );
  const filteredReviews = userReview.filter(
    (review) => review.status !== ReviewStatus.REJECTED,
  );

  return json({
    hasUserAlreadyReviewed: user ? filteredReviews.length > 0 : false,
    userReview: filteredReviews[0],
    productFeatures,
  });
}

export async function action({ params, request }: ActionArgs) {
  const formData = await request.formData();
  const fieldValues = await validator.validate(formData);
  if (fieldValues.error) return validationError(fieldValues.error);
  const {
    region,
    grade,
    description,
    advantages,
    disadvantages,
    doubleQuality,
    featureGrades,
  } = fieldValues.data;
  try {
    const user = await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    });
    invariant(user, "User is not authenticated!");

    const product = (await getProductById(
      Number(params.productId),
    )) as ProductWithContent;
    if (!product) {
      throw new Response("Product not found", { status: 404 });
    }
    await addReview({
      review: {
        productId: product.productId,
        userId: user.userId,
      },
      reviewContent: {
        language: region?.toUpperCase(),
        grade: grade * 2,
        description,
        advantages,
        disadvantages,
        doubleQuality: doubleQuality === "on",
        verified: false,
        featureGrades: featureGrades?.map((grade: number) => grade * 2),
      },
    });
    return redirect(`/products/${product.productId}`);
  } catch (error) {
    return serverError({ error });
  }
}

const useStyles = createStyles(() => ({
  form: {
    width: "50%",
  },
}));

export default function Review() {
  const { classes } = useStyles();
  const { hasUserAlreadyReviewed, userReview, productFeatures } =
    useLoaderData<typeof loader>();
  const [region] = useLocalStorage({
    key: "revue-selected-region",
    defaultValue: "all",
  });
  return hasUserAlreadyReviewed ? (
    <Center>
      {userReview?.status === ReviewStatus.NEW ? (
        <Text italic>Please wait for the acceptence of your review.</Text>
      ) : (
        <Text italic>You&apos;ve already reviewed this product.</Text>
      )}
    </Center>
  ) : (
    <ValidatedForm className={classes.form} validator={validator} method="post">
      <Paper>
        <Stack p="md" mb="md">
          <input type="hidden" name="region" value={region} />
          <Flex align="center" justify="space-evenly">
            <Stack align="center">
              <Text fz="xl">Rating</Text>
              <FormRating data-testid="grade-rating" name="grade" />
            </Stack>
            <FormCheckbox label="Is double quality?" name="doubleQuality" />
          </Flex>
          <Stack>
            <FormTextArea name="description" label="Description" isRequired />
            <Flex justify="space-between">
              <FormTextInput name="advantages" label="Advantages" isRequired />
              <FormTextInput
                name="disadvantages"
                label="Disadvantages"
                isRequired
              />
            </Flex>
          </Stack>
          {productFeatures.length > 0 ? (
            <Stack>
              <Text align="center">Features</Text>
              <Flex justify="space-evenly">
                {productFeatures?.map((feature, index) => (
                  <Stack align="center" key={feature}>
                    <Text>{feature}</Text>
                    <FormRating
                      data-testid={`featureGrades[${index}]-rating`}
                      name={`featureGrades[${index}]`}
                    />
                  </Stack>
                ))}
              </Flex>
            </Stack>
          ) : null}
        </Stack>
        <Center pb="md">
          <Button type="submit">Submit</Button>
        </Center>
      </Paper>
    </ValidatedForm>
  );
}
