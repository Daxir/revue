import { Card, Group, Skeleton } from "@mantine/core";

export default function SkeletonProductCard() {
  return (
    <Card shadow="md" p="lg" radius="lg" withBorder>
      <Card.Section>
        <Skeleton height={200} />
      </Card.Section>

      <Group position="apart" mt="md" mb="xs">
        <Skeleton width="50%" height={20} />
        <Skeleton width="20%" height={20} color="red" />
      </Group>

      <Group mt="md" mb="xs">
        <Skeleton height={30} width={30} circle />
        <Skeleton height={30} width={30} circle />
      </Group>
    </Card>
  );
}
