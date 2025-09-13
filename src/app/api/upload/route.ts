// src/app/api/upload/route.ts

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import pdf from "pdf-parse";

// The 'runtime' export has been removed as it's no longer needed.

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const sessionId = formData.get("sessionId") as string | null;

    if (!file || !sessionId) {
      return NextResponse.json(
        { error: "File and sessionId are required." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed." },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const pdfData = await pdf(fileBuffer);
    const extractedText = pdfData.text;
    console.log(extractedText);

    await prisma.document.create({
      data: {
        sessionId: sessionId,
        fileName: file.name,
        extractedText: extractedText.trim(),
      },
    });

    return NextResponse.json({ success: true, fileName: file.name });
  } catch (error) {
    console.error("Error processing upload:", error);
    return NextResponse.json(
      { error: "Failed to process PDF." },
      { status: 500 }
    );
  }
}
