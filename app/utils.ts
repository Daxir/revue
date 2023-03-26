import { upperFirst } from "@mantine/hooks";
import type { Product, ProductCategory, Review } from "@prisma/client";
import type { ProductContent } from "./models/product.server";
import type { ReviewContent } from "./models/review.server";

const DEFAULT_REDIRECT = "/";

export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT,
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

export function productCategoryReadable(category: ProductCategory) {
  return upperFirst(category.replace("_", " ").toLowerCase());
}

export function getParsedProductContent(product: Product) {
  return {
    ...product,
    content: product.content as ProductContent,
  };
}

export function getReviewParsedContent(review: Review) {
  return { ...review, content: review.content as ReviewContent };
}

export enum Country {
  UK = "UK",
  DE = "DE",
  PL = "PL",
}

export enum ReviewCategory {
  POSITIVE = "positive",
  NEGATIVE = "negative",
  NEUTRAL = "neutral",
}

export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
