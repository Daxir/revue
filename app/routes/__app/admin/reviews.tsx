import {
  Anchor,
  Avatar,
  Box,
  Button,
  Code,
  Group,
  LoadingOverlay,
  Paper,
  SimpleGrid,
  Spoiler,
  Text,
  Title,
} from "@mantine/core";
import { closeAllModals, openModal } from "@mantine/modals";
import type { Review } from "@prisma/client";
import { ReviewStatus } from "@prisma/client";
import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import { authenticator } from "~/auth.server";
import type { LoadedReview } from "~/components/ReviewCsvReader";
import ReviewCsvReader, {
  ParseReviewError,
} from "~/components/ReviewCsvReader";
import type { Country, ProductWithContent } from "~/models/product.server";
import { checkProductsExistence } from "~/models/product.server";
import type { ReviewContent } from "~/models/review.server";
import { addReviewFromCSV } from "~/models/review.server";
import type { WithOptional } from "~/utils";

export interface AddReviewProps {
  review: Omit<Review, "reviewId" | "content">;
  reviewContent: Omit<ReviewContent, "helpful">;
}

export interface ProductCheckRequest {
  name: string;
  countries: string[];
}

export interface ProductCheckResponse {
  responseTo: "checkProductAvailability";
  products: ProductWithContent[];
}

export interface ImportReviewsRequest {
  review: WithOptional<Omit<Review, "reviewId" | "content">, "userId">;
  reviewContent: Omit<ReviewContent, "helpful">;
}

export interface ImportReviewsResponse {
  responseTo: "importReviews";
  reviewIds: number[];
}

export async function action({ request }: ActionArgs) {
  const currentUser = await authenticator.isAuthenticated(request);
  if (!currentUser) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === "checkProductAvailability") {
    const products: ProductCheckRequest[] = JSON.parse(
      formData.get("products") as string,
    ) as ProductCheckRequest[];

    return json({
      responseTo: intent,
      products: await checkProductsExistence(products),
    });
  }

  if (intent === "importReviews") {
    const reviews: ImportReviewsRequest[] = JSON.parse(
      formData.get("reviews") as string,
    ) as ImportReviewsRequest[];

    const result = [];
    for (const review of reviews) {
      review.review.userId = currentUser.userId;
      const { reviewId } = await addReviewFromCSV(review as AddReviewProps);
      result.push(reviewId);
    }

    return json({
      responseTo: intent,
      reviewIds: result,
    });
  }

  return json({ error: "Invalid intent" }, { status: 400 });
}

export interface ProductReviewLink {
  product?: ProductWithContent;
  review: LoadedReview;
}

