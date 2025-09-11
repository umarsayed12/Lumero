"use client";

import { trpc } from "@/app/_trpc/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sidebar as SideBar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "./ui/sidebar";
import {
  BotIcon,
  Ellipsis,
  PencilIcon,
  ShareIcon,
  SquarePen,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export default function Sidebar() {
  const router = useRouter();
  const [hoverId, setHoverId] = useState("");
  const [openMenuId, setOpenMenuId] = useState("");
  const [openMenu, setOpenMenu] = useState(false);
  const { toggleSidebar, state } = useSidebar();
  const utils = trpc.useUtils();
  const {
    data: sessions,
    isLoading,
    refetch,
  } = trpc.chat.getChatSessions.useQuery();
  const { mutate: createSession } = trpc.chat.createChatSession.useMutation({
    onSuccess: (newSession) => {
      refetch();
      router.push(`/chat/${newSession.id}`);
    },
  });
  const { mutate: deleteSession } = trpc.chat.deleteChatSession.useMutation({
    onSuccess: async () => {
      await utils.chat.getChatSessions.invalidate();
      const updatedSessions = utils.chat.getChatSessions.getData();
      if (updatedSessions && updatedSessions.length > 0) {
        router.push(`/chat/${updatedSessions[0].id}`);
      } else {
        router.push("/chat");
      }
    },
  });

  return (
    <SideBar className="py-1" collapsible="icon">
      <SidebarHeader
        className={`px-4 flex ${
          state === "expanded" ? "flex-row" : "flex-col"
        } items-center justify-between`}
      >
        <div className="flex items-center gap-1">
          <BotIcon
            onClick={toggleSidebar}
            className="text-black dark:text-white cursor-e-resize hover:bg-sidebar-accent"
          />
        </div>
        {state === "expanded" && <SidebarTrigger className="cursor-e-resize" />}
      </SidebarHeader>
      {state === "expanded" && (
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <Button
                  onClick={() => createSession()}
                  className="w-full cursor-pointer"
                >
                  <SquarePen /> New Chat
                </Button>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Chats</SidebarGroupLabel>
            {!isLoading ? (
              <SidebarGroupContent>
                <SidebarMenu>
                  {sessions?.map((session) => (
                    <SidebarMenuItem key={session.id}>
                      <SidebarMenuButton asChild>
                        <div
                          onMouseEnter={() => setHoverId(session.id)}
                          onMouseLeave={() => setHoverId("")}
                          className="flex justify-between items-center cursor-pointer"
                        >
                          <Link
                            className="w-[95%] active:bg-accent hover:bg-accent cursor-pointer"
                            href={`/chat/${session?.id}`}
                          >
                            <div className="w-full flex justify-between items-center">
                              <p className="truncate">
                                {session?.topic
                                  ? session.topic
                                  : "New Chat-" +
                                    session.id.substring(
                                      session.id.length - 10,
                                      6
                                    )}
                              </p>
                            </div>
                          </Link>
                          {hoverId === session.id && (
                            <Ellipsis
                              onClick={() => {
                                setOpenMenu((prev) => !prev);
                                setOpenMenuId(session.id);
                              }}
                              className="w-4 h-4 hover:bg-accent"
                            />
                          )}
                        </div>
                      </SidebarMenuButton>
                      {openMenu && openMenuId === session.id && (
                        <div className="absolute right-0 z-10 w-[60%] h-[130px] bg-white shadow rounded-2xl flex flex-col justify-center gap-2 p-4 text-sm">
                          <button className="flex items-center justify-start gap-2 hover:bg-gray-100 rounded-md px-2 py-1 transition cursor-pointer">
                            <ShareIcon className="w-4 h-4" />
                            <p>Share</p>
                          </button>
                          <button className="flex items-center justify-start gap-2 hover:bg-gray-100 rounded-md px-2 py-1 transition cursor-pointer">
                            <PencilIcon className="w-4 h-4" />
                            <p>Rename</p>
                          </button>
                          <div className="border-b-2 border-gray-100"></div>
                          <button
                            onClick={() =>
                              deleteSession({ sessionId: session.id })
                            }
                            className="flex items-center justify-start gap-2 hover:bg-red-100 text-red-600 rounded-md px-2 py-1 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                            <p>Delete</p>
                          </button>
                        </div>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            ) : (
              <></>
            )}
          </SidebarGroup>
        </SidebarContent>
      )}
    </SideBar>
  );
}
