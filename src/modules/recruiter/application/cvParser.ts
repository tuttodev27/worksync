const extractEmail = (text: string): string => {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0] ?? "";
};

const extractPhone = (text: string): string => {
  const match =
    text.match(
      /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/,
    ) ?? null;
  return match?.[0]?.trim() ?? "";
};

const extractCountryPhone = (phone: string, text: string): string => {
  const source = `${phone} ${text}`;
  const codeMatch = source.match(/\+(56|57|53|54|51|52|58|34|1)\b/);
  return codeMatch ? `+${codeMatch[1]}` : "";
};

const mapYearsToRange = (years: number): string => {
  if (years <= 0) return "Sin experiencia";
  if (years <= 1) return "0-1 anos";
  if (years <= 2) return "1-2 anos";
  if (years <= 5) return "3-5 anos";
  if (years <= 10) return "6-10 anos";
  return "10+ anos";
};

const extractExperienceYears = (text: string): string => {
  const normalized = text.toLowerCase();

  const rangeMatch = normalized.match(
    /(\d+)\s*(?:-|–|a\s+la|al|a)\s*(\d+)\s*(?:anos|años|years?)/,
  );
  if (rangeMatch) {
    return mapYearsToRange(Number(rangeMatch[2]));
  }

  if (/10\s*\+|\+10|más\s+de\s+10|more\s+than\s+10/.test(normalized)) {
    return "10+ anos";
  }
  if (/sin\s+experiencia|no\s+experience/.test(normalized)) {
    return "Sin experiencia";
  }

  const explicitYears = normalized.match(/(\d+)\s*(anos|años|years?)/);
  if (explicitYears) {
    return mapYearsToRange(Number(explicitYears[1]));
  }

  const monthMatches = normalized.match(/(\d+)\s*(meses|months?)/g);
  if (monthMatches?.length) {
    const totalMonths = monthMatches
      .map((m) => Number(m.match(/\d+/)?.[0] ?? 0))
      .reduce((acc, n) => acc + n, 0);
    if (totalMonths > 0) {
      return mapYearsToRange(totalMonths / 12);
    }
  }

  return "";
};

const extractEducationLevel = (text: string): string => {
  const t = text.toLowerCase();
  if (/doctorado|phd|doctor/.test(t)) return "Doctorado";
  if (/mag[ií]ster|maestr[ií]a|mba|postgrado|posgrado|especializaci/.test(t))
    return "Magister";
  if (/universidad|universitario|ingenier[ií]a|licenciatura|bachillerato/.test(t))
    return "Universitario";
  if (/t[eé]cnico/.test(t)) return "Tecnico";
  if (/secundaria|educaci[oó]n media|ense[ñn]anza media/.test(t))
    return "Educacion media";
  return "";
};

const extractLanguage = (text: string): string => {
  const t = text.toLowerCase();
  if (/ingl[eé]s|english/.test(t)) return "Ingles";
  if (/franc[eé]s|french/.test(t)) return "Frances";
  if (/espa[ñn]ol|spanish/.test(t)) return "Espanol";
  return "";
};

const extractLanguageLevel = (text: string): string => {
  const t = text.toLowerCase();
  const level = t.match(/\b(a1|a2|b1|b2|c1|c2)\b/);
  if (level) return level[1].toUpperCase();
  if (/b[aá]sico|basic/.test(t)) return "A2";
  if (/intermedio|intermediate/.test(t)) return "B1";
  if (/avanzado|advanced|fluent/.test(t)) return "C1";
  return "";
};

