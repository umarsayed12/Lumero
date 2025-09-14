"use client";

import * as React from "react";

import { NavigationMenu } from "@/components/ui/navigation-menu";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import UserAuth from "./UserAuth";

export default function Header() {
  const { state } = useSidebar();
  return (
    <NavigationMenu
      viewport={false}
      className="shadow-md flex justify-between items-center px-6 py-4 border-b w-full bg-white"
    >
      <div className="font-semibold flex items-center">
        <span className="md:hidden">
          {state === "expanded" && (
            <SidebarTrigger className="cursor-e-resize" />
          )}
        </span>
        <span>Lumero</span>
      </div>
      <div className="cursor-pointer">
        <UserAuth />
      </div>
    </NavigationMenu>
  );
}
