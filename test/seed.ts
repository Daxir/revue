import { hashSync } from "bcrypt";
import { prisma } from "~/db.server";

export async function seedProducts() {
  await prisma.product.upsert({
    where: { productId: 1 },
    update: {},
    create: {
      name: "Product 1",
      category: "DETERGENT",
      status: "ACCEPTED",
      content: {
        media: "https://cdn2.thecatapi.com/images/MTUwNjY0Mg.gif",
        countries: ["PL", "DE"],
        description: "Lorem ipsum",
        manufacturer: "Lorem",
        features_list: ["Lorem", "Ipsum"],
        linked_products: [],
      },
    },
  });
  await prisma.product.upsert({
    where: { productId: 2 },
    update: {},
    create: {
      name: "Product 2",
      category: "DISHWASHER_CUBE",
      status: "ACCEPTED",
      content: {
        media: "https://cdn2.thecatapi.com/images/cl5.jpg",
        countries: ["UK"],
        description: "Lorem ipsum",
        manufacturer: "Lorem",
        features_list: ["Lorem", "Ipsum"],
        linked_products: [],
      },
    },
  });
  await prisma.product.upsert({
    where: { productId: 3 },
    update: {},
    create: {
      name: "Product 3",
      category: "THERMAL_MUG",
      status: "ACCEPTED",
      content: {
        media: "https://cdn2.thecatapi.com/images/22r.png",
        countries: ["PL", "DE", "UK"],
        description: "Lorem ipsum",
        manufacturer: "Lorem",
        features_list: ["Lorem", "Ipsum"],
        linked_products: [],
      },
    },
  });
  await prisma.product.upsert({
    where: { productId: 4 },
    update: {},
    create: {
      name: "Proszek pierdzioszek",
      category: "DETERGENT",
      status: "ACCEPTED",
      content: {
        media: "https://cdn2.thecatapi.com/images/22r.png",
        countries: ["PL"],
        description: "Lorem ipsum",
        manufacturer: "Lorem",
        features_list: ["Lorem", "Ipsum"],
        linked_products: [],
      },
    },
  });
  await prisma.product.upsert({
    where: { productId: 5 },
    update: {},
    create: {
      name: "Proszek pierdzioszek",
      category: "DETERGENT",
      status: "ACCEPTED",
      content: {
        media: "https://cdn2.thecatapi.com/images/22r.png",
        countries: ["DE"],
        description: "Lorem ipsum",
        manufacturer: "Lorem",
        features_list: ["Lorem", "Ipsum"],
        linked_products: [],
      },
    },
  });
  await prisma.product.upsert({
    where: { productId: 6 },
    update: {},
    create: {
      name: "Proszek pierdzioszek",
      category: "THERMAL_MUG",
      status: "ACCEPTED",
      content: {
        media: "https://cdn2.thecatapi.com/images/22r.png",
        countries: ["PL"],
        description: "Lorem ipsum",
        manufacturer: "Merol",
        features_list: ["Lorem", "Ipsum"],
        linked_products: [],
      },
    },
  });
  await prisma.product.upsert({
    where: { productId: 7 },
    update: {},
    create: {
      name: "Proszek pierdzioszek",
      category: "THERMAL_MUG",
      status: "ACCEPTED",
      content: {
        media: "https://cdn2.thecatapi.com/images/22r.png",
        countries: ["PL"],
        description: "Lorem ipsum",
        manufacturer: "Merol",
        features_list: ["Lorem", "Ipsum"],
        linked_products: [],
      },
    },
  });
  await prisma.product.upsert({
    where: { productId: 8 },
    update: {},
    create: {
      name: "Proszek pierdzioszek",
      category: "DETERGENT",
      status: "ACCEPTED",
      content: {
        media: "https://cdn2.thecatapi.com/images/22r.png",
        countries: ["PL"],
        description: "Lorem ipsum",
        manufacturer: "Merol",
        features_list: ["Lorem", "Ipsum"],
        linked_products: [],
      },
    },
  });
  await prisma.product.upsert({
    where: { productId: 9 },
    update: {},
    create: {
      name: "Proszek pierdzioszek",
      category: "DETERGENT",
      status: "ACCEPTED",
      content: {
        media: "https://cdn2.thecatapi.com/images/22r.png",
        countries: ["PL"],
        description: "Lorem ipsum",
        manufacturer: "Lorem",
        features_list: ["Lorem", "Ipsum"],
        linked_products: [],
      },
    },
  });
  await prisma.product.upsert({
    where: { productId: 10 },
    update: {},
    create: {
      name: "Proszek pierdzioszek",
      category: "DETERGENT",
      status: "ACCEPTED",
      content: {
        media: "https://cdn2.thecatapi.com/images/22r.png",
        countries: ["PL"],
        description: "Lorem ipsum",
        manufacturer: "Merol",
        features_list: ["Lorem", "Ipsum"],
        linked_products: [],
      },
    },
  });
  await prisma.product.upsert({
    where: { productId: 11 },
    update: {},
    create: {
      name: "Product 11",
      category: "DISHWASHER_CUBE",
      status: "ACCEPTED",
      content: {
        media: "https://cdn2.thecatapi.com/images/MTUwNjY0Mg.gif",
        countries: ["PL", "DE"],
        description: "Lorem ipsum",
        manufacturer: "Lorem",
        features_list: ["Lorem", "Ipsum"],
        linked_products: [12],
      },
    },
  });
  await prisma.product.upsert({
    where: { productId: 12 },
    update: {},
    create: {
      name: "Product 12",
      category: "THERMAL_MUG",
      status: "ACCEPTED",
      content: {
        media: "https://cdn2.thecatapi.com/images/MTUwNjY0Mg.gif",
        countries: ["DE"],
        description: "Lorem ipsum",
        manufacturer: "Lorem",
        features_list: ["Lorem", "Ipsum"],
        linked_products: [11],
      },
    },
  });
  await prisma.product.upsert({
    where: { productId: 13 },
    update: {},
    create: {
      name: "Product 13",
      category: "DETERGENT",
      status: "NEW",
      content: {
        media: "https://cdn2.thecatapi.com/images/22r.png",
        countries: ["PL"],
        description: "Lorem ipsum",
        manufacturer: "Lorem",
        features_list: ["Lorem", "Ipsum"],
        linked_products: [],
      },
    },
  });
  await prisma.product.upsert({
    where: { productId: 14 },
    update: {},
    create: {
      name: "Product 14",
      category: "DETERGENT",
      status: "NEW",
      content: {
        media: "https://cdn2.thecatapi.com/images/22r.png",
        countries: ["PL"],
        description: "Lorem ipsum",
        manufacturer: "Lorem",
        features_list: ["Lorem", "Ipsum"],
        linked_products: [],
      },
    },
  });
  return;
}

