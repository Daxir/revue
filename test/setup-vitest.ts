import * as dotenv from "dotenv";
import { exec } from "node:child_process";

export default async function setup() {
  console.log("Setup test environment");

  dotenv.config({ path: ".env" });
  dotenv.config({ path: ".env.test" });
  // Import dynamically to make sure the environment variables are set
  const { seedProducts, seedReviews, seedUsers } = await import("./seed");
  
  await seedProducts();
  await seedUsers();
  await seedReviews();

  return () => {
    console.log("After test teardown");
    exec("npm run docker:down");
  };
}
