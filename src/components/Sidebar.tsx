"use client";

import { trpc } from "@/app/_trpc/client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  Ellipsis,
  FileText,
  PencilIcon,
  ShareIcon,
  SquarePen,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { type ChatSession } from "@prisma/client";
import { useState } from "react";
import { Button } from "./ui/button";

type SessionBase = Omit<ChatSession, "createdAt" | "updatedAt">;

type ClientSideSession = SessionBase & {
  createdAt: string;
  updatedAt: string;
};
type SessionWithDocCount = ClientSideSession & {
  _count: {
    documents: number;
  };
};
export default function Sidebar() {
  const router = useRouter();
  const params = useParams();
  const [hoverId, setHoverId] = useState("");
  const [openMenuId, setOpenMenuId] = useState("");
  const [openMenu, setOpenMenu] = useState(false);
  const { toggleSidebar, state } = useSidebar();
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [activeId, setActiveId] = useState(params.sessionId);
  const [sessionToRename, setSessionToRename] =
    useState<SessionWithDocCount | null>(null);
  const [newTopicInput, setNewTopicInput] = useState("");
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

  const { mutate: updateTopic } = trpc.chat.updateSessionTopic.useMutation({
    onSuccess: () => {
      setIsRenameModalOpen(false);
      utils.chat.getChatSessions.invalidate();
    },
  });

  const handleRenameClick = (session: SessionWithDocCount) => {
    setSessionToRename(session);
    setNewTopicInput(session.topic || "");
    setIsRenameModalOpen(true);
    setOpenMenuId("");
  };

  const handleSaveRename = () => {
    if (sessionToRename && newTopicInput.trim()) {
      updateTopic({
        sessionId: sessionToRename.id,
        topic: newTopicInput,
      });
    }
  };
  return (
    <SideBar className="py-1" collapsible="icon">
      <Dialog open={isRenameModalOpen} onOpenChange={setIsRenameModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename chat</DialogTitle>
            <DialogDescription>
              Enter a new topic for this chat session.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newTopicInput}
            onChange={(e) => setNewTopicInput(e.target.value)}
            placeholder="e.g., Resume review for SDE role"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameModalOpen(false)}
            >
              Cancel
            </Button>
            <Button className="cursor-pointer" onClick={handleSaveRename}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <SidebarHeader
        className={`px-4 flex ${
          state === "expanded" ? "flex-row" : "flex-col"
        } items-center justify-between`}
      >
        <div className="flex items-center gap-1">
          {state === "expanded" && (
            <div
              onClick={toggleSidebar}
              className="text-black dark:text-white cursor-e-resize hover:bg-sidebar-accent"
            >
              <img src="/logo.png" className="w-7 h-8" />
            </div>
          )}
        </div>
        <SidebarTrigger className="cursor-e-resize" />
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
                    <SidebarMenuItem
                      className={`${
                        activeId === session?.id ? "bg-gray-200" : ""
                      } rounded-md`}
                      key={session.id}
                    >
                      <SidebarMenuButton asChild>
                        <div
                          onMouseEnter={() => setHoverId(session.id)}
                          onMouseLeave={() => setHoverId("")}
                          className="flex justify-between items-center cursor-pointer"
                        >
                          <Link
                            onClick={() => setActiveId(session?.id)}
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
                              {session._count.documents > 0 && (
                                <div className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
                                  <FileText className="h-3 w-3" />
                                  {session._count.documents}
                                </div>
                              )}
                            </div>
                          </Link>
                          {hoverId === session.id && (
                            <Ellipsis
                              onClick={() => {
                                setOpenMenu((prev) => !prev);
                                setOpenMenuId(session.id);
                              }}
                              className="w-4 h-4 hidden md:block hover:bg-accent"
                            />
                          )}
                          <Ellipsis
                            onClick={() => {
                              setOpenMenu((prev) => !prev);
                              setOpenMenuId(session.id);
                            }}
                            className="w-4 h-4 md:hidden hover:bg-accent"
                          />
                        </div>
                      </SidebarMenuButton>
                      {openMenu && openMenuId === session.id && (
                        <div className="absolute right-0 z-10 w-[60%] h-[130px] bg-white shadow rounded-2xl flex flex-col justify-center gap-2 p-4 text-sm">
                          <button
                            onClick={() => handleRenameClick(session)}
                            className="flex items-center justify-start gap-2 hover:bg-gray-100 rounded-md px-2 py-1 transition cursor-pointer"
                          >
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
