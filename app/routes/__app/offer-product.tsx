import {
  ActionIcon,
  Button,
  Center,
  Checkbox,
  Container,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title
} from "@mantine/core";
import { MIME_TYPES } from "@mantine/dropzone";
import { useDisclosure } from "@mantine/hooks";
import { ProductCategory, ProductStatus } from "@prisma/client";
import {
  redirect, unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createFileUploadHandler as createFileUploadHandler,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData, type ActionArgs
} from "@remix-run/node";
import { useTransition } from "@remix-run/react";
import { withYup } from "@remix-validated-form/with-yup";
import { IconPlus, IconTrash } from "@tabler/icons";
import { useState } from "react";
import { serverError } from "remix-utils";
import { ValidatedForm, validationError } from "remix-validated-form";
import { useSpinDelay } from "spin-delay";
import invariant from "tiny-invariant";
import * as yup from "yup";
import { authenticator } from "~/auth.server";
import FormCheckbox from "~/components/FormCheckbox";
import FormImageDropzone from "~/components/FormImageDropzone";
import FormMultiSelect from "~/components/FormMultiSelect";
import FormRating from "~/components/FormRating";
import FormSelect from "~/components/FormSelect";
import FormTextArea from "~/components/FormTextArea";
import FormTextInput from "~/components/FormTextInput";
import { addProduct, uploadProductPicture } from "~/models/product.server";
import { addReview } from "~/models/review.server";
import { Country, ReviewCategory } from "~/utils";

const MAX_NUMBER_OF_FEATURES = 10;

export async function action({ request }: ActionArgs) {
  const user = await authenticator.isAuthenticated(request);
  invariant(user, "Expected user exists");
  const uploadHandler = composeUploadHandlers(
    createFileUploadHandler({
      maxPartSize: 5_000_000,
      file: ({ filename }) => filename,
    }),
    createMemoryUploadHandler(),
  );
  const formData = await parseMultipartFormData(request, uploadHandler);
  const fieldValues = await validator.validate(formData);
  if (fieldValues.error) return validationError(fieldValues.error);

  type ProductAndReview = Omit<yup.InferType<typeof schema>, "media"> & {
    media: File;
    category: ProductCategory;
  };

  const {
    isReview,
    name,
    category,
    manufacturer,
    verified,
    media,
    description,
    countries,
    featuresList,
    ratingsList,
    grade,
    reviewLanguage,
    reviewDescription,
    advantages,
    disadvantages,
    doubleQuality,
  } = fieldValues.data as ProductAndReview;
  try {
    let features: string[];
    if (typeof featuresList === "string") {
      features = [featuresList];
    } else if (Array.isArray(featuresList)) {
      features = featuresList as string[];
    } else {
      features = [];
    }

    const pictureURL = await uploadProductPicture(media);

    const addedProduct = await addProduct(
      {
        product: {
          name,
          category,
          status: ProductStatus.NEW,
        },
        productContent: {
          manufacturer,
          media: pictureURL,
          description,
          countries:
            typeof countries === "string"
              ? [countries]
              : (countries as string[]),
          featuresList: features,
        },
      },
      user.userId,
    );

    const addedReview = isReview
      ? await addReview({
          review: {
            productId: addedProduct.productId,
            userId: user.userId,
          },
          reviewContent: {
            grade: grade as number * 2,
            language: reviewLanguage,
            description: reviewDescription,
            advantages,
            disadvantages,
            doubleQuality: doubleQuality === "on",
            verified: verified === "on",
            featureGrades: ratingsList?.map((grade: number) => grade * 2),
          },
        })
      : true;

    await Promise.all([pictureURL, addedProduct, addedReview]);

    return redirect("/");
  } catch (error) {
    return serverError({ error });
  }
}

const schema = yup
  .object({
    isReview: yup.boolean().required(),
    name: yup.string().max(30).required(),
    category: yup.string().oneOf(Object.values(ProductCategory)).required(),
    manufacturer: yup.string().max(30).required(),
    media: yup
      .mixed()
      .test("fileType", "File is not a PNG or JPEG image", (value: File) => {
        return value.type === MIME_TYPES.jpeg || value.type === MIME_TYPES.png;
      })
      .required(),
    description: yup.string().max(200).required(),
    countries: yup.lazy((value) => {
      return typeof value === "string"
        ? yup.string().oneOf(Object.values(Country)).required()
        : yup
            .array()
            .of(yup.string().oneOf(Object.values(Country)))
            .max(Object.values(Country).length)
            .required();
    }),
    featuresList: yup.lazy((value) => {
      return typeof value === "string"
        ? yup.string().max(30).required()
        : yup.array().of(yup.string().max(30)).max(MAX_NUMBER_OF_FEATURES);
    }),
    ratingsList: yup
      .array()
      .min(0)
      .max(MAX_NUMBER_OF_FEATURES)
      .of(yup.number().min(0).max(5).required()),
    grade: yup
      .number()
      .when("isReview", (isReview) => (isReview ? yup.number().min(0).max(5).required() : yup.number()),
      ),
    reviewCategory: yup
      .object()
      .when("isReview", (isReview) => (isReview
          ? yup.string().oneOf(Object.values(ReviewCategory)).required()
          : yup.string()),
      ),
    reviewLanguage: yup
      .object()
      .when("isReview", (isReview) => (isReview
          ? yup.string().oneOf(Object.values(Country)).required()
          : yup.string()),
      ),
    reviewDescription: yup
      .object()
      .when("isReview", (isReview) => (isReview ? yup.string().max(200).required() : yup.string()),
      ),
    advantages: yup.string().max(50),
    disadvantages: yup.string().max(50),
    verified: yup.string(),
    doubleQuality: yup.string(),
  })
  .optional();