const extractProfessionalProfile = (text: string): string => {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const byKeyword = lines.find(
    (l) =>
      /(ingeniero|engineer|developer|desarrollador|analyst|analista|arquitecto|consultor|cargo|position|rol)/i.test(
        l,
      ) && l.length <= 120,
  );

  if (!byKeyword) return "";

  return byKeyword
    .replace(/\s*\+?\d[\d\s-]{6,}.*/g, "")
    .replace(/\s+[|•-]\s+.*/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const ROLE_KEYWORDS =
  /(ingeniero|engineer|developer|desarrollador|analyst|analista|arquitecto|architect|consultor|consultant|diseñador|designer|t[eé]cnico|especialista|specialist|programador|programmer|l[ií]der|senior|junior|lead|full[- ]stack|frontend|backend|devops|ux|dev)/i;

const extractHeadline = (text: string): string => {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 20);

  const isNoise = (line: string) =>
    line.length < 4 ||
    line.length > 80 ||
    /@/.test(line) ||
    /(\d[-\s]?){5,}/.test(line) ||
    /^(cv|curriculum|curriculo|resume|hoja\s+de\s+vida|perfil|datos\s+personales)/i.test(
      line,
    );

  const headline = lines.find(
    (line) =>
      !isNoise(line) &&
      ROLE_KEYWORDS.test(line) &&
      /^[\p{L}\p{N}\s|+\-.,:&/()']+$/u.test(line),
  );

  if (!headline) return "";

  return headline
    .replace(/\s*\+?\d[\d\s-]{6,}.*/g, "")
    .replace(/\s+[|•-]\s+.*/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const SUMMARY_HEADINGS =
  /^(perfil(\s+profesional)?|resumen(\s+profesional)?|profile|summary|sobre\s+m[ií]|acerca\s+de\s+m[ií]?|about|objetivo)/i;

const NEXT_SECTION =
  /^(experiencia|formaci|educaci|habilidades|conocimientos|skills|idiomas|languages|contacto|referencias|proyectos|certificaciones|cursos|extras|otros|trayectoria)/i;

const extractSummary = (text: string): string => {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const headingIndex = lines.findIndex((l) => SUMMARY_HEADINGS.test(l));
  if (headingIndex === -1) return "";

  const parts: string[] = [];
  const inline = lines[headingIndex].includes(":")
    ? lines[headingIndex].split(":").slice(1).join(":").trim()
    : "";
  if (inline) parts.push(inline);

  for (const line of lines.slice(headingIndex + 1)) {
    if (NEXT_SECTION.test(line)) break;
    if (/@/.test(line) || /(\d[-\s]?){5,}/.test(line)) break;
    parts.push(line);
    if (parts.join(" ").length > 600) break;
  }

  const summary = parts
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (summary.length < 20) return "";
  return summary.slice(0, 500).trim();
};

const extractTechnicalSkills = (text: string): string => {
  const matches = text.match(
    /\b(Java|TypeScript|JavaScript|React|Angular|Vue|Node|Spring Boot|Spring|SQL|PostgreSQL|MySQL|MongoDB|Docker|Kubernetes|AWS|Azure|GCP|Kafka|Python|C#|\.NET)\b/gi,
  );
  if (!matches?.length) return "";
  const unique = Array.from(new Set(matches.map((m) => m.trim())));
  return unique.join(", ");
};

const splitName = (line: string): { firstName: string; lastName: string } => {
  const cleaned = line
    .replace(/[^\p{L}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  const stopwords = new Set([
    "cv",
    "curriculum",
    "vitae",
    "resume",
    "hoja",
    "de",
    "vida",
    "perfil",
    "professional",
  ]);

  const parts = cleaned
    .split(" ")
    .map((p) => p.trim())
    .filter(Boolean)
    .filter((p) => !stopwords.has(p.toLowerCase()));

  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };

  return {
    firstName: parts.slice(0, 1).join(" "),
    lastName: parts.slice(1).join(" "),
  };
};

const guessNameFromText = (
  text: string,
  fileName: string,
): { firstName: string; lastName: string } => {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const candidateLine =
    lines.find(
      (l) =>
        l.length >= 5 &&
        l.length <= 80 &&
        !/@/.test(l) &&
        !/\d{4,}/.test(l) &&
        /^[\p{L}\s.'-]+$/u.test(l),
    ) ?? "";

  if (candidateLine) return splitName(candidateLine);

  const baseName = fileName.replace(/\.pdf$/i, "").trim();
  const normalized = baseName
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return splitName(normalized);
};

export interface CvExtractedData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  identityDocument: string;
  latestPosition: string;
  yearsExperience: string;
  educationLevel: string;
  headline: string;
  summary: string;
  language: string;
  languageLevel: string;
  technicalSkills: string;
}

export interface CvParseResult {
  data: CvExtractedData;
  suggested: string[];
}

export function parseCvText(fullText: string, fileName: string): CvParseResult {
  const { firstName, lastName } = guessNameFromText(fullText, fileName);
  const email = extractEmail(fullText);
  const phone = extractPhone(fullText);
  const countryCode = extractCountryPhone(phone, fullText);
  const latestPosition = extractProfessionalProfile(fullText);
  const yearsExperience = extractExperienceYears(fullText);
  const educationLevel = extractEducationLevel(fullText);
  const headline = extractHeadline(fullText);
  const summary = extractSummary(fullText);
  const language = extractLanguage(fullText);
  const languageLevel = extractLanguageLevel(fullText);
  const technicalSkills = extractTechnicalSkills(fullText);

  const data: CvExtractedData = {
    firstName,
    lastName,
    email,
    phone,
    countryCode,
    identityDocument: "",
    latestPosition,
    yearsExperience,
    educationLevel,
    headline,
    summary,
    language,
    languageLevel,
    technicalSkills,
  };

  const suggested = Object.entries(data)
    .filter(([, value]) => typeof value === "string" && value.trim().length > 0)
    .map(([key]) => key);

  return { data, suggested };
}

export {
  extractEmail,
  extractPhone,
  extractCountryPhone,
  extractExperienceYears,
  extractEducationLevel,
  extractLanguage,
  extractLanguageLevel,
  extractProfessionalProfile,
  extractHeadline,
  extractSummary,
  extractTechnicalSkills,
  guessNameFromText,
};
