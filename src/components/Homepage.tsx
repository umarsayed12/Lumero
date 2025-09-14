"use client";

import { signIn } from "next-auth/react";
import { Button } from "./ui/button";
import { Loader2, LogIn } from "lucide-react";
import { useState } from "react";

export default function Homepage() {
  const [loading, setLoading] = useState(false);
  const handleAuth = () => {
    setLoading(true);
    signIn("google", { callbackUrl: "/chat" });
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <img src="/logo.png" className="w-21 h-22 mb-2" />
      <h1 className="text-4xl sm:text-5xl font-bold mb-2">
        Welcome to Lumero.ai
      </h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
        Get personalized career advice, resume feedback, and interview
        preparation powered by AI. Sign in to start your first conversation.
      </p>
      <Button
        size="lg"
        className="cursor-pointer"
        disabled={loading}
        onClick={handleAuth}
      >
        {!loading ? (
          <>
            <LogIn className="mr-2 h-5 w-5" />
            Sign In with Google
          </>
        ) : (
          <>
            <Loader2 className="w-2 h-2 animate-spin" />
            Please Wait
          </>
        )}
      </Button>
    </div>
  );
}
