import {
  Button,
  Center,
  Group,
  Modal,
  ScrollArea,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { ProductCategory, ProductStatus } from "@prisma/client";
import { json } from "@remix-run/node";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { CircleFlag } from "react-circle-flags";
import EditProductModal from "~/components/EditProductModel";
import { EmptyState } from "~/components/EmptyState";
import type {
  Country,
  ProductContent,
  ProductWithContent,
} from "~/models/product.server";
import {
  changeStatusOfProduct,
  getProductsPage,
} from "~/models/product.server";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";
  const pageSize = Number(url.searchParams.get("pageSize")) || 20;
  const page = Number(url.searchParams.get("page")) || 1;
  const categoriesQuery = url.searchParams.getAll("categories");
  const categories =
    categoriesQuery.length > 0
      ? categoriesQuery
      : Object.values(ProductCategory);
  const region = url.searchParams.get("region") ?? "all";

  return json({
    products: (await getProductsPage(
      search,
      page,
      pageSize,
      categories.filter((category) => {
        return Object.values(ProductCategory).includes(
          category as ProductCategory,
        );
      }) as ProductCategory[],
      region,
      "NEW",
    )) as ProductWithContent[],
  });
}

export async function action({ request }: ActionArgs) {
  const data = await request.formData();
  if (Number.isNaN(data.get("productId"))) {
    return { error: "error" };
  }
  const productId = Number(data.get("productId"));
  const action = data.get("intent") as string;

  if (action === "reject") {
    return json({
      success: await changeStatusOfProduct(productId, ProductStatus.REJECTED),
    });
  }
  if (action === "accept") {
    return json({
      success: await changeStatusOfProduct(productId, ProductStatus.ACCEPTED),
    });
  }
  if (action === "edit") {
    const productName = data.get("name")?.toString();
    const productCategory = data.get("category")?.toString() as ProductCategory;
    if (productName === undefined || productCategory === undefined) {
      return { error: "error" };
    }

    const formContent: ProductContent = {
      features_list: JSON.parse(
        data.get("content.features_list")?.toString() ?? "[]",
      ) as string[],
      linked_products: JSON.parse(
        data.get("content.linked_products")?.toString() ?? "[]",
      ) as number[],
      media: data.get("content.media")?.toString() ?? "",
      manufacturer: data.get("content.manufacturer")?.toString() ?? "",
      description: data.get("content.description")?.toString() ?? "",
      countries: (data.get("content.countries")?.toString() ?? "").split(
        ",",
      ) as Country[],
    };

    const content = {
      name: productName,
      category: productCategory,
      content: formContent,
    };
    return json({
      success: await changeStatusOfProduct(
        productId,
        ProductStatus.ACCEPTED,
        content,
      ),
    });
  }

  return json({ success: false });
}

export default function AdminProductsPage() {
  const submit = useSubmit();

  const { products } = useLoaderData<typeof loader>();
  const rows =
    products.length > 0 ? (
      products.map(({ productId, name, category, content }, index) => (
        <tr key={productId}>
          <td>{name}</td>
          <td>{category}</td>
          <td>
            <Text lineClamp={4} sx={{ maxWidth: "18rem" }}>
              {content.description}
            </Text>
          </td>
          <td>
            <Group>
              {content.countries.map((country) => (
                <CircleFlag
                  countryCode={country.toLowerCase()}
                  key={country}
                  width="30"
                  height="30"
                />
              ))}
            </Group>
          </td>
          <td>
            <Button
              variant="subtle"
              onClick={() => {
                return setConfirmModalState({ opened: true, product: index });
              }}
            >
              Add
            </Button>
            <Button
              variant="subtle"
              onClick={() => {
                return setEditModalState({ opened: true, product: index });
              }}
            >
              Edit
            </Button>
            <Button
              variant="subtle"
              onClick={() => handleAction(productId, "reject")}
            >
              Delete
            </Button>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td>
          <EmptyState
            title="No new products found..."
            description="It seems like there are no new products added by users."
          />
        </td>
      </tr>
    );

  const [editModalState, setEditModalState] = useState({
    opened: false,
    product: 0,
  });

  const [confirmModalState, setConfirmModalState] = useState({
    opened: false,
    product: 0,
  });

  const handleAction = (productId: number, intent: "accept" | "reject") => {
    submit(
      {
        productId: productId.toString(),
        intent,
      },
      { method: "post", replace: true },
    );
    setConfirmModalState((value) => ({ ...value, opened: false }));
  };

  return (
    <>
      <EditProductModal
        size="xl"
        opened={editModalState.opened}
        onClose={() => setEditModalState((old) => ({ ...old, opened: false }))}
        title={products[editModalState.product]?.name}
        product={products[editModalState.product]}
      />

      <Modal
        size="xl"
        opened={confirmModalState.opened}
        onClose={() => {
          return setConfirmModalState((old) => ({ ...old, opened: false }));
        }}
        title={products[confirmModalState.product]?.name}
      >
        <Center>
          <Title>Are you sure?</Title>
        </Center>
        <Center mt="md">
          <Group>
            <Button
              onClick={() => {
                return handleAction(
                  products[confirmModalState.product]?.productId,
                  "accept",
                );
              }}
            >
              Yes
            </Button>
            <Button
              onClick={() => {
                return setConfirmModalState((old) => ({
                  ...old,
                  opened: false,
                }));
              }}
            >
              No
            </Button>
          </Group>
        </Center>
      </Modal>

      <ScrollArea>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th style={{ maxWidth: "18rem" }}>Description</th>
              <th>Country</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </ScrollArea>
    </>
  );
}
