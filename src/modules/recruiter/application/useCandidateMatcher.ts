/**
 * Hook para matchear candidatos contra skills requeridos.
 * SRP: Solo computa matches. No persiste, no navega.
 */

import { useMemo } from "react";
import type { Candidate, MatchResult } from "../../../shared/types/forms";

function normalize(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[,;|/]+|\n+/g)
    .map((t) => t.trim())
    .filter(Boolean);
}

function tokensMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  return a.includes(b) || b.includes(a);
}

export function matchCandidate(
  candidate: Candidate,
  required: string,
): MatchResult {
  const requiredTokens = normalize(required);

  if (requiredTokens.length === 0) {
    return { candidate, score: 0, matchedSkills: [], missingSkills: [] };
  }

  const candidateTokens = normalize(
    `${candidate.technicalSkills} ${candidate.yearsExperience}`,
  );

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const token of requiredTokens) {
    const hit = candidateTokens.some((c) => tokensMatch(c, token));
    if (hit) matchedSkills.push(token);
    else missingSkills.push(token);
  }

  const score = matchedSkills.length / requiredTokens.length;
  return { candidate, score, matchedSkills, missingSkills };
}

export interface UseCandidateMatcherOptions {
  excludeIds?: string[];
  minScore?: number;
}

export interface UseCandidateMatcherReturn {
  matches: MatchResult[];
  hasInput: boolean;
}

export function useCandidateMatcher(
  candidates: Candidate[],
  requiredSkills: string,
  options: UseCandidateMatcherOptions = {},
): UseCandidateMatcherReturn {
  const { excludeIds = [], minScore = 0 } = options;

  return useMemo(() => {
    const normalized = requiredSkills.trim();
    if (!normalized) {
      return { matches: [], hasInput: false };
    }

    const excluded = new Set(excludeIds);
    const results: MatchResult[] = [];

    for (const c of candidates) {
      if (excluded.has(c.id)) continue;
      const m = matchCandidate(c, normalized);
      if (m.score > minScore) results.push(m);
    }

    results.sort((a, b) => b.score - a.score);

    return { matches: results, hasInput: true };
  }, [candidates, requiredSkills, excludeIds, minScore]);
}
