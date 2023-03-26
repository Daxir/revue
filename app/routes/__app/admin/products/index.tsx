import {
  Button,
  Center,
  Checkbox,
  Group,
  ScrollArea,
  Table,
} from "@mantine/core";
import type { ActionArgs } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { IconLink, IconSquarePlus, IconUnlink } from "@tabler/icons";
import { useState } from "react";
import { authenticator } from "~/auth.server";
import { EmptyState } from "~/components/EmptyState";
import type { Country, StrippedProduct } from "~/models/product.server";
import { getAllProducts, updateLinkedProducts } from "~/models/product.server";
import { getParsedProductContent } from "~/utils";

export async function loader(): Promise<StrippedProduct[]> {
  const products = await getAllProducts();
  const parsedProducts = products.map((product) => {
    return getParsedProductContent(product);
  });

  return parsedProducts.map((parsedProduct) => {
    return {
      productId: parsedProduct.productId,
      name: parsedProduct.name,
      category: parsedProduct.category,
      countries: parsedProduct.content.countries,
      linkedProducts: parsedProduct.content.linked_products,
      status: parsedProduct.status,
      manufacturer: parsedProduct.content.manufacturer,
    } as StrippedProduct;
  });
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const { intent, ...rest } = Object.fromEntries(formData);
  const checkedIds = String(rest.ids).split(",").map(Number);
  const checkedNames = String(rest.names).split(",");

  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const checkedProducts = {
    ids: checkedIds,
    names: checkedNames,
  };

  await updateLinkedProducts(
    user?.userId as number,
    checkedProducts,
    intent === "ulink",
  );
  return null;
}

export function countriesAreNotDuplicated(
  checkedCountries: Country[],
  countriesToBeChecked: Country[],
) {
  return !countriesToBeChecked.some((countryToBeChecked) => checkedCountries.includes(countryToBeChecked),
  );
}

export function filterLinkableProducts(
  products: StrippedProduct[],
  checkedProductsIds: number[],
) {
  if (checkedProductsIds.length === 0) {
    return products;
  }
  const checkedProducts = products.filter((product) => {
    return checkedProductsIds.includes(product.productId);
  });

  const checkedCategories = new Set(
    new Set(
      checkedProducts.map((product) => {
        return product.category;
      }),
    ),
  );
  const checkedManufactures = new Set(
    new Set(
      checkedProducts.map((product) => {
        return product.manufacturer;
      }),
    ),
  );
  const checkedCountries = [
    ...new Set(
      checkedProducts.flatMap((product) => {
        return product.countries;
      }),
    ),
  ];

  const checkedProductNames = new Set(
    new Set(
      checkedProducts.map((product) => {
        return product.name;
      }),
    ),
  );
  return products.filter((product) => {
    return (
      checkedCategories.has(product.category) ||
      checkedManufactures.has(product.manufacturer) ||
      (checkedProductNames.has(product.name) &&
        countriesAreNotDuplicated(checkedCountries, product.countries))
    );
  });
}

const openInNewTab = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

export default function AdminProductsPage() {
  const products = useLoaderData<typeof loader>();

  products.sort((product1, product2) => {
    const name1 = product1.name.toLowerCase();
    const name2 = product2.name.toLowerCase();

    return name1 < name2 ? -1 : 1;
  });

  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  const [checkedNames, setCheckedNames] = useState<string[]>([]);
  const [highlitedIds, setHighlitedIds] = useState<number[]>([]);

  const [linkableProducts, setLinkableProducts] =
    useState<StrippedProduct[]>(products);

  return (
    <Group position="center" align="baseline">
      <ScrollArea>
        <Center>
          <Table
            horizontalSpacing="md"
            verticalSpacing="xs"
            sx={{ tableLayout: "auto", minWidth: 700, maxWidth: 1000 }}
          >
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Countries</th>
                <th>Status</th>
                <th>Manufacturer</th>
                <th>Select</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map(
                  ({
                    productId,
                    name,
                    category,
                    countries,
                    linkedProducts,
                    status,
                    manufacturer,
                  }) => (
                    <tr
                      style={{
                        backgroundColor: highlitedIds.includes(productId)
                          ? "teal"
                          : "transparent",
                      }}
                      key={productId}
                      data-testid={`product-${productId}`}
                    >
                      <td
                        onMouseEnter={() => {
                          setHighlitedIds([...linkedProducts, productId]);
                        }}
                        onMouseLeave={() => {
                          setHighlitedIds([]);
                        }}
                        onClick={() => {
                          openInNewTab("../products/" + productId.toString());
                        }}
                      >
                        {name}
                      </td>
                      <td>{category}</td>
                      <td>{countries?.join(", ")}</td>
                      <td>{status}</td>
                      <td>{manufacturer}</td>
                      <td>
                        {checkedIds.includes(productId) ||
                        linkableProducts.some(
                          (linkableProduct) => linkableProduct.productId === productId,
                        ) ? (
                          <Checkbox
                            key={productId}
                            data-testid={`checkbox-${productId}`}
                            onChange={(event) => {
                              if (event.currentTarget.checked) {
                                setCheckedIds([...checkedIds, productId]);
                                setCheckedNames([...checkedNames, name]);
                                setLinkableProducts(
                                  filterLinkableProducts(products, [
                                    ...checkedIds,
                                    productId,
                                  ]),
                                );
                              } else {
                                setCheckedIds(
                                  checkedIds.filter(
                                    (item) => item !== productId,
                                  ),
                                );
                                setCheckedNames(
                                  checkedNames.filter((item) => item !== name),
                                );
                                setLinkableProducts(
                                  filterLinkableProducts(
                                    products,
                                    checkedIds.filter(
                                      (item) => item !== productId,
                                    ),
                                  ),
                                );
                              }
                            }}
                          />
                        ) : undefined}
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td>
                    <EmptyState
                      title="No products found..."
                      description="You can create a new product by clicking the button below."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Center>
      </ScrollArea>
      {/* For revision */}
      <Center
        sx={() => ({
          "@media (min-width: 1020px)": {
            flexDirection: "column",
          },
        })}
      >
        <Button
          variant="filled"
          color="primary"
          m={20}
          leftIcon={<IconSquarePlus />}
          component={Link}
          to="/admin/products/new"
        >
          Add product
        </Button>
        <Form
          method="post"
          style={{
            display: "inline-flex",
            flexDirection: "column",
          }}
        >
          <input
            type="text"
            name="ids"
            hidden
            readOnly
            value={checkedIds.toString()}
          />
          <input
            type="text"
            name="names"
            hidden
            readOnly
            value={checkedNames.toString()}
          />
          <Button
            name="intent"
            value="link"
            type="submit"
            data-testid={`link`}
            disabled={checkedIds.length < 2}
            variant="filled"
            color="primary"
            m={20}
            leftIcon={<IconLink />}
          >
            Link products
          </Button>

          <Button
            name="intent"
            value="ulink"
            type="submit"
            disabled={checkedIds.length < 2}
            variant="filled"
            color="primary"
            m={20}
            leftIcon={<IconUnlink />}
          >
            Unlink products
          </Button>
        </Form>
      </Center>
    </Group>
  );
}
