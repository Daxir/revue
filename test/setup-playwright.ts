import { seedProducts, seedReviews, seedUsers } from "./seed";

export default async function setup() {
  await seedUsers();
  await seedProducts();
  await seedReviews();
}
