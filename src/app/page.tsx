"use client";

import { useState } from "react";
import { trpc } from "./_trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [message, setMessage] = useState("");

  const { mutate: sendMessage, isPending } = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const sessionId = "";

    if (message.trim()) {
      sendMessage({ sessionId, message });
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-24">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">
          AI Career Counselor
        </h1>
        <div className="border rounded-md h-96 p-4 mb-4">
          <p>Chat history...</p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about your career..."
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </main>
  );
}
