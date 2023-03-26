import {
  Container,
  Grid,
  Pagination,
  SimpleGrid,
  TextInput,
  Title,
} from "@mantine/core";
import {
  useDebouncedState,
  useLocalStorage,
  usePagination,
} from "@mantine/hooks";
import { ProductCategory, ProductStatus } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import type { FormEvent } from "react";
import { useEffect, useRef } from "react";
import { useSpinDelay } from "spin-delay";
import { CategorySelect } from "~/components/CategorySelect";
import { EmptyState } from "~/components/EmptyState";
import ProductCard from "~/components/ProductCard";
import SkeletonProductCard from "~/components/SkeletonProductCard";
import { getProductsCount, getProductsPage } from "~/models/product.server";

const PAGE_SIZE = 30;

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const { search, page, region } = Object.fromEntries(
    url.searchParams.entries(),
  );
  const categoriesQuery = url.searchParams.getAll("categories");
  const categories =
    categoriesQuery?.length > 0
      ? categoriesQuery.map((c) => c as ProductCategory)
      : Object.values(ProductCategory);
  const totalPages = Math.ceil(
    (await getProductsCount(
      search ?? "",
      categories,
      region ?? "all",
      ProductStatus.ACCEPTED,
    )) / PAGE_SIZE,
  );
  const pageNumber = Number(page) > 0 ? Number(page) : 1;
  return json({
    products: await getProductsPage(
      search ?? "",
      pageNumber,
      PAGE_SIZE,
      categories.filter((category: string) => {
        return Object.values(ProductCategory).includes(
          category as ProductCategory,
        );
      }),
      region ?? "all",
      ProductStatus.ACCEPTED,
    ),
    totalPages,
  });
}

export default function ProductsPage() {
  const { products, totalPages } = useLoaderData<typeof loader>();
  const [region] = useLocalStorage({
    key: "revue-selected-region",
    defaultValue: "all",
  });
  const [searchQuery, setSearchQuery] = useDebouncedState("", 500);
  const submit = useSubmit();
  const transition = useTransition();
  const isLoading = transition.state === "submitting";
  const shouldRenderSkeletons = useSpinDelay(isLoading);
  const formReference = useRef<HTMLFormElement>(null);
  const pagination = usePagination({
    initialPage: 1,
    total: totalPages,
  });

  useEffect(() => {
    if (formReference.current) {
      submit(formReference.current);
    }
  }, [submit, region, searchQuery, pagination.active]);

  // I don't know how to do this in a way that satisifies the linter
  useEffect(() => {
    pagination.setPage(1);
  }, [region, searchQuery]);

  function handleChange(event: FormEvent<HTMLFormElement>) {
    pagination.first();
    submit(event.currentTarget);
  }

  const productCards = shouldRenderSkeletons
    ? [0, 1, 2].map((index) => (
        <SkeletonProductCard key={`product-card-skeleton-${index}`} />
      ))
    : products.map((product) => (
        <ProductCard key={product.productId} product={product} />
      ));

  return (
    <Container style={{ width: "100%" }} size="xl">
      <Title order={4} mb={5}>
        Browse products
      </Title>
      <Form
        method="get"
        action="/products"
        onChange={handleChange}
        ref={formReference}
      >
        <Grid align="flex-end">
          <Grid.Col span={8}>
            <TextInput
              label="Search"
              name="search"
              placeholder="Name or manufacturer"
              type="search"
              onChange={(event) => {
                event.stopPropagation();
                setSearchQuery(event.currentTarget.value);
              }}
              data-testid="search-input"
            />
          </Grid.Col>
          <Grid.Col span={2} mr="md">
            <CategorySelect />
          </Grid.Col>
        </Grid>
        <input type="hidden" name="region" value={region} />
        <input type="hidden" name="page" value={pagination.active} />
      </Form>
      {products.length === 0 ? (
        <EmptyState
          title="It's empty here..."
          description="No products matching your search criteria were found. Try to change your search parameters."
        />
      ) : null}
      {products.length > 0 ? (
        <>
          <SimpleGrid mt={10} cols={3}>
            {productCards}
          </SimpleGrid>
          <Pagination
            page={pagination.active}
            total={totalPages}
            onChange={pagination.setPage}
            position="center"
            mt={10}
          />
        </>
      ) : null}
    </Container>
  );
}
