"use client";

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/app/_trpc/client";
import { cn } from "@/lib/utils";
import FormattedResponse from "./FormattedResponse";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { useSidebar } from "./ui/sidebar";
import { CheckCheckIcon, CheckIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import UploadButton from "./UploadButton";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Image from "next/image";
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
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [topicInput, setTopicInput] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { state } = useSidebar();
  const { data: Usersession } = useSession();
  const { refetch } = trpc.chat.getChatSessions.useQuery();

  const { data: messages } = trpc.chat.getMessages.useQuery({ sessionId });
  const { data: session } = trpc.chat.getChatSessionById.useQuery({
    sessionId,
  });
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
      refetch();
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
    if (isPending || messages?.length) {
      chatContainerRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isPending]);

  useEffect(() => {
    if (session && !session.topic) {
      setIsTopicModalOpen(true);
    }
  }, [session]);

  const { mutate: updateTopic } = trpc.chat.updateSessionTopic.useMutation({
    onSuccess: () => {
      utils.chat.getChatSessionById.invalidate({ sessionId });
      utils.chat.getChatSessions.invalidate();
      setIsTopicModalOpen(false);
    },
  });

  const handleTopicSubmit = () => {
    if (topicInput.trim()) {
      updateTopic({ sessionId, topic: topicInput });
    }
  };

  return (
    <div
      className={`${
        messages?.length ? "pb-40" : ""
      } flex flex-col h-full gap-10 max-w-8xl w-full mx-auto md:px-26 pt-6`}
    >
      <Dialog open={isTopicModalOpen} onOpenChange={setIsTopicModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Name this chat</DialogTitle>
            <DialogDescription>
              Give your new chat session a topic to easily find it later.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="e.g., Resume review for SDE role"
          />
          <DialogFooter>
            <Button className="cursor-pointer" onClick={handleTopicSubmit}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div
        className={`flex-1 w-full max-w-4xl mx-auto px-4 ${
          messages?.length === 0 ? "pt-6" : "pt-0"
        } pb-4 overflow-y-auto`}
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
              "flex items-center gap-4 group my-8 transition-opacity duration-300",
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
            {message.role === "user" && (
              <div className="flex justify-end items-center h-5 pr-2">
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger>
                      {message.id.startsWith("optimistic-") ? (
                        <CheckIcon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <CheckCheckIcon className="h-4 w-4 text-blue-500" />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {message.id.startsWith("optimistic-")
                          ? "Sending..."
                          : "Delivered"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            {message.role === "user" && (
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={Usersession?.user?.image ?? ""}
                  alt={Usersession?.user?.name ?? ""}
                />
                <AvatarFallback>{Usersession?.user?.name?.[0]}</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {isPending && (
          <div className="flex gap-4 group justify-start animate-fadeIn">
            <div className="h-8 w-8">
              <Image src="/logo.png" alt="Lumero" />
            </div>
            <div className="bg-muted text-foreground rounded-2xl px-5 py-3 max-w-[85%]">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-foreground rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        <div
          className={`fixed bottom-0 bg-white py-4 ${
            state === "expanded" ? "left-[50%] md:left-[60%]" : "left-[50%]"
          } -translate-x-1/2 flex flex-col justify-center w-full  items-center px-4`}
        >
          <div className="flex bg-black p-6 py-4 items-center gap-1 w-full max-w-xl rounded-2xl">
            <div className="px-2">
              <UploadButton sessionId={sessionId} />
            </div>
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
        <div ref={chatContainerRef} />
      </div>
    </div>
  );
}
