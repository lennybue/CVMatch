import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CvDataSchema } from "@/types/cv";
import { DEFAULT_PRESENTATION, PresentationSchema } from "@/types/presentation";
import { ResumeDocument } from "@/pdf/ResumeDocument";
import { apiError } from "@/lib/apiError";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHORIZED");
  }

  const { id } = await params;

  const version = await prisma.resumeVersion.findFirst({
    where: { id, resume: { userId: session.user.id } },
    include: { resume: true },
  });

  if (!version) {
    return apiError("VERSION_NOT_FOUND");
  }

  const cv = CvDataSchema.parse(version.structuredData);
  const presentation = version.presentation
    ? PresentationSchema.parse(version.presentation)
    : DEFAULT_PRESENTATION;
  const buffer = await renderToBuffer(
    <ResumeDocument cv={cv} presentation={presentation} />,
  );

  const fileNameBase = (cv.contact.fullName || version.resume.title || "resume")
    .replace(/[^a-z0-9]+/gi, "_")
    .toLowerCase();

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileNameBase}_resume.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
