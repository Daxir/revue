import { Badge, Card, Group, Image, Text } from "@mantine/core";
import type { Product } from "@prisma/client";
import { Link } from "@remix-run/react";
import { CircleFlag } from "react-circle-flags";
import type { ProductContent } from "~/models/product.server";
import { productCategoryReadable } from "~/utils";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const parsedContent = product.content as ProductContent;
  return (
    <Link
      style={{ textDecoration: "none" }}
      to={`/products/${product.productId}`}
      data-testid={`product-${product.productId}`}
    >
      <Card shadow="md" p="lg" radius="lg" withBorder>
        <Card.Section>
          <Image
            src={parsedContent.media}
            height={200}
            alt="Product image"
            fit="contain"
            withPlaceholder
          />
        </Card.Section>

        <Group position="apart" mt="md" mb="xs">
          <Text weight={500}>{product.name}</Text>
          <Badge color="pink" variant="light">
            {productCategoryReadable(product.category)}
          </Badge>
        </Group>

        <Group mt="md" mb="xs">
          {parsedContent.countries.map((country) => (
            <CircleFlag
              countryCode={country.toLowerCase()}
              key={country}
              width="30"
              height="30"
            />
          ))}
        </Group>
      </Card>
    </Link>
  );
}
