import type { Prisma, Product, Review, User } from "@prisma/client";
import { ReviewStatus } from "@prisma/client";
import { prisma } from "~/db.server";
import type { AddReviewProps } from "~/routes/__app/admin/reviews";
import { EventType, addEventLog } from "./eventlog.server";
import type { Country } from "./product.server";
import { getProductById } from "./product.server";
import { getUserById } from "./user.server";

export type { Review } from "@prisma/client";

export enum ReviewCategory {
  POSITIVE = "positive",
  NEGATIVE = "negative",
  NEUTRAL = "neutral",
}

export interface ReviewContent extends Prisma.JsonObject {
  grade: number;
  source: "opinioncollector";
  helpful: number;
  category: ReviewCategory;
  language: Country;
  verified: boolean;
  description: string;
  advantages: string;
  disadvantages: string;
  double_quality: boolean;
  feature_grades: number[];
}

export interface ReviewWithUserData {
  review: Review;
  userData?: ReviewAdditionalInfo;
}

export interface ReviewAdditionalInfo {
  hasCurrentUserMarkedReviewAsHelpful?: boolean;
  hasCurrentUserMarkedReviewAsUnhelpful?: boolean;
  markedAsHelpfulCount: number;
  markedAsUnhelpfulCount: number;
}

export interface ReviewWithOptionalAdditionalInfo {
  review: Review | ReviewAdditionalInfo;
}

export async function getReviewById(reviewId: Review["reviewId"]) {
  return prisma.review.findUnique({
    where: {
      reviewId,
    },
  });
}

export async function getProductAcceptedReviews(
  productId: Product["productId"],
) {
  return prisma.review.findMany({
    where: {
      productId,
      status: ReviewStatus.ACCEPTED,
    },
  });
}

const determineReviewCategory = (grade: Prisma.JsonValue | undefined) => {
  if (!grade) return ReviewCategory.NEUTRAL;
  if (grade >= 7) return ReviewCategory.POSITIVE;
  if (grade <= 3) return ReviewCategory.NEGATIVE;
  return ReviewCategory.NEUTRAL;
};

export async function addReview({
  review,
  reviewContent,
}: {
  review: Omit<Review, "reviewId" | "content" | "status">;
  reviewContent: Omit<
    ReviewContent,
    "source" | "helpful" | "verified" | "category"
  >;
}) {
  const user = (await getUserById(review.userId)) as User;
  const product = (await getProductById(review.productId)) as Product;
  const LogDescription =
    "User " +
    user?.email +
    " (" +
    user?.userType.toLowerCase() +
    ") created new review " +
    (reviewContent.description?.toString() as string) +
    " of product " +
    product?.name +
    " (" +
    review.productId.toString() +
    ")";

  await addEventLog({
    eventLog: {
      eventLogDate: new Date(),
      userId: review.userId,
    },
    logContent: {
      type: EventType.CreateReview,
      description: LogDescription,
    },
  });

  const { language, featureGrades, doubleQuality, ...rest } = reviewContent;
  return prisma.review.create({
    data: {
      ...review,
      status: ReviewStatus.NEW,
      content: {
        ...rest,
        language: language === "ALL" ? ["PL", "DE", "UK"] : language,
        feature_grades: featureGrades,
        double_quality: doubleQuality,
        source: "opinioncollector",
        category: determineReviewCategory(reviewContent.grade),
        helpful: 0,
      },
    },
  });
}

export async function addReviewHelpful(
  reviewId: Review["reviewId"],
  userId: User["userId"],
) {
  const review = (await getReviewById(reviewId)) as Review;
  const user = (await getUserById(userId)) as User;
  const product = (await getProductById(review?.productId)) as Product;
  const content = review?.content as ReviewContent;
  const LogDescription =
    "User " +
    user?.email +
    " (" +
    user?.userType.toLowerCase() +
    ") finds the review " +
    content.description +
    " of product " +
    product?.name +
    " (" +
    review?.productId.toString() +
    ") helpful";

  await addEventLog({
    eventLog: {
      eventLogDate: new Date(),
      userId: userId,
    },
    logContent: {
      type: EventType.UpdateReview,
      description: LogDescription,
    },
  });

  return prisma.reviewHelpfulUser.create({
    data: {
      reviewId,
      userId,
    },
  });
}

export async function deleteReviewHelpful(
  reviewId: Review["reviewId"],
  userId: Review["userId"],
) {
  const review = (await getReviewById(reviewId)) as Review;
  const user = (await getUserById(userId)) as User;
  const product = (await getProductById(review?.productId)) as Product;
  const content = review?.content as ReviewContent;
  const LogDescription =
    "User " +
    user?.email +
    " (" +
    user?.userType.toLowerCase() +
    ") no longer finds the review " +
    content.description +
    " of product " +
    product?.name +
    " (" +
    review?.productId.toString() +
    ") helpful";

  await addEventLog({
    eventLog: {
      eventLogDate: new Date(),
      userId: userId,
    },
    logContent: {
      type: EventType.UpdateReview,
      description: LogDescription,
    },
  });

  return prisma.reviewHelpfulUser.deleteMany({
    where: {
      reviewId,
      userId,
    },
  });
}

