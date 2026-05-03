/**
 * Hook para registro de usuario - Application Layer
 * SRP: Este hook SOLO maneja la lógica de registro
 */

import { useState, useCallback, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { RegisterFormData } from "../../../shared/types/forms";
import { authRepository } from "../infrastructure/AuthApiRepository";

interface UseRegisterReturn {
  form: RegisterFormData;
  error: string;
  loading: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleCancel: () => void;
  setError: (error: string) => void;
}

const initialForm: RegisterFormData = {
  firstName: "",
  lastName: "",
  email: "",
  countryCode: "+56",
  phone: "",
  password: "",
  rePassword: "",
  userType: "",
};

export function useRegister(): UseRegisterReturn {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterFormData>(initialForm);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleCancel = useCallback(() => {
    navigate("/admin/users");
  }, [navigate]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");

      // Validaciones
      if (form.password.length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres.");
        return;
      }

      if (form.password !== form.rePassword) {
        setError("Las contraseñas no coinciden.");
        return;
      }

      if (!form.userType) {
        setError("Selecciona un tipo de usuario.");
        return;
      }

      setLoading(true);
      try {
        await authRepository.register(form);
        console.log("Usuario creado:", form);
        navigate("/admin/users");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No pudimos crear el usuario. Intenta de nuevo."
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
    handleChange,
    handleSubmit,
    handleCancel,
    setError,
  };
}
