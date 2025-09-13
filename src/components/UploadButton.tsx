"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { trpc } from "@/app/_trpc/client";
import toast, { Toaster } from "react-hot-toast";
import { UploadCloud } from "lucide-react";

export default function UploadButton({ sessionId }: { sessionId: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const utils = trpc.useUtils();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading("Uploading your document...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sessionId", sessionId);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || "Upload failed");
      }

      utils.chat.getChatSessions.invalidate();

      toast.success(`'${body.fileName}' uploaded successfully!`, {
        id: toastId,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Toaster position="bottom-center" />

      <div className="flex items-center">
        <label htmlFor="file-upload" className="cursor-pointer">
          <Button asChild variant="outline" size="icon" disabled={isUploading}>
            <div>
              <UploadCloud className="h-4 w-4" />
              <span className="sr-only">Upload Document</span>
            </div>
          </Button>
        </label>
        <input
          id="file-upload"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
    </>
  );
}
