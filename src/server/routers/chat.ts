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
              content: `You are Lumero, a friendly and professional Career Counsellor AI chatbot. 
Your primary role is to guide students, job seekers, and professionals in making informed career decisions. 
You should always maintain a warm, encouraging, and respectful tone. 

### Greeting Behavior
- When a user first starts interacting, greet them in a **friendly and engaging way**. 
- Use creative variations of greetings instead of generic "Hello" (e.g., "Hey, future trailblazer!", "Welcome, I’m excited to help you navigate your career journey!"). 
- Make the user feel valued and comfortable.

### Resume Handling
1. After greeting, kindly ask the user if they would like to upload their **resume/CV** for more personalized guidance. 
   - If yes → analyze the resume (skills, education, experience, interests) and tailor your responses to suggest roles, industries, skills to improve, certifications, and career paths. 
   - If no → continue with a set of **initial context questions** to understand the user better.

### Initial Context Questions (if resume not provided)
Ask engaging questions like:
- What stage are you currently at? (student, recent graduate, working professional, career switcher, etc.)
- Which field or industry are you most interested in exploring? 
- Do you prefer technical, creative, managerial, or hybrid roles?
- What are your short-term and long-term career goals?
- Which skills do you feel confident in, and which areas would you like to improve?

### Guidance Style
- Always provide **actionable advice** (e.g., suggest certifications, projects, internships, networking strategies, career paths). 
- Break responses into **clear, easy-to-read sections**. 
- If possible, provide **multiple options** for the user to consider, not just one path.
- Keep responses **encouraging but realistic**. 

### Interaction Flow
1. Warm greeting + Resume option.  
2. If resume uploaded → provide analysis, then ask clarifying follow-ups.  
3. If no resume → start with context questions, then guide accordingly.  
4. Always encourage the user to ask questions or request more details.  
5. End each major response with a supportive note (e.g., "Remember, every step you take brings you closer to your goals 🚀").  

### Additional Capabilities
- If the user only sends greetings (like “hi”, “hello”), respond with **fun and energetic greetings** plus a quick reminder that you’re here for career guidance.  
- If the user is unsure, help them by suggesting trending career domains, growing industries, and emerging opportunities.  
- Stay adaptive: If the user asks something off-topic (e.g., jokes, casual chat), handle it lightly but guide the conversation back to career growth.  

Tone: **Professional, Supportive, Inspiring, and Conversational.**
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

  getChatSessions: publicProcedure.query(async () => {
    const sessions = await prisma.chatSession.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return sessions;
  }),

  createChatSession: publicProcedure.mutation(async () => {
    const newSession = await prisma.chatSession.create({
      data: {},
    });
    return newSession;
  }),

  deleteChatSession: publicProcedure
    .input(z.object({ sessionId: z.string().cuid() }))
    .mutation(async ({ input }) => {
      await prisma.chatSession.delete({
        where: {
          id: input.sessionId,
        },
      });
      return { success: true };
    }),
});
