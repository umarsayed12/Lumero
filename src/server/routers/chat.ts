import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { prisma } from "@/lib/db";

export const chatRouter = router({
  sendMessage: publicProcedure
    .input(
      z.object({
        sessionId: z.string().cuid(),
        message: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      await prisma.message.create({
        data: {
          sessionId: input.sessionId,
          content: input.message,
          role: "user",
        },
      });

      const aiResponse = "This is a dummy response from the AI.";

      await prisma.message.create({
        data: {
          sessionId: input.sessionId,
          content: aiResponse,
          role: "ai",
        },
      });

      return { success: true, aiMessage: aiResponse };
    }),
});
