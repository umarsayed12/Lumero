"use client";

import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function ChatRedirectPage() {
  const router = useRouter();
  const creationTriggered = useRef(false);

  const { data: sessions, isLoading: isLoadingSessions } =
    trpc.chat.getChatSessions.useQuery();

  const {
    mutate: createSession,
    data: newSessionData,
    isSuccess: isCreateSuccess,
  } = trpc.chat.createChatSession.useMutation();

  useEffect(() => {
    if (isLoadingSessions) {
      return;
    }

    if (sessions && sessions.length > 0) {
      router.push(`/chat/${sessions[0].id}`);
    } else if (!isLoadingSessions && (!sessions || sessions.length === 0)) {
      if (!creationTriggered.current) {
        createSession();
        creationTriggered.current = true;
      }
    }
  }, [sessions, isLoadingSessions, createSession, router]);

  useEffect(() => {
    if (isCreateSuccess && newSessionData) {
      router.push(`/chat/${newSessionData.id}`);
    }
  }, [isCreateSuccess, newSessionData, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Loading your conversations...</p>
    </div>
  );
}