export async function seedUsers() {
  await prisma.user.upsert({
    where: { userId: 1 },
    update: {},
    create: {
      email: "admin@foo.bar",
      password: hashSync("password", 10),
      accountType: "EMAIL",
      userType: "ADMIN",
    },
  });
  await prisma.user.upsert({
    where: { userId: 2 },
    update: {},
    create: {
      email: "moderator@foo.bar",
      password: hashSync("password", 10),
      accountType: "EMAIL",
      userType: "MODERATOR",
    },
  });
  await prisma.user.upsert({
    where: { userId: 3 },
    update: {},
    create: {
      email: "user@foo.bar",
      password: hashSync("password", 10),
      accountType: "EMAIL",
      userType: "USER",
    },
  });
  await prisma.user.upsert({
    where: { userId: 4 },
    update: {},
    create: {
      email: "user2@foo.bar",
      password: hashSync("password", 10),
      accountType: "EMAIL",
      userType: "USER",
    },
  });
  await prisma.user.upsert({
    where: { userId: 5 },
    update: {},
    create: {
      email: "deletable@foo.bar",
      password: hashSync("password", 10),
      accountType: "EMAIL",
      userType: "USER",
    },
  });
}

export async function seedReviews() {
  await prisma.review.upsert({
    where: { reviewId: 1 },
    update: {},
    create: {
      productId: 1,
      userId: 1,
      status: "ACCEPTED",
      content: {
        grade: 5,
        source: "opinioncollector",
        language: "PL",
        verified: true,
        category: "positive",
        advantages: "Advantages content",
        description: "Description",
        disadvantages: "Disadvantages content",
        double_quality: true,
        feature_grades: [4, 6],
      },
    },
  });
  await prisma.review.upsert({
    where: { reviewId: 2 },
    update: {},
    create: {
      productId: 1,
      userId: 2,
      status: "ACCEPTED",
      content: {
        grade: 2,
        source: "opinioncollector",
        language: "DE",
        verified: true,
        category: "negative",
        advantages: "Lorem",
        description: "",
        disadvantages: "Ipsum",
        double_quality: false,
        feature_grades: [2, 3],
      },
    },
  });
  await prisma.review.upsert({
    where: { reviewId: 3 },
    update: {},
    create: {
      productId: 2,
      userId: 1,
      content: {
        grade: 8,
        source: "opinioncollector",
        language: "UK",
        verified: true,
        category: "positive",
        advantages: "Lorem",
        description: "",
        disadvantages: "Ipsum",
        double_quality: false,
        feature_grades: [8, 8],
      },
    },
  });
  await prisma.review.upsert({
    where: { reviewId: 4 },
    update: {},
    create: {
      productId: 2,
      userId: 2,
      content: {
        grade: 5,
        source: "opinioncollector",
        language: "UK",
        verified: true,
        category: "positive",
        advantages: "Lorem",
        description: "",
        disadvantages: "Ipsum",
        double_quality: false,
        feature_grades: [4, 6],
      },
    },
  });
  await prisma.review.upsert({
    where: { reviewId: 5 },
    update: {},
    create: {
      productId: 1,
      userId: 1,
      content: {
        grade: 5,
        source: "opinioncollector",
        language: "PL",
        verified: true,
        category: "positive",
        advantages: "Lorem",
        description: "",
        disadvantages: "Ipsum",
        double_quality: true,
        feature_grades: [4, 6],
      },
    },
  });
  await prisma.review.upsert({
    where: { reviewId: 6 },
    update: {},
    create: {
      productId: 1,
      userId: 4,
      content: {
        grade: 5,
        source: "opinioncollector",
        language: "PL",
        verified: true,
        category: "positive",
        advantages: "Lorem",
        description: "",
        disadvantages: "Ipsum",
        double_quality: true,
        feature_grades: [4, 6],
      },
    },
  });
  await prisma.review.upsert({
    where: { reviewId: 7 },
    update: {},
    create: {
      productId: 1,
      userId: 3,
      status: "REJECTED",
      content: {
        grade: 2,
        source: "opinioncollector",
        language: "DE",
        verified: true,
        category: "negative",
        advantages: "Lorem",
        description: "",
        disadvantages: "Ipsum",
        double_quality: false,
        feature_grades: [2, 3],
      },
    },
  });
  await prisma.review.upsert({
    where: { reviewId: 8 },
    update: {},
    create: {
      productId: 1,
      userId: 3,
      status: "NEW",
      content: {
        grade: 4,
        source: "opinioncollector",
        language: "PL",
        verified: true,
        category: "positive",
        advantages: "Lorem",
        description: "",
        disadvantages: "Ipsum",
        double_quality: false,
        feature_grades: [4, 5],
      },
    },
  });
  await prisma.review.upsert({
    where: { reviewId: 9 },
    update: {},
    create: {
      productId: 2,
      userId: 3,
      status: "ACCEPTED",
      content: {
        grade: 6,
        source: "opinioncollector",
        language: "PL",
        verified: true,
        category: "positive",
        advantages: "Advantages content",
        description: "Description",
        disadvantages: "Disadvantages content",
        double_quality: true,
        feature_grades: [5, 6],
      },
    },
  });
  return;
}
