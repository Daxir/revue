import type { Prisma, Product, ProductCategory, User } from "@prisma/client";
import { ProductStatus } from "@prisma/client";
import { prisma, supabase } from "~/db.server";
import { getParsedProductContent } from "~/utils";
import { EventType, addEventLog } from "./eventlog.server";
import { getUserById } from "./user.server";

export type Country = "PL" | "UK" | "DE";

export interface ProductContent extends Prisma.JsonObject {
  manufacturer: string;
  media: string;
  description: string;
  countries: Country[];
  linked_products: number[];
  features_list: string[];
}

export interface ProductWithContent extends Product {
  content: ProductContent;
}

export interface StrippedProduct {
  productId: number;
  name: string;
  category: ProductCategory;
  countries: Country[];
  linkedProducts: number[];
  status: ProductStatus;
  manufacturer: string;
}

export function getProductById(productId: Product["productId"]) {
  return prisma.product.findUnique({
    where: {
      productId,
    },
  });
}

export function getProductsPage(
  search: string,
  page: number,
  limit: number,
  productCategories: ProductCategory[],
  region: string,
  status: ProductStatus | "all",
) {
  const statusQuery: ProductStatus[] =
    status === "all" ? Object.values(ProductStatus) : [status];

  const countriesQuery =
    region === "all" ? ["PL", "DE", "UK"] : [region.toUpperCase()];

  return prisma.product.findMany({
    where: {
      category: {
        in: productCategories,
      },
      status: {
        in: statusQuery,
      },
      AND: [
        {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              content: {
                path: ["manufacturer"],
                string_contains: search,
              },
            },
          ],
        },
        {
          OR: countriesQuery.map((country) => ({
            content: {
              path: ["countries"],
              array_contains: country,
            },
          })),
        },
      ],
    },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      productId: true,
      name: true,
      category: true,
      status: true,
      content: true,
    },
  });
}

export function getAllProducts() {
  return prisma.product.findMany();
}

export function getProductsCount(
  search: string,
  productCategories: ProductCategory[],
  region: string,
  status: ProductStatus | "all",
) {
  const countriesQuery =
    region === "all" ? ["PL", "DE", "UK"] : [region.toUpperCase()];

  const statusQuery: ProductStatus[] =
    status === "all" ? Object.values(ProductStatus) : [status];

  return prisma.product.count({
    where: {
      category: {
        in: productCategories,
      },
      status: {
        in: statusQuery,
      },
      AND: [
        {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              content: {
                path: ["manufacturer"],
                string_contains: search,
              },
            },
          ],
        },
        {
          OR: countriesQuery.map((country) => ({
            content: {
              path: ["countries"],
              array_contains: country,
            },
          })),
        },
      ],
    },
  });
}

export function checkProductsExistence(
  products: { name: string; countries: string[] }[],
) {
  return prisma.product.findMany({
    where: {
      OR: products.map((product) => ({
        name: product.name,
        content: {
          path: ["countries"],
          array_contains: product.countries,
        },
      })),
    },
  });
}

export async function uploadProductPicture(image: File) {
  if (process.env.NODE_ENV === "test") {
    return "https://picsum.photos/600/400";
  }

  const fileExtension = image.name.split(".").pop() || "jpg";

  const fileName = `${Math.random()}.${fileExtension}`;

  const { data, error: uploadError } = await supabase.storage
    .from("product-pictures")
    .upload(fileName, image, {
      contentType: image.type,
    });

  if (uploadError) {
    throw uploadError;
  }

  return supabase.storage.from("product-pictures").getPublicUrl(data.path).data
    .publicUrl;
}

export async function addProduct(
  {
    product,
    productContent,
  }: {
    product: Omit<Product, "productId" | "content">;
    productContent: Omit<ProductContent, "linked_products">;
  },
  userIdNumber: number,
) {
  const user = (await getUserById(userIdNumber)) as User;
  let logDescription = user?.email + "(" + user?.userType.toLowerCase() + ")";
  logDescription += " created new product " + product.name;
  await addEventLog({
    eventLog: {
      eventLogDate: new Date(),
      userId: userIdNumber,
    },
    logContent: {
      type: EventType.CreateProduct,
      description: logDescription,
    },
  });

  const { featuresList, ...clonedProductContent } = productContent;

  return prisma.product.create({
    data: {
      ...product,
      content: {
        ...clonedProductContent,
        features_list: featuresList,
        linked_products: [],
      },
    },
  });
}

function printNames(
  products: { ids: number[]; names: string[] },
  newIds: number[],
) {
  let comment = "";
  for (const newId of newIds) {
    comment +=
      products.names[products.ids.indexOf(newId)] +
      "(" +
      newId.toString() +
      "), ";
  }
  return comment;
}

export async function updateLinkedProducts(
  userIdNumber: number,
  products: { ids: number[]; names: string[] },
  ulink = false,
) {
  const user = (await getUserById(userIdNumber)) as User;
  for (const element of products.ids) {
    const id = element;
    const product = await getProductById(id);
    if (product !== null) {
      let logDescription =
        user?.email.toString() + "(" + user?.userType.toLowerCase() + ")";

      const productWithContent = getParsedProductContent(product);
      let linkedIdsProds = productWithContent.content.linked_products;
      const newIds = products.ids.filter((item) => item !== id);

      if (ulink) {
        for (const ulinkId of newIds) {
          linkedIdsProds = linkedIdsProds.filter((item) => item !== ulinkId);
        }
        logDescription += " unlinked from ";
      } else {
        for (const id of newIds) {
          if (!linkedIdsProds.includes(id)) {
            linkedIdsProds.push(id);
          }
        }
        logDescription += " linked to ";
      }

      logDescription +=
        "product " +
        product.name +
        "(" +
        id.toString() +
        ") products: " +
        printNames(products, newIds);

      await addEventLog({
        eventLog: {
          eventLogDate: new Date(),
          userId: userIdNumber,
        },
        logContent: {
          type: EventType.UpdateProduct,
          description: logDescription,
        },
      });

      await prisma.product.update({
        where: {
          productId: id,
        },
        data: {
          content: {
            ...productWithContent.content,
            linked_products: linkedIdsProds,
          },
        },
      });
    }
  }
}

export async function changeStatusOfProduct(
  productId: Product["productId"],
  status: ProductStatus,
  content?: {
    name: string;
    category: ProductCategory;
    content: ProductContent;
  },
) {
  return prisma.product.update({
    where: {
      productId,
    },
    data: {
      status: status,
      ...content,
    },
  });
}
