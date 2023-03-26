import { prisma } from "~/db.server";

export default async function teardown() {
  await prisma.$disconnect();
}
