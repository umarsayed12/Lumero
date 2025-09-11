"use client";

import * as React from "react";
import { UserCircle2 } from "lucide-react";

import { NavigationMenu } from "@/components/ui/navigation-menu";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";

export default function Header() {
  const { toggleSidebar, state } = useSidebar();
  return (
    <NavigationMenu
      viewport={false}
      className="shadow-md flex justify-between items-center px-6 py-4 border-b w-full bg-white"
    >
      <div className="font-semibold">
        <span className="md:hidden">
          {state === "expanded" && (
            <SidebarTrigger className="cursor-e-resize" />
          )}
        </span>
        <span>Lumero</span>
      </div>
      <div className="cursor-pointer">
        <UserCircle2 />
      </div>
    </NavigationMenu>
  );
}
