"use client";
import { SendIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { trpc } from "./_trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [message, setMessage] = useState("");
  const utils = trpc.useUtils();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const sessionId = "";

  const { data: messages, isLoading: isMessagesLoading } =
    trpc.chat.getMessages.useQuery({ sessionId });

  const { mutate: sendMessage, isPending } = trpc.chat.sendMessage.useMutation({
    onMutate: async ({ message }) => {
      setMessage("");
      await utils.chat.getMessages.cancel({ sessionId });
      const previousMessages = utils.chat.getMessages.getData({ sessionId });
      utils.chat.getMessages.setData({ sessionId }, (oldMessages = []) => [
        ...oldMessages,
        {
          id: `optimistic-${Date.now()}`,
          role: "user",
          content: message,
          createdAt: new Date().toISOString(),
          sessionId: sessionId,
        },
      ]);
      return { previousMessages };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousMessages) {
        utils.chat.getMessages.setData({ sessionId }, context.previousMessages);
      }
    },
    onSettled: () => {
      utils.chat.getMessages.invalidate({ sessionId });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) {
      return;
    } else {
      sendMessage({ sessionId, message });
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-24">
      <div className="w-full max-w-2xl flex flex-col h-[80vh]">
        <h1 className="text-2xl font-bold text-center mb-4">
          AI Career Counselor
        </h1>

        <div
          ref={chatContainerRef}
          className="flex-1 border rounded-md p-4 mb-4 overflow-y-auto"
        >
          {isMessagesLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-12 w-3/4 ml-auto" />
              <Skeleton className="h-12 w-3/4" />
            </div>
          ) : messages && messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex my-2 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">
              No messages yet. Start the conversation!
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about your career..."
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending}>
            <SendIcon />
          </Button>
        </form>
      </div>
    </main>
  );
}
