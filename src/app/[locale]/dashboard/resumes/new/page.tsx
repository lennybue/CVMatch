"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UploadCloud, FileText, Loader2 } from "lucide-react";
import { useApiErrorMessage } from "@/lib/useApiErrorMessage";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function NewResumePage() {
  const router = useRouter();
  const t = useTranslations("upload");
  const getApiErrorMessage = useApiErrorMessage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  function handleFileSelected(selected: File | null) {
    if (!selected) return;
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      toast.error(t("unsupportedType"));
      return;
    }
    setFile(selected);
  }

  async function handleUpload() {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/resumes", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(getApiErrorMessage(data.error));
        return;
      }

      toast.success(t("success"));
      router.push(`/dashboard/resumes/${data.resume.id}`);
    } catch {
      toast.error(getApiErrorMessage(undefined));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">{t("fileCardTitle")}</CardTitle>
          <CardDescription>{t("fileCardSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFileSelected(e.dataTransfer.files[0] ?? null);
            }}
            className={`flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            {file ? (
              <>
                <FileText className="size-8 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </>
            ) : (
              <>
                <UploadCloud className="size-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{t("dropPrompt")}</p>
                  <p className="text-sm text-muted-foreground">{t("dropHint")}</p>
                </div>
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
          />

          <Button
            className="mt-6 w-full"
            disabled={!file || isUploading}
            onClick={handleUpload}
          >
            {isUploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t("submitting")}
              </>
            ) : (
              t("submit")
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
