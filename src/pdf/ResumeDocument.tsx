import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import type { CvData } from "@/types/cv";
import {
  RESUME_SECTION_KEYS,
  type Presentation,
  type ResumeSectionKey,
} from "@/types/presentation";

// Deliberately ATS-safe: single column, no tables, no images/icons, standard
// font, plain text bullets, clear section headings, chronological order.

const BOLD_FONT_BY_FAMILY: Record<Presentation["fontFamily"], string> = {
  Helvetica: "Helvetica-Bold",
  "Times-Roman": "Times-Bold",
  Courier: "Courier-Bold",
};

function buildStyles(presentation: Presentation) {
  const isCompact = presentation.template === "compact";
  const fontFamily = presentation.fontFamily;
  const boldFontFamily = BOLD_FONT_BY_FAMILY[fontFamily];

  return StyleSheet.create({
    page: {
      paddingTop: isCompact ? 32 : 40,
      paddingBottom: isCompact ? 32 : 40,
      paddingHorizontal: isCompact ? 40 : 48,
      fontFamily,
      fontSize: isCompact ? 9.5 : 10.5,
      color: "#1a1a1a",
      lineHeight: 1.35,
    },
    name: {
      fontSize: isCompact ? 18 : 22,
      fontFamily: boldFontFamily,
      marginBottom: 4,
      color: presentation.accentColor,
    },
    contactLine: {
      fontSize: isCompact ? 8.5 : 9.5,
      color: "#444444",
      marginBottom: 2,
    },
    section: {
      marginTop: isCompact ? 8 : 14,
    },
    sectionTitle: {
      fontSize: isCompact ? 10 : 11,
      fontFamily: boldFontFamily,
      textTransform: "uppercase",
      letterSpacing: 1,
      borderBottomWidth: 1,
      borderBottomColor: presentation.accentColor,
      paddingBottom: 3,
      marginBottom: isCompact ? 5 : 8,
    },
    summaryText: {
      fontSize: isCompact ? 9.5 : 10.5,
    },
    entry: {
      marginBottom: isCompact ? 6 : 10,
    },
    entryHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    entryTitle: {
      fontFamily: boldFontFamily,
      fontSize: isCompact ? 9.5 : 10.5,
    },
    entrySubtitle: {
      fontSize: isCompact ? 9.5 : 10.5,
    },
    entryDates: {
      fontSize: isCompact ? 8.5 : 9.5,
      color: "#444444",
    },
    bullet: {
      flexDirection: "row",
      marginTop: isCompact ? 2 : 3,
      paddingLeft: 10,
    },
    bulletDot: {
      width: 10,
      fontSize: isCompact ? 9.5 : 10.5,
      color: presentation.accentColor,
    },
    bulletText: {
      flex: 1,
      fontSize: isCompact ? 9.5 : 10.5,
    },
    skillsText: {
      fontSize: isCompact ? 9.5 : 10.5,
    },
  });
}

function formatRange(start: string, end: string, isCurrent: boolean) {
  const endLabel = isCurrent ? "Present" : end;
  if (!start && !endLabel) return "";
  if (!endLabel) return start;
  return `${start} – ${endLabel}`;
}

export function ResumeDocument({
  cv,
  presentation,
}: {
  cv: CvData;
  presentation: Presentation;
}) {
  const { contact } = cv;
  const styles = buildStyles(presentation);

  const sections: Partial<Record<ResumeSectionKey, React.ReactNode>> = {
    summary: cv.summary ? (
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.summaryText}>{cv.summary}</Text>
      </View>
    ) : null,

    skills: cv.skills.length > 0 ? (
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <Text style={styles.skillsText}>{cv.skills.join("  •  ")}</Text>
      </View>
    ) : null,

    experience: cv.experience.length > 0 ? (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        {cv.experience.map((exp, i) => (
          <View key={i} style={styles.entry} wrap={false}>
            <View style={styles.entryHeaderRow}>
              <Text style={styles.entryTitle}>{exp.jobTitle}</Text>
              <Text style={styles.entryDates}>
                {formatRange(exp.startDate, exp.endDate, exp.isCurrent)}
              </Text>
            </View>
            <Text style={styles.entrySubtitle}>
              {[exp.company, exp.location].filter(Boolean).join(", ")}
            </Text>
            {exp.bullets.map((bullet, j) => (
              <View key={j} style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    ) : null,

    education: cv.education.length > 0 ? (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        {cv.education.map((edu, i) => (
          <View key={i} style={styles.entry} wrap={false}>
            <View style={styles.entryHeaderRow}>
              <Text style={styles.entryTitle}>{edu.degree}</Text>
              <Text style={styles.entryDates}>
                {formatRange(edu.startDate, edu.endDate, false)}
              </Text>
            </View>
            <Text style={styles.entrySubtitle}>
              {[edu.institution, edu.location].filter(Boolean).join(", ")}
            </Text>
            {edu.details.map((detail, j) => (
              <View key={j} style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{detail}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    ) : null,

    projects: cv.projects.length > 0 ? (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Projects</Text>
        {cv.projects.map((project, i) => (
          <View key={i} style={styles.entry} wrap={false}>
            <Text style={styles.entryTitle}>{project.name}</Text>
            {project.description && (
              <Text style={styles.entrySubtitle}>{project.description}</Text>
            )}
            {project.bullets.map((bullet, j) => (
              <View key={j} style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    ) : null,

    certificates: cv.certificates.length > 0 ? (
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>Certificates</Text>
        {cv.certificates.map((cert, i) => (
          <Text key={i} style={styles.summaryText}>
            {[cert.name, cert.issuer, cert.date].filter(Boolean).join(" — ")}
          </Text>
        ))}
      </View>
    ) : null,

    languages: cv.languages.length > 0 ? (
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>Languages</Text>
        <Text style={styles.skillsText}>
          {cv.languages
            .map((lang) => (lang.level ? `${lang.name} (${lang.level})` : lang.name))
            .join("  •  ")}
        </Text>
      </View>
    ) : null,
  };

  const orderedKeys = [
    ...presentation.sectionOrder,
    ...RESUME_SECTION_KEYS.filter((key) => !presentation.sectionOrder.includes(key)),
  ];

  return (
    <Document title={`${contact.fullName} - Resume`} author={contact.fullName}>
      <Page size="A4" style={styles.page} wrap>
        <View>
          <Text style={styles.name}>{contact.fullName}</Text>
          <Text style={styles.contactLine}>
            {[contact.email, contact.phone, contact.location]
              .filter(Boolean)
              .join(" | ")}
          </Text>
          {contact.links.length > 0 && (
            <Text style={styles.contactLine}>
              {contact.links.map((link, i) => (
                <Link key={i} src={link.url} style={{ color: "#444444" }}>
                  {link.label}
                  {i < contact.links.length - 1 ? "  |  " : ""}
                </Link>
              ))}
            </Text>
          )}
        </View>

        {orderedKeys.map((key) => (
          <View key={key}>{sections[key]}</View>
        ))}
      </Page>
    </Document>
  );
}
