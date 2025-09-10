import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { prisma } from "@/lib/db";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Lumero AI",
  },
});
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

      const chatHistory = await prisma.message.findMany({
        where: { sessionId: input.sessionId },
        orderBy: { createdAt: "asc" },
      });

      const historyMessage: OpenAI.Chat.ChatCompletionMessageParam[] =
        chatHistory.map((msg) => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        }));

      try {
        const chatCompletion = await openai.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "You are an expert career counselor. Provide helpful, concise, and encouraging advice. Your name is LumeroAI.",
            },
            ...historyMessage,
          ],
          model: "mistralai/mistral-7b-instruct:free",
          max_completion_tokens: 1024,
        });

        const aiResponse =
          chatCompletion.choices[0].message?.content ||
          "Sorry, I couldn't think of a response.";

        await prisma.message.create({
          data: {
            sessionId: input.sessionId,
            content: aiResponse,
            role: "ai",
          },
        });

        return { success: true, aiMessage: aiResponse };
      } catch (error) {
        console.error("Error calling OpenRouter API:", error);
        throw new Error(
          "Failed to get a response from the AI. Please check the server logs."
        );
      }
    }),

  getMessages: publicProcedure
    .input(z.object({ sessionId: z.string().cuid() }))
    .query(async ({ input }) => {
      const messages = await prisma.message.findMany({
        where: {
          sessionId: input.sessionId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
      return messages;
    }),
});
