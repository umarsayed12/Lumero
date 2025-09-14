"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { LogIn, LogOut } from "lucide-react";

export default function UserAuth() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Button variant="outline">Loading...</Button>;
  }

  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-8 w-8 rounded-full cursor-pointer"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={session.user?.image ?? ""}
                alt={session.user?.name ?? ""}
              />
              <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session.user?.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-red-400"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="text-red-400 mr-2 h-4 w-4" />
            <span className="text-red-400">Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button onClick={() => signIn("google")}>
      <LogIn className="mr-2 h-4 w-4" />
      Sign In with Google
    </Button>
  );
}
