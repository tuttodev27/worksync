import { describe, it, expect } from "vitest";
import {
  parseCvText,
  extractHeadline,
  extractSummary,
  extractExperienceYears,
  extractEducationLevel,
  extractLanguageLevel,
  extractTechnicalSkills,
} from "../cvParser";

const sampleCv = `Juan Carlos Perez
Backend Engineer | Java

juan.perez@example.com
+56 9 1234 5678

PERFIL PROFESIONAL
Ingeniero en informatica con 8 años de experiencia desarrollando
APIs REST y microservicios con Spring Boot y AWS. Especialista en
bases de datos relacionales y soluciones cloud escalables.

EXPERIENCIA LABORAL
Senior Backend Developer - Banco Central (2021 - 2025)
Desarrollo de servicios de pago de alta disponibilidad.

EDUCACION
Ingenieria Civil en Computacion - Universidad de Chile

HABILIDADES
Java, TypeScript, Spring Boot, AWS, PostgreSQL, Docker

IDIOMAS
Ingles B2
`;

describe("cvParser", () => {
  describe("parseCvText", () => {
    it("extracts personal and professional data from a CV", () => {
      const { data } = parseCvText(sampleCv, "juan-perez.pdf");

      expect(data.firstName).toBe("Juan");
      expect(data.lastName).toBe("Carlos Perez");
      expect(data.email).toBe("juan.perez@example.com");
      expect(data.countryCode).toBe("+56");
      expect(data.headline).toBe("Backend Engineer");
      expect(data.summary).toContain("8 años de experiencia");
      expect(data.latestPosition).toBe("Backend Engineer");
      expect(data.yearsExperience).toBe("6-10 anos");
      expect(data.educationLevel).toBe("Universitario");
      expect(data.language).toBe("Ingles");
      expect(data.languageLevel).toBe("B2");
      expect(data.technicalSkills).toContain("Java");
      expect(data.technicalSkills).toContain("Spring Boot");
    });

    it("marks only non-empty fields as suggested", () => {
      const { suggested } = parseCvText(
        "Maria Lopez\nmaria@example.com\nPERFIL PROFESIONAL\nAnalista funcional con experiencia",
        "maria.pdf",
      );

      expect(suggested).toContain("firstName");
      expect(suggested).toContain("email");
      expect(suggested).toContain("headline");
      expect(suggested).toContain("summary");
      expect(suggested).not.toContain("identityDocument");
      expect(suggested).not.toContain("language");
    });

    it("falls back to the file name when no name-like line is found", () => {
      const { data } = parseCvText(
        "juan.perez@example.com\n+56 9 1234 5678\nlinkedin.com/in/juan-perez",
        "juan_perez.pdf",
      );

      expect(data.firstName).toBe("juan");
      expect(data.lastName).toBe("perez");
    });
  });

  describe("extractHeadline", () => {
    it("returns the professional title line", () => {
      const headline = extractHeadline(
        "Ana Torres\nDesarrolladora Full Stack React\nana@mail.com\n+56 9 5555 6666",
      );
      expect(headline).toBe("Desarrolladora Full Stack React");
    });

    it("returns an empty string when there is no role keyword", () => {
      expect(
        extractHeadline("Ana Torres\nana@mail.com\n+56 9 5555 6666"),
      ).toBe("");
    });
  });

  describe("extractSummary", () => {
    it("captures the paragraph after the profile heading", () => {
      const summary = extractSummary(
        "EXPERIENCIA LABORAL\n\nPERFIL PROFESIONAL\nIngeniero con 5 años de experiencia\nen desarrollo de software.\n\nHABILIDADES\nJava",
      );
      expect(summary).toContain("5 años de experiencia");
      expect(summary).toContain("desarrollo de software");
      expect(summary).not.toContain("HABILIDADES");
    });

    it("returns an empty string when there is no profile heading", () => {
      expect(extractSummary("EXPERIENCIA LABORAL\nSolo experiencia")).toBe("");
    });
  });

  describe("extractExperienceYears", () => {
    it("maps explicit years to catalog labels", () => {
      expect(extractExperienceYears("8 años de experiencia")).toBe("6-10 anos");
      expect(extractExperienceYears("2 años")).toBe("1-2 anos");
      expect(extractExperienceYears("10+ años")).toBe("10+ anos");
      expect(extractExperienceYears("6 meses")).toBe("0-1 anos");
      expect(extractExperienceYears("sin experiencia")).toBe("Sin experiencia");
    });
  });

  describe("extractEducationLevel", () => {
    it("maps education mentions to catalog names", () => {
      expect(extractEducationLevel("Ingenieria Civil")).toBe("Universitario");
      expect(extractEducationLevel("Magister en Gestion")).toBe("Magister");
      expect(extractEducationLevel("Tecnico en Electronica")).toBe("Tecnico");
      expect(extractEducationLevel("Doctorado en Fisica")).toBe("Doctorado");
      expect(extractEducationLevel("Educacion media completa")).toBe(
        "Educacion media",
      );
    });
  });

  describe("extractLanguageLevel", () => {
    it("normalizes explicit CEFR codes", () => {
      expect(extractLanguageLevel("Ingles nivel b2")).toBe("B2");
      expect(extractLanguageLevel("Avanzado")).toBe("C1");
      expect(extractLanguageLevel("Basico")).toBe("A2");
    });
  });

  describe("extractTechnicalSkills", () => {
    it("dedupes skill mentions", () => {
      expect(
        extractTechnicalSkills("Java, Java, TypeScript y SQL, Java"),
      ).toBe("Java, TypeScript, SQL");
    });
  });
});