export const validator = withYup(schema);

export default function UserNewProductPage() {
  const [features, setFeatures] = useState<number[]>([]);
  const transition = useTransition();
  const isSubmitting = transition.state === "submitting";
  const shouldShowLoading = useSpinDelay(isSubmitting);
  const [isReview, setIsReview] = useDisclosure(true);

  function AddFeatureButton() {
    return (
      <ActionIcon
        type="button"
        color="teal"
        variant="outline"
        aria-label="add-feature"
        onClick={() => {
          setFeatures((previous) => {
            const lastItem = previous.at(-1) ?? -1;
            return [...previous, lastItem + 1];
          });
        }}
      >
        <IconPlus size={18} />
      </ActionIcon>
    );
  }

  return (
    <Container
      sx={{
        maxWidth: "50vw",
      }}
    >
      <Stack>
        <Title order={1}>Offer Product</Title>
        <ValidatedForm
          validator={validator}
          method="post"
          encType="multipart/form-data"
        >
          <Stack>
            <input type="hidden" name="isReview" value={String(isReview)} />
            <Checkbox
              name="irrevelant"
              label="Attach your own review"
              checked={isReview}
              onChange={setIsReview.toggle}
            />
            <SimpleGrid cols={2}>
              <FormTextInput
                required
                name="name"
                label="Product name"
                placeholder="Product name"
              />
              <FormTextInput
                required
                name="manufacturer"
                label="Manufacturer"
                placeholder="Manufacturer"
              />
              <FormSelect
                required
                name="category"
                label="Category"
                data={Object.values(ProductCategory)}
                withAsterisk={false}
              />
              <FormMultiSelect
                name="countries"
                label="Countries"
                data={Object.values(Country).map((country) => ({
                  value: country,
                  label: country,
                }))}
              />
            </SimpleGrid>
            <Stack>
              <FormTextArea
                required
                name="description"
                label="Description"
                placeholder="Description"
              />
              <Stack pb="md" spacing={0}>
                <Stack spacing={0}>
                  <Text size="sm">Features</Text>
                  <Text size="xs" color="dimmed" italic>
                    Optional
                  </Text>
                </Stack>
                <Stack>
                  {features.map((value, index) => {
                    const shouldRenderAddFeatureButton =
                      index === features.length - 1 &&
                      index < MAX_NUMBER_OF_FEATURES - 1;
                    return (
                      <Group key={value} spacing="xs" align="flex-end">
                        <FormTextInput
                          required
                          name="featuresList"
                          label={`Feature ${index + 1}`}
                          placeholder={`Feature ${index + 1}`}
                          sx={{
                            flex: 1,
                            minWidth: 0,
                          }}
                        />
                        <Stack hidden={!isReview}>
                          <Title order={6}>Rating {index + 1}</Title>
                          <FormRating data-testid={`feature-grade-${index}`} name={`ratingsList[${index}]`} />
                        </Stack>
                        <Group spacing="xs">
                          <ActionIcon
                            type="button"
                            color="red.6"
                            variant="outline"
                            aria-label="delete"
                            onClick={() => {
                              setFeatures((previous) => {
                                return previous.filter(
                                  (_, index_) => index_ !== index,
                                );
                              });
                            }}
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                          {shouldRenderAddFeatureButton ? (
                            <AddFeatureButton />
                          ) : null}
                        </Group>
                      </Group>
                    );
                  })}
                </Stack>
                {features.length === 0 ? (
                  <Group pt="sm">
                    <AddFeatureButton />
                  </Group>
                ) : null}
              </Stack>
            </Stack>
            <FormImageDropzone name="media" label="Product image" />
          </Stack>
          <Stack hidden={!isReview} data-testid="rest-of-review">
            <Divider my="sm" />
            <Title order={1}>Review</Title>
            <Group>
              <Text>Overall rating:</Text>
              <FormRating data-testid="grade-rating" name="grade" />
            </Group>
            <SimpleGrid cols={2}>
              <FormCheckbox
                name="verified"
                labelPosition="left"
                label="Verified"
              />
              <FormCheckbox
                name="doubleQuality"
                labelPosition="left"
                label="Double quality"
              />
            </SimpleGrid>
            <SimpleGrid cols={2}>
              <FormSelect
                required
                name="reviewCategory"
                label="Category"
                data={Object.values(ReviewCategory)}
                withAsterisk={false}
              />
              <FormSelect
                required
                name="reviewLanguage"
                label="Language"
                data={Object.values(Country).map((country) => ({
                  value: country,
                  label: country,
                }))}
                withAsterisk={false}
              />
            </SimpleGrid>
            <FormTextArea
              required
              name="reviewDescription"
              label="Description"
              placeholder="What have you noticed using the product"
            />
            <SimpleGrid cols={2}>
              <FormTextArea
                name="advantages"
                label="Advantages"
                placeholder="Advantages..."
              />
              <FormTextArea
                name="disadvantages"
                label="Disadvantages"
                placeholder="Disadvantages..."
              />
            </SimpleGrid>
          </Stack>
          <Divider my="sm" />
          <Center>
            <Button type="submit" loading={shouldShowLoading} w="50%">
              Submit
            </Button>
          </Center>
        </ValidatedForm>
      </Stack>
    </Container>
  );
}
