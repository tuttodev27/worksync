/**
 * Hook para login - Application Layer
 * SRP: Este hook SOLO maneja la lógica de login
 * No sabe cómo se hace el login (eso está en infrastructure)
 * Solo orquesta el proceso
 */

import { useState, useCallback } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthRepository, AuthResult } from "../domain/ports/AuthRepository";
import type { LoginFormData } from "../../../shared/types/forms";
import { authRepository } from "../infrastructure/AuthApiRepository";
import { saveAuthUser } from "../../../shared/services/authStorage";
import { logger } from "../../../shared/utils/logger";

interface UseLoginState {
  form: LoginFormData;
  error: string;
  loading: boolean;
}

interface UseLoginReturn extends UseLoginState {
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  setForm: React.Dispatch<React.SetStateAction<LoginFormData>>;
}

/**
 * Hook para manejar el formulario de login
 * @param repository - Repositorio de auth (inyectable para testing)
 */
export function useLogin(
  repository: AuthRepository = authRepository
): UseLoginReturn {
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const result: AuthResult = await repository.login(form);
        logger.debug("Login result →", result);
        saveAuthUser(result.user);
        const target = result.user.role === "ADMIN" ? "/admin" : "/recruiter";
        logger.debug("navegando a →", target);
        navigate(target);
      } catch (err) {
        logger.error("Error en login →", err);
        setError(err instanceof Error ? err.message : "Error al iniciar sesión");
      } finally {
        setLoading(false);
      }
    },
    [form, repository, navigate]
  );

  return {
    form,
    error,
    loading,
    handleChange,
    handleSubmit,
    setForm,
  };
}
