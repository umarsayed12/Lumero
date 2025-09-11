"use client";

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/app/_trpc/client";
import { cn } from "@/lib/utils";
import FormattedResponse from "./FormattedResponse";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { useSidebar } from "./ui/sidebar";
const placeholders = [
  "What career path would suit my skills best?",
  "Which certifications should I pursue to grow in my field?",
  "Can you suggest some high-demand jobs for the future?",
  "How do I prepare for my first job interview?",
  "What skills should I add to my resume to stand out?",
];
export default function ChatUI({ sessionId }: { sessionId: string }) {
  const [message, setMessage] = useState("");
  const utils = trpc.useUtils();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { state } = useSidebar();
  const { data: messages, isLoading: isMessagesLoading } =
    trpc.chat.getMessages.useQuery({ sessionId });

  const { mutate: sendMessage } = trpc.chat.sendMessage.useMutation({
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim()) {
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
    <div
      className={`${
        messages?.length ? "pb-40" : ""
      } flex flex-col gap-10 max-w-8xl w-full mx-auto px-26 pt-6`}
    >
      {messages?.length === 0 && (
        <div className="flex w-full flex-col items-center justify-center min-h-[60vh] space-y-8">
          <div className="px-1 text-center w-full text-pretty text-3xl whitespace-pre-wrap">
            Hi.{"\n"} How can I help you today?
          </div>
        </div>
      )}

      {messages?.map((message, index) => (
        <div
          key={message.id || index}
          className={cn(
            "flex gap-4 group transition-opacity duration-300",
            message.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          <div
            className={cn(
              "rounded-4xl px-5 py-3 break-words relative transition-all duration-300 ease-in-out",
              message.role === "user"
                ? "bg-neutral-300 text-black ml-auto max-w-[85%] sm:max-w-[75%]"
                : "bg-transparent w-full text-gray-900"
            )}
          >
            <div className="prose prose-sm max-w-none">
              {message.role === "user" ? (
                <div className="flex justify-between items-center gap-2">
                  <span>{message.content}</span>
                </div>
              ) : (
                <FormattedResponse content={message.content} />
              )}
            </div>
          </div>
        </div>
      ))}

      {isMessagesLoading && (
        <div className="flex gap-4 group justify-start animate-fadeIn">
          <div className="text-gray-900 rounded-2xl px-4 py-3 max-w-[85%] sm:max-w-[75%]">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div
                  className="w-4 h-4 bg-black rounded-full animate-pulse"
                  style={{
                    animation: "scaleUpDown 2s ease-in-out infinite",
                  }}
                ></div>
                <style jsx>{`
                  @keyframes scaleUpDown {
                    0%,
                    100% {
                      transform: scale(1);
                    }
                    50% {
                      transform: scale(0.8);
                    }
                  }
                `}</style>
              </div>
            </div>
          </div>
        </div>
      )}
      <div ref={chatContainerRef} />

      <div
        className={`fixed bottom-0 bg-white py-4 ${
          state === "expanded" ? "left-[50%] md:left-[60%]" : "left-[50%]"
        } -translate-x-1/2 flex flex-col justify-center w-full  items-center px-4`}
      >
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
