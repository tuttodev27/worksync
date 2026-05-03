/**
 * Hook para candidato - Application Layer
 * SRP: Este hook SOLO maneja la lógica de candidatos
 */

import { useState, useCallback, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { CandidatoFormData } from "../../../shared/types/forms";

export interface UseCandidateReturn {
  form: CandidatoFormData;
  error: string;
  loading: boolean;
  setFormData: (values: Partial<CandidatoFormData>) => void;
  setErrorMessage: (message: string) => void;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleCancel: () => void;
}

const initialForm: CandidatoFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  linkedin: "",
  experience: "",
  education: "",
  skills: "",
  status: "new",
  notes: "",
  technicalSkills: "",
  softSkills: "",
  language: "",
  languageLevel: "",
};

export function useCandidate(): UseCandidateReturn {
  const navigate = useNavigate();

  const [form, setForm] = useState<CandidatoFormData>(initialForm);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const setFormData = useCallback((values: Partial<CandidatoFormData>) => {
    setForm((prev) => ({ ...prev, ...values }));
  }, []);

  const setErrorMessage = useCallback((message: string) => {
    setError(message);
  }, []);

  const handleCancel = useCallback(() => {
    navigate("/recluiter/candidates");
  }, [navigate]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");

      if (!form.firstName.trim()) {
        setError("El nombre es obligatorio.");
        return;
      }
      if (!form.lastName.trim()) {
        setError("El apellido es obligatorio.");
        return;
      }
      if (!form.email.trim()) {
        setError("El email es obligatorio.");
        return;
      }

      setLoading(true);
      try {
        // TODO: conectar con backend cuando esté disponible
        await new Promise((r) => setTimeout(r, 800));
        console.log("Candidato creado:", form);
        navigate("/recluiter/candidates");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No pudimos crear el candidato. Intenta de nuevo."
        );
      } finally {
        setLoading(false);
      }
    },
    [form, navigate]
  );

  return {
    form,
    error,
    loading,
    setFormData,
    setErrorMessage,
    handleChange,
    handleSubmit,
    handleCancel,
  };
}
