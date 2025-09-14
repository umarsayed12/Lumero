import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import pdf from "pdf-parse";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const sessionId = formData.get("sessionId") as string | null;

    if (!file || !sessionId) {
      return NextResponse.json(
        { error: "File and sessionId are required." },
        { status: 400 }
      );
    }

    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: userId,
      },
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: "Chat session not found or you do not have access." },
        { status: 404 }
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

    await prisma.document.create({
      data: {
        sessionId: sessionId,
        userId: userId,
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
