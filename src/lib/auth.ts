import { cache } from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "demo@cvmatch.local";
const DEMO_USER_NAME = "Demo User";

const SELECT = { id: true, email: true, name: true } satisfies Prisma.UserSelect;

/**
 * No-login mode: every request resolves to the same shared demo user,
 * auto-created on first access. Keeps the multi-tenant schema and every
 * existing `session.user.id`-scoped query working unchanged — swap this
 * back for a real auth check if per-user accounts come back later.
 *
 * Wrapped in React's cache() so a page + its layout calling auth() in the
 * same request share one upsert instead of hitting the DB twice.
 */
export const auth = cache(async () => {
  try {
    const user = await prisma.user.upsert({
      where: { email: DEMO_USER_EMAIL },
      update: {},
      create: { email: DEMO_USER_EMAIL, name: DEMO_USER_NAME, passwordHash: "" },
      select: SELECT,
    });
    return { user };
  } catch (error) {
    // Concurrent cold starts (e.g. parallel build workers, or simultaneous
    // first requests) can race to create the same row. If another one won
    // the race, just read what it created instead of failing.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const user = await prisma.user.findUniqueOrThrow({
        where: { email: DEMO_USER_EMAIL },
        select: SELECT,
      });
      return { user };
    }
    throw error;
  }
});
