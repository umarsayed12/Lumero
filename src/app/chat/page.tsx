"use client";

import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CreateChatPage() {
  const router = useRouter();
  const {
    mutate: createSession,
    isIdle,
    isSuccess,
    data,
  } = trpc.chat.createChatSession.useMutation();

  useEffect(() => {
    if (isIdle) createSession();
  }, [isIdle, createSession]);

  useEffect(() => {
    if (isSuccess && data) {
      router.push(`/chat/${data.id}`);
    }
  }, [isSuccess, data, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Creating a new chat...</p>
    </div>
  );
}
