import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@/auth";

export const createTRPCContext = async () => {
  const session = await auth();
  return {
    session,
  };
};
const t = initTRPC.context<typeof createTRPCContext>().create();

const isAuth = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuth);
export const router = t.router;
export const publicProcedure = t.procedure;
