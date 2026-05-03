/**
 * Hook para login - Application Layer
 * SRP: Este hook SOLO maneja la lógica de login
 * No sabe cómo se hace el login (eso está en infrastructure)
 * Solo orchestra el proceso
 */

import { useState, useCallback, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthRepository } from "../domain/ports/AuthRepository";
import type { LoginFormData, AuthResult } from "../../../shared/types/forms";
import { authRepository } from "../infrastructure/AuthApiRepository";

interface UseLoginState {
  form: LoginFormData;
  error: string;
  loading: boolean;
}

interface UseLoginReturn extends UseLoginState {
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const result: AuthResult = await repository.login(form);
        
        // Guardar en localStorage de forma segura
        localStorage.setItem("authUser", JSON.stringify(result.user));
        localStorage.setItem("token", result.token);
        
        navigate("/admin");
      } catch (err) {
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
