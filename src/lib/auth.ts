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
 * Deliberately NOT wrapped in React's cache(): this is called from both
 * Server Components (pages/layouts) and Route Handlers (API routes), and
 * cache() only dedupes within a React render tree — Route Handlers aren't
 * part of one. Mixing the two caused production-only failures that didn't
 * reproduce in `next dev`. The upsert below is cheap and idempotent, so
 * calling it twice per request (e.g. once in a layout, once in its page)
 * is not worth the risk.
 */
export async function auth() {
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
    console.error("auth() failed to resolve the demo user", error);
    throw error;
  }
}
