import type { User } from "@prisma/client";
import { compareSync, hashSync } from "bcrypt";
import { prisma } from "~/db.server";
import { addEventLog, EventType } from "./eventlog.server";

export type { User } from "@prisma/client";

export async function getUserById(userId: User["userId"]) {
  return prisma.user.findUnique({
    where: {
      userId,
    },
  });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export async function getDefaultUserByEmail(email: User["email"]) {
  return prisma.user.findFirst({
    where: {
      email,
      accountType: "EMAIL",
    },
  });
}

export async function getSocialUserByEmail(email: User["email"]) {
  return prisma.user.findFirst({
    where: {
      email,
      OR: [
        {
          accountType: "GOOGLE",
        },
        {
          accountType: "FACEBOOK",
        },
      ],
    },
  });
}

export async function getAllUsers() {
  return prisma.user.findMany({
    where: {
      NOT: {
        email: {
          endsWith: "@revue.co.uk", // exclude test accounts from README
        },
      },
    },
    select: {
      userId: true,
      email: true,
      userType: true,
      accountType: true,
    },
  });
}

export async function createUser(
  email: User["email"],
  password: User["password"],
) {

  const LogDescription = "New user " + email + " signed up";

  await addEventLog({
    eventLog: {
        eventLogDate: new Date(),
        userId: -1,
      },
    logContent: {
      type: EventType.CreateUser,
      description: LogDescription,
    },
  });

  return prisma.user.create({
    data: {
      email,
      password: hashSync(password, 10),
    },
  });
}

export async function changeUserPassword(
  userId: User["userId"],
  newPassword: User["password"],
) {

  const user = await getUserById(userId) as User;
  const LogDescription = "User " + user?.email + " ("+ user?.userType.toLowerCase() +") changed their password";

  await addEventLog({
    eventLog: {
        eventLogDate: new Date(),
        userId: userId,
      },
    logContent: {
      type: EventType.UpdateUser,
      description: LogDescription,
    },
  });

  return prisma.user.update({
    where: {
      userId,
    },
    data: {
      password: hashSync(newPassword, 10),
    },
  });
}

export async function changeEmail(
  userId: User["userId"],
  newEmail: User["email"],
) {

  const user = await getUserById(userId) as User;
  const LogDescription = "User " + user?.email + " ("+ user?.userType.toLowerCase() +") changed their email to " + newEmail;

  await addEventLog({
    eventLog: {
        eventLogDate: new Date(),
        userId: userId,
      },
    logContent: {
      type: EventType.UpdateUser,
      description: LogDescription,
    },
  });

  return prisma.user.update({
    where: {
      userId,
    },
    data: {
      email: newEmail,
    },
  });
}

export async function createSocialMediaUser(
  email: User["email"],
  provider: "GOOGLE" | "FACEBOOK",
) {

  const LogDescription = "New user " + email + " created with " + provider;

  await addEventLog({
    eventLog: {
        eventLogDate: new Date(),
        userId: -1,
      },
    logContent: {
      type: EventType.CreateUser,
      description: LogDescription,
    },
  });

  return prisma.user.create({
    data: {
      email,
      accountType: provider,
      password: "",
    },
  });
}

export async function deleteUserById(userId: User["userId"], adminId: number) {
  
  const admin = await getUserById(adminId) as User;
  const deletedUser = await getUserById(userId) as User;
  const LogDescription = admin?.email.toString() + "(" + admin?.userType.toLowerCase() + ") deleted "
    + "user " + deletedUser?.email + " (" + deletedUser?.userType.toLowerCase() + ")";

  await addEventLog({
    eventLog: {
        eventLogDate: new Date(),
        userId: adminId,
      },
    logContent: {
      type: EventType.DeleteUser,
      description: LogDescription,
    },
  });
  
  return prisma.user.delete({
    where: {
      userId: userId,
    },
  });
}

export async function login(email: User["email"], password: User["password"]) {
  const existingUser = await getDefaultUserByEmail(email);

  if (!existingUser || !compareSync(password, existingUser.password)) {
    return;
  }

  return {
    userId: existingUser.userId,
    email: existingUser.email,
    userType: existingUser.userType,
  };
}
