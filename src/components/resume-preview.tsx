import type { CSSProperties } from "react";
import type { CvData } from "@/types/cv";
import { RESUME_SECTION_KEYS, type Presentation, type ResumeSectionKey } from "@/types/presentation";
import { cn } from "@/lib/utils";

const FONT_CLASS_BY_FAMILY: Record<Presentation["fontFamily"], string> = {
  Helvetica: "font-sans",
  "Times-Roman": "font-serif",
  Courier: "font-mono",
};

function formatRange(start: string, end: string, isCurrent: boolean) {
  const endLabel = isCurrent ? "Present" : end;
  if (!start && !endLabel) return "";
  if (!endLabel) return start;
  return `${start} – ${endLabel}`;
}

export function ResumePreview({
  cv,
  presentation,
}: {
  cv: CvData;
  presentation: Presentation;
}) {
  const isCompact = presentation.template === "compact";
  const accentStyle = { "--accent": presentation.accentColor } as CSSProperties;

  const sections: Partial<Record<ResumeSectionKey, React.ReactNode>> = {
    summary: cv.summary ? (
      <Section title="Summary" compact={isCompact}>
        <p className="text-[13px] leading-relaxed text-neutral-700">{cv.summary}</p>
      </Section>
    ) : null,

    skills: cv.skills.length > 0 ? (
      <Section title="Skills" compact={isCompact}>
        <p className="text-[13px] text-neutral-700">{cv.skills.join("  •  ")}</p>
      </Section>
    ) : null,

    experience: cv.experience.length > 0 ? (
      <Section title="Experience" compact={isCompact}>
        <div className={cn("space-y-3", isCompact && "space-y-2")}>
          {cv.experience.map((exp, i) => (
            <div key={i}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[13px] font-semibold text-neutral-900">{exp.jobTitle}</p>
                <p className="shrink-0 text-[11px] text-neutral-500">
                  {formatRange(exp.startDate, exp.endDate, exp.isCurrent)}
                </p>
              </div>
              <p className="text-[13px] text-neutral-700">
                {[exp.company, exp.location].filter(Boolean).join(", ")}
              </p>
              <ul className="mt-1 space-y-0.5">
                {exp.bullets.map((bullet, j) => (
                  <li key={j} className="flex gap-1.5 text-[13px] text-neutral-700">
                    <span style={{ color: "var(--accent)" }}>•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    ) : null,

    education: cv.education.length > 0 ? (
      <Section title="Education" compact={isCompact}>
        <div className={cn("space-y-3", isCompact && "space-y-2")}>
          {cv.education.map((edu, i) => (
            <div key={i}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[13px] font-semibold text-neutral-900">{edu.degree}</p>
                <p className="shrink-0 text-[11px] text-neutral-500">
                  {formatRange(edu.startDate, edu.endDate, false)}
                </p>
              </div>
              <p className="text-[13px] text-neutral-700">
                {[edu.institution, edu.location].filter(Boolean).join(", ")}
              </p>
            </div>
          ))}
        </div>
      </Section>
    ) : null,

    projects: cv.projects.length > 0 ? (
      <Section title="Projects" compact={isCompact}>
        <div className={cn("space-y-3", isCompact && "space-y-2")}>
          {cv.projects.map((project, i) => (
            <div key={i}>
              <p className="text-[13px] font-semibold text-neutral-900">{project.name}</p>
              {project.description && (
                <p className="text-[13px] text-neutral-700">{project.description}</p>
              )}
            </div>
          ))}
        </div>
      </Section>
    ) : null,

    certificates: cv.certificates.length > 0 ? (
      <Section title="Certificates" compact={isCompact}>
        <div className="space-y-0.5">
          {cv.certificates.map((cert, i) => (
            <p key={i} className="text-[13px] text-neutral-700">
              {[cert.name, cert.issuer, cert.date].filter(Boolean).join(" — ")}
            </p>
          ))}
        </div>
      </Section>
    ) : null,

    languages: cv.languages.length > 0 ? (
      <Section title="Languages" compact={isCompact}>
        <p className="text-[13px] text-neutral-700">
          {cv.languages
            .map((lang) => (lang.level ? `${lang.name} (${lang.level})` : lang.name))
            .join("  •  ")}
        </p>
      </Section>
    ) : null,
  };

  const orderedKeys = [
    ...presentation.sectionOrder,
    ...RESUME_SECTION_KEYS.filter((key) => !presentation.sectionOrder.includes(key)),
  ];

  return (
    <div
      style={accentStyle}
      className={cn(
        "aspect-[210/297] w-full overflow-y-auto bg-white p-8 text-neutral-900 shadow-sm",
        FONT_CLASS_BY_FAMILY[presentation.fontFamily],
        isCompact && "p-6",
      )}
    >
      <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
        {cv.contact.fullName}
      </p>
      <p className="mt-1 text-[11px] text-neutral-600">
        {[cv.contact.email, cv.contact.phone, cv.contact.location].filter(Boolean).join(" | ")}
      </p>

      {orderedKeys.map((key) => (
        <div key={key}>{sections[key]}</div>
      ))}
    </div>
  );
}

function Section({
  title,
  compact,
  children,
}: {
  title: string;
  compact: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mt-3.5", compact && "mt-2.5")}>
      <p
        className="border-b pb-1 text-[11px] font-bold tracking-wide text-neutral-900 uppercase"
        style={{ borderColor: "var(--accent)" }}
      >
        {title}
      </p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
