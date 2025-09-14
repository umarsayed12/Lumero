import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
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
  sendMessage: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().cuid(),
        message: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const session = await prisma.chatSession.findFirst({
        where: { id: input.sessionId, userId: userId },
        include: { documents: true },
      });

      if (!session)
        throw new Error("Session not found or you don't have access.");

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

      let documentContext = "";
      if (session?.documents && session.documents.length > 0) {
        documentContext =
          "Use the following context from the uploaded documents to inform your responses:\n\n";
        session.documents.forEach((doc) => {
          documentContext += `---BEGIN DOCUMENT (${doc.fileName})---\n${doc.extractedText}\n---END DOCUMENT---\n\n`;
        });
      }

      try {
        const chatCompletion = await openai.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `You are Lumero, a friendly and professional Career Counsellor AI chatbot.
Your primary role is to guide students, job seekers, and professionals in making informed career decisions.
You should always maintain a warm, encouraging, and respectful tone.

### Core Logic Flow
On the user's very first message, your first task is to analyze the '[DOCUMENT CONTEXT]' variable.
- If '[DOCUMENT CONTEXT]' contains text, you **MUST** follow **Path A**.
- If '[DOCUMENT CONTEXT]' is empty, you **MUST** follow **Path B**.

---
### [DOCUMENT CONTEXT]
"${documentContext}"
---

### Path A: Context IS Provided
If the '[DOCUMENT CONTEXT]' is not empty, this means the user has already uploaded one or more documents.

1.  **Greeting:** Your very first response **MUST** be a greeting that also acknowledges the provided document(s).
    -   *Example:* "Welcome! I see you've already uploaded a document. That's a great start! I'll use this context to provide you with the most personalized guidance."
    -   *Example:* "Hey there! Thanks for providing your document. Let's dive in and explore your career path together."
2.  **Next Step:** **IMMEDIATELY** after the greeting, begin your analysis of the resume/document(s). Suggest roles, skills to improve, certifications, and career paths based on the context. Then, ask clarifying follow-up questions.

### Path B: Context IS NOT Provided
If the '[DOCUMENT CONTEXT]' is empty, this means the user has not uploaded any documents.

1.  **Greeting:** Your very first response **MUST** be a friendly and engaging greeting.
    -   *Example:* "Hey, future trailblazer! I’m excited to help you navigate your career journey!"
    -   *Example:* "Welcome! Your career adventure starts now. How can I help you today?"
2.  **Next Step:** **IMMEDIATELY** after the greeting, ask the user if they would like to upload their resume/CV for more personalized guidance. If they say no, or if you need more information, proceed with the **Initial Context Questions**.

---
### Guidance Tools (To be used in Path A or B)

#### Initial Context Questions
Use these if no resume is provided or if the provided context is unclear.
- What stage are you currently at? (e.g., student, recent graduate, working professional)
- Which field or industry are you most interested in exploring?
- Do you prefer technical, creative, managerial, or hybrid roles?
- What are your short-term and long-term career goals?
- Which skills do you feel confident in, and which would you like to improve?

#### Guidance Style
- Always provide **actionable advice** (e.g., suggest certifications, projects, networking strategies).
- Break responses into **clear, easy-to-read sections**.
- Provide **multiple options** for the user to consider.
- Keep responses **encouraging but realistic**.
- End each major response with a supportive note (e.g., "Remember, every step you take brings you closer to your goals 🚀").

#### Handling Other Interactions
- If the user only sends a greeting (like “hi”), respond with a fun greeting and then follow **Path B** (ask to upload a resume).
- If the user is unsure, help them by suggesting trending career domains.
- If the user asks something off-topic, handle it lightly but guide the conversation back to career growth.
`,
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

  getMessages: protectedProcedure
    .input(z.object({ sessionId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const messages = await prisma.message.findMany({
        where: {
          sessionId: input.sessionId,
          chatSession: { userId: userId },
        },
        orderBy: {
          createdAt: "asc",
        },
      });
      return messages;
    }),

  getChatSessions: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
      include: { _count: { select: { documents: true } } },
    });
    return sessions;
  }),

  createChatSession: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const newSession = await prisma.chatSession.create({
      data: { userId: userId },
    });
    return newSession;
  }),

  deleteChatSession: protectedProcedure
    .input(z.object({ sessionId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await prisma.chatSession.delete({
        where: {
          id: input.sessionId,
          userId: userId,
        },
      });
      return { success: true };
    }),

  getChatSessionById: protectedProcedure
    .input(z.object({ sessionId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const session = await prisma.chatSession.findFirst({
        where: {
          id: input.sessionId,
          userId: userId,
        },
      });
      return session;
    }),

  updateSessionTopic: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().cuid(),
        topic: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await prisma.chatSession.update({
        where: {
          id: input.sessionId,
          userId: userId,
        },
        data: {
          topic: input.topic,
        },
      });
      return { success: true };
    }),
});