export async function addReviewUnhelpful(
  reviewId: Review["reviewId"],
  userId: User["userId"],
) {
  const review = (await getReviewById(reviewId)) as Review;
  const user = (await getUserById(userId)) as User;
  const product = (await getProductById(review?.productId)) as Product;
  const content = review?.content as ReviewContent;
  const LogDescription =
    "User " +
    user?.email +
    " (" +
    user?.userType.toLowerCase() +
    ") finds the review " +
    content.description +
    " of product " +
    product?.name +
    " (" +
    review?.productId.toString() +
    ") unhelpful";

  await addEventLog({
    eventLog: {
      eventLogDate: new Date(),
      userId: userId,
    },
    logContent: {
      type: EventType.UpdateReview,
      description: LogDescription,
    },
  });

  return prisma.reviewUnhelpfulUser.create({
    data: {
      reviewId,
      userId,
    },
  });
}

export async function deleteReviewUnhelpful(
  reviewId: Review["reviewId"],
  userId: Review["userId"],
) {
  const review = (await getReviewById(reviewId)) as Review;
  const user = (await getUserById(userId)) as User;
  const product = (await getProductById(review?.productId)) as Product;
  const content = review?.content as ReviewContent;
  const LogDescription =
    "User " +
    user?.email +
    " (" +
    user?.userType.toLowerCase() +
    ") no longer finds the review " +
    content.description +
    " of product " +
    product?.name +
    " (" +
    review?.productId.toString() +
    ") unhelpful";

  await addEventLog({
    eventLog: {
      eventLogDate: new Date(),
      userId: userId,
    },
    logContent: {
      type: EventType.UpdateReview,
      description: LogDescription,
    },
  });

  return prisma.reviewUnhelpfulUser.deleteMany({
    where: {
      reviewId,
      userId,
    },
  });
}

export async function getHasUserMarkedReviewAsHelpful(
  reviewId: Review["reviewId"],
  userId?: Review["userId"],
) {
  if (!userId) return false;
  return prisma.reviewHelpfulUser
    .findFirst({ where: { reviewId, userId } })
    .then(Boolean);
}

export async function getHasUserMarkedReviewAsUnhelpful(
  reviewId: Review["reviewId"],
  userId?: Review["userId"],
) {
  if (!userId) return false;
  return prisma.reviewUnhelpfulUser
    .findFirst({ where: { reviewId, userId } })
    .then(Boolean);
}

export async function getCountOfHelpfulReviews(reviewId: Review["reviewId"]) {
  return prisma.reviewHelpfulUser.count({ where: { reviewId } });
}

export async function getCountOfUnhelpfulReviews(reviewId: Review["reviewId"]) {
  return prisma.reviewUnhelpfulUser.count({ where: { reviewId } });
}

export async function getNewReviewsWithFeatures() {
  return prisma.review.findMany({
    where: {
      status: ReviewStatus.NEW,
    },
    include: {
      product: {
        select: {
          content: true,
        },
      },
    },
  });
}

export async function addReviewFromCSV({
  review,
  reviewContent,
}: AddReviewProps) {
  return prisma.review.create({
    data: {
      ...review,
      content: {
        grade: reviewContent.grade,
        source: reviewContent.source,
        category: reviewContent.reviewCategory ?? reviewContent.category,
        language: reviewContent.reviewLanguage ?? reviewContent.language,
        verified: reviewContent.verified,
        description:
          reviewContent.reviewDescription ?? reviewContent.description,
        advantages: reviewContent.advantages,
        disadvantages: reviewContent.disadvantages,
        double_quality: reviewContent.doubleQuality,
        feature_grades: reviewContent.ratingsList,
      },
    },
  });
}

export async function acceptReviewById(
  reviewId: Review["reviewId"],
  moderatorId: number,
) {
  const review = (await getReviewById(reviewId)) as Review;
  const user = (await getUserById(moderatorId)) as User;
  const product = (await getProductById(review?.productId)) as Product;
  const content = review?.content as ReviewContent;
  const LogDescription =
    "User " +
    user?.email +
    " (" +
    user?.userType.toLowerCase() +
    ") accepted review " +
    content.description +
    " of product " +
    product?.name +
    " (" +
    review?.productId.toString() +
    ")";

  await addEventLog({
    eventLog: {
      eventLogDate: new Date(),
      userId: moderatorId,
    },
    logContent: {
      type: EventType.UpdateReview,
      description: LogDescription,
    },
  });

  return prisma.review.update({
    where: {
      reviewId,
    },
    data: {
      status: ReviewStatus.ACCEPTED,
    },
  });
}

export async function rejectReviewById(
  reviewId: Review["reviewId"],
  moderatorId: number,
) {
  const review = (await getReviewById(reviewId)) as Review;
  const user = (await getUserById(moderatorId)) as User;
  const product = (await getProductById(review?.productId)) as Product;
  const content = review?.content as ReviewContent;
  const LogDescription =
    "User " +
    user?.email +
    " (" +
    user?.userType.toLowerCase() +
    ") rejected review " +
    content.description +
    " of product " +
    product?.name +
    " (" +
    review?.productId.toString() +
    ")";

  await addEventLog({
    eventLog: {
      eventLogDate: new Date(),
      userId: moderatorId,
    },
    logContent: {
      type: EventType.UpdateReview,
      description: LogDescription,
    },
  });

  return prisma.review.update({
    where: {
      reviewId,
    },
    data: {
      status: ReviewStatus.REJECTED,
    },
  });
}

export async function changeReviewToNewById(reviewId: Review["reviewId"]) {
  return prisma.review.update({
    where: {
      reviewId,
    },
    data: {
      status: ReviewStatus.NEW,
    },
  });
}

export async function getReviewsByUserId(userId: User["userId"]) {
  return prisma.review.findMany({
    where: {
      userId,
    },
  });
}

export async function getUserReviewByProduct(
  productId: Product["productId"],
  userId: User["userId"],
) {
  return prisma.review.findMany({
    where: {
      productId,
      userId,
    },
  });
}
