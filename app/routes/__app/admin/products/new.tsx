import {
  ActionIcon,
  Button,
  Center,
  Container,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { MIME_TYPES } from "@mantine/dropzone";
import { ProductCategory, ProductStatus } from "@prisma/client";
import type { ActionArgs } from "@remix-run/node";
import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createFileUploadHandler as createFileUploadHandler,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
  redirect,
} from "@remix-run/node";
import { Link, useTransition } from "@remix-run/react";
import { withYup } from "@remix-validated-form/with-yup";
import { IconPlus, IconTrash, IconX } from "@tabler/icons";
import { useState } from "react";
import { serverError } from "remix-utils";
import { ValidatedForm, validationError } from "remix-validated-form";
import { useSpinDelay } from "spin-delay";
import * as yup from "yup";
import FormImageDropzone from "~/components/FormImageDropzone";
import FormMultiSelect from "~/components/FormMultiSelect";
import FormSelect from "~/components/FormSelect";
import FormTextArea from "~/components/FormTextArea";
import FormTextInput from "~/components/FormTextInput";
import { addProduct, uploadProductPicture } from "~/models/product.server";
import { authenticator } from "~/auth.server";

enum Country {
  UK = "UK",
  DE = "DE",
  PL = "PL",
}

const MAX_NUMBER_OF_FEATURES = 10;

export async function action({ request }: ActionArgs) {
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

  type Product = Omit<yup.InferType<typeof schema>, "media"> & {
    media: File;
    category: ProductCategory;
  };

  const {
    name,
    category,
    manufacturer,
    media,
    description,
    countries,
    featuresList,
  } = fieldValues.data as Product;
  try {
    const pictureURL = await uploadProductPicture(media);

    let features: string[];
    if (typeof featuresList === "string") {
      features = [featuresList];
    } else if (Array.isArray(featuresList)) {
      features = featuresList as string[];
    } else {
      features = [];
    }

    const user = await authenticator.isAuthenticated( request, {
      failureRedirect: "/login",
    });

    await addProduct({
      product: {
        name,
        category,
        status: ProductStatus.ACCEPTED,
      },
      productContent: {
        manufacturer,
        media: pictureURL,
        description,
        countries:
          typeof countries === "string" ? [countries] : (countries as string[]),
        featuresList: features,
      },
    }, user?.userId as number);
    return redirect("/admin/products");
  } catch (error) {
    return serverError({ error });
  }
}

const schema = yup
  .object({
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
  })
  .optional();

export const validator = withYup(schema);

export default function AdminNewProductPage() {
  const [features, setFeatures] = useState<number[]>([]);
  const transition = useTransition();
  const isSubmitting = transition.state === "submitting";
  const shouldShowLoading = useSpinDelay(isSubmitting);

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
        <Group position="apart">
          <Title order={1}>New Product</Title>
          <Tooltip label="Cancel" withArrow>
            <ActionIcon
              color="red.6"
              variant="outline"
              aria-label="cancel"
              component={Link}
              to="/admin/products"
              id="cancel-button"
            >
              <IconX size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
        <ValidatedForm
          validator={validator}
          method="post"
          encType="multipart/form-data"
        >
          <Stack>
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
            <Grid>
              <Grid.Col span={6}>
                <FormTextArea
                  required
                  name="description"
                  label="Description"
                  placeholder="Description"
                />
              </Grid.Col>
              <Grid.Col span="auto">
                <Stack pb="md" spacing={0}>
                  <Stack spacing={0}>
                    <Text size="sm">Features</Text>
                    <Text size="xs" color="dimmed" italic>
                      Optional
                    </Text>
                  </Stack>
                  <SimpleGrid
                    cols={2}
                    breakpoints={[{ maxWidth: 1445, cols: 1 }]}
                  >
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
                  </SimpleGrid>
                  {features.length === 0 ? (
                    <Group pt="sm">
                      <AddFeatureButton />
                    </Group>
                  ) : null}
                </Stack>
              </Grid.Col>
            </Grid>
            <FormImageDropzone name="media" label="Product image" />
            <Center>
              <Button type="submit" loading={shouldShowLoading} w="50%">
                Submit
              </Button>
            </Center>
          </Stack>
        </ValidatedForm>
      </Stack>
    </Container>
  );
}