export default function AdminReviewsPage() {
  const submit = useSubmit();
  const actionData = useActionData<
    ProductCheckResponse | ImportReviewsResponse
  >();
  const [recognizedRows, setRecognizedRows] = useState<ProductReviewLink[]>([]);
  const [groupedByProduct, setGroupedByProduct] = useState<
    Record<string, ProductReviewLink[]>
  >({});
  const [notRecognizedRows, setNotRecognizedRows] = useState<object[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = (error: ParseReviewError, row?: object) => {
    if (row) {
      setNotRecognizedRows((previous) => [...previous, row]);
    }
    if (error === ParseReviewError.NO_HEADER) {
      openModal({
        title: "No header",
        children: (
          <>
            <Text>
              Please make sure that the first row of your CSV file contains the
              header row
            </Text>
            <Button onClick={() => closeAllModals()}>OK</Button>
          </>
        ),
      });
    }
  };

  const handleReviewsLoaded = (data: LoadedReview[]) => {
    setIsLoading(true);
    const products: ProductCheckRequest[] = [];
    for (const review of data) {
      products.push({
        name: review.product.name,
        countries: review.product.countries,
      });
    }
    const recognizedRows: ProductReviewLink[] = data.map((review) => ({
      product: undefined,
      review,
    }));
    setRecognizedRows(recognizedRows);
    submit(
      {
        intent: "checkProductAvailability",
        products: JSON.stringify(products),
      },
      {
        method: "post",
      },
    );
  };

  const handleProductCheckResponse = (data: ProductWithContent[]) => {
    const result: ProductReviewLink[] = [];
    for (const productReviewLink of recognizedRows) {
      const product = data.find((p) => {
        const sameName = p.name === productReviewLink.review.product.name;
        const { countries } = p.content;
        const productHaveAllCountries: boolean = countries.some((country) => {
          return productReviewLink.review.product.countries.includes(country);
        });
        const reviewHaveAllCountries: boolean =
          productReviewLink.review.product.countries.some((country) => {
            return countries.includes(country as Country);
          });
        if (sameName && productHaveAllCountries && reviewHaveAllCountries) {
          return p;
        }
      });
      result.push({
        product: product,
        review: productReviewLink.review,
      });
    }

    const groupedByProduct: Record<string, ProductReviewLink[]> = {};
    for (const productReviewLink of result) {
      const key = productReviewLink.product?.productId ?? "none";
      if (groupedByProduct[key] === undefined) {
        groupedByProduct[key] = [];
      }
      groupedByProduct[key].push(productReviewLink);
    }

    setGroupedByProduct(groupedByProduct);
    setIsLoading(false);
  };

  const handleImport = () => {
    setIsLoading(true);
    const reviewsToImport: ImportReviewsRequest[] = [];

    for (const productReviewLinks of Object.values(groupedByProduct)) {
      for (const productReviewLink of productReviewLinks) {
        const { review, product } = productReviewLink;
        const { reviewContent } = review;
        if (product) {
          const featuresGrades: number[] = [];
          for (const feature of product.content.features_list) {
            featuresGrades.push(Number(reviewContent.grade));
          }
          reviewsToImport.push({
            review: {
              productId: product.productId,
              status: ReviewStatus.ACCEPTED,
            },
            reviewContent: {
              ...reviewContent,
              ratingsList: featuresGrades,
            },
          });
        }
      }
    }
    submit(
      {
        intent: "importReviews",
        reviews: JSON.stringify(reviewsToImport),
      },
      { method: "post" },
    );
  };

  useEffect(() => {
    if (actionData === undefined) return;
    if (actionData.responseTo === "checkProductAvailability") {
      handleProductCheckResponse(actionData.products);
    }
    if (actionData.responseTo === "importReviews") {
      openModal({
        title: "Imported reviews",
        children: (
          <>
            <Text>
              {actionData.reviewIds.length} reviews were imported successfully
            </Text>
            <Button onClick={() => closeAllModals()}>OK</Button>
          </>
        ),
      });
      setIsLoading(false);
    }
  }, [actionData]);

  return (
    <Box sx={{ position: "relative", minHeight: "40vh" }}>
      <LoadingOverlay visible={isLoading} />
      <Group position="apart">
        <ReviewCsvReader
          beforeFileLoad={() => setNotRecognizedRows([])}
          onFileLoad={handleReviewsLoaded}
          onError={handleError}
        />
        <Button
          hidden={recognizedRows.length === 0}
          onClick={handleImport}
        >{`Import ${
          recognizedRows.length - (groupedByProduct.none?.length ?? 0)
        } reviews`}</Button>
      </Group>

      <Spoiler
        maxHeight={0}
        showLabel={`Show unrecognized rows (${notRecognizedRows.length})`}
        hideLabel={`Hide unrecognized rows (${notRecognizedRows.length})`}
        hidden={notRecognizedRows.length === 0}
      >
        <Paper p="sm">
          {notRecognizedRows.map((row) => (
            <Code block key={JSON.stringify(row)} mt="sm">
              {JSON.stringify(row, null, 2)}
            </Code>
          ))}
        </Paper>
      </Spoiler>
      <Box>
        <SimpleGrid
          cols={1}
          breakpoints={[
            { minWidth: "sm", cols: 2 },
            { minWidth: "md", cols: 3 },
            { minWidth: "lg", cols: 4 },
            { minWidth: "xl", cols: 5 },
          ]}
        >
          {Object.values(groupedByProduct).map((productReviews) => {
            const product = productReviews[0]?.product;

            return (
              <Paper
                key={product?.productId ?? "none"}
                sx={product ? {} : { backgroundColor: "#DB5454" }}
                p="xs"
              >
                <Anchor
                  href={`/products/${product?.productId ?? ""}`}
                  target="_blank"
                >
                  <Avatar
                    src={product?.content.media ?? null}
                    alt="Product image"
                  />
                  <Title order={4} inline>
                    {product?.name ?? "Product Not Found"}
                  </Title>
                </Anchor>

                <Text>Reviews found {productReviews.length}</Text>
              </Paper>
            );
          })}
        </SimpleGrid>
      </Box>
    </Box>
  );
}
