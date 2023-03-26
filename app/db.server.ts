import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import invariant from "tiny-invariant";

let prisma: PrismaClient;

declare global {
  var __db__: PrismaClient;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
// in production we'll have a single connection to the DB.

invariant(process.env.SUPABASE_URL, "SUPABASE_URL must be set");
invariant(process.env.SUPABASE_ANON_KEY, "SUPABASE_ANON_KEY must be set");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
  prisma.$connect();
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient();
    global.__db__.$connect();
  }
  prisma = global.__db__;
}

export { prisma, supabase };
