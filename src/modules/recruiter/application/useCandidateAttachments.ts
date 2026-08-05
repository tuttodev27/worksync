/**
 * useCandidateAttachments - carga la lista de archivos adjuntos de un postulante desde la API.
 */

import { useEffect, useState, useCallback } from "react";
import { candidateRepository } from "../infrastructure/CandidateApiRepository";
import type { AttachmentResponse } from "../domain/types";

export interface UseCandidateAttachmentsReturn {
  attachments: AttachmentResponse[];
  isLoading: boolean;
  error: string;
  refresh: () => void;
  addAttachment: (attachment: AttachmentResponse) => void;
  clearError: () => void;
}

export function useCandidateAttachments(
  candidateId?: number,
): UseCandidateAttachmentsReturn {
  const [attachments, setAttachments] = useState<AttachmentResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const load = useCallback(async () => {
    if (!candidateId) return;
    setIsLoading(true);
    setError("");
    try {
      const data = await candidateRepository.listAttachments(candidateId);
      setAttachments(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los archivos adjuntos.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    void load();
  }, [load]);

  const addAttachment = useCallback((attachment: AttachmentResponse) => {
    setAttachments((prev) => [...prev, attachment]);
  }, []);

  const clearError = useCallback(() => setError(""), []);

  return { attachments, isLoading, error, refresh: load, addAttachment, clearError };
}
