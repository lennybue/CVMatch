import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { detectFileType, extractTextFromFile } from "@/lib/extractText";
import { saveUploadedFile } from "@/lib/storage";
import { parseCvFromText } from "@/ai/parseCv";
import { apiError } from "@/lib/apiError";
import { DEFAULT_PRESENTATION } from "@/types/presentation";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHORIZED");
  }

  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      originalFileName: true,
      createdAt: true,
      _count: { select: { versions: true, analyses: true } },
    },
  });

  return NextResponse.json({ resumes });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHORIZED");
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return apiError("NO_FILE_UPLOADED");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return apiError("FILE_TOO_LARGE");
  }

  let fileType: "pdf" | "docx";
  try {
    fileType = detectFileType(file.name, file.type);
  } catch {
    return apiError("UNSUPPORTED_FILE_TYPE");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let rawText: string;
  try {
    rawText = await extractTextFromFile(buffer, fileType);
  } catch (error) {
    console.error("Text extraction failed", error);
    return apiError("FILE_UNREADABLE");
  }

  if (!rawText || rawText.length < 50) {
    return apiError("FILE_TEXT_TOO_SHORT");
  }

  let structuredData;
  try {
    structuredData = await parseCvFromText(rawText);
  } catch (error) {
    console.error("CV parsing failed", error);
    return apiError("AI_PARSING_FAILED");
  }

  let storagePath: string;
  try {
    storagePath = await saveUploadedFile(session.user.id, file.name, buffer, fileType);
  } catch (error) {
    console.error("Resume storage upload failed", error);
    return apiError("GENERIC_ERROR");
  }

  const resume = await prisma.resume.create({
    data: {
      userId: session.user.id,
      title: structuredData.contact.fullName || file.name,
      originalFileName: file.name,
      originalFileType: fileType,
      storagePath,
      rawText,
      structuredData,
      versions: {
        create: {
          source: "ORIGINAL",
          isOriginal: true,
          structuredData,
          presentation: DEFAULT_PRESENTATION,
        },
      },
    },
    include: { versions: true },
  });

  return NextResponse.json({ resume }, { status: 201 });
}
