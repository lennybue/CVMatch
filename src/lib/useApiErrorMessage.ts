import { useTranslations } from "next-intl";

const KNOWN_CODES = new Set([
  "UNAUTHORIZED",
  "VALIDATION_ERROR",
  "NO_FILE_UPLOADED",
  "FILE_TOO_LARGE",
  "UNSUPPORTED_FILE_TYPE",
  "FILE_UNREADABLE",
  "FILE_TEXT_TOO_SHORT",
  "JOB_POSTING_TEXT_TOO_SHORT",
  "RESUME_NOT_FOUND",
  "JOB_POSTING_NOT_FOUND",
  "ANALYSIS_NOT_FOUND",
  "VERSION_NOT_FOUND",
  "APPLICATION_NOT_FOUND",
  "AI_PARSING_FAILED",
  "AI_ANALYSIS_FAILED",
  "AI_OPTIMIZATION_FAILED",
  "GENERIC_ERROR",
]);

/**
 * Maps a stable error code returned by our API routes to a localized
 * message. Falls back to the generic error message for unrecognized codes
 * (e.g. a network failure that never reached our API).
 */
export function useApiErrorMessage() {
  const t = useTranslations("errors");

  return (code: string | undefined | null): string => {
    if (code && KNOWN_CODES.has(code)) {
      return t(code as Parameters<typeof t>[0]);
    }
    return t("GENERIC_ERROR");
  };
}
