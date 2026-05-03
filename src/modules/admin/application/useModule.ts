/**
 * Hook para módulo - Application Layer
 * SRP: Este hook SOLO maneja la lógica de módulos
 */

import { useState, useCallback, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { ModuloFormData } from "../../../shared/types/forms";
import { STATUS_OPTIONS } from "../../../shared/constants/forms";

interface UseModuleReturn {
  form: ModuloFormData;
  statusOptions: readonly { value: string; label: string }[];
  error: string;
  loading: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleCancel: () => void;
}

const initialForm: ModuloFormData = {
  name: "",
  description: "",
  status: "active",
};

export function useModule(onSuccess?: () => void): UseModuleReturn {
  const navigate = useNavigate();

  const [form, setForm] = useState<ModuloFormData>(initialForm);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const statusOptions = STATUS_OPTIONS;

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleCancel = useCallback(() => {
    navigate("/admin/modules");
  }, [navigate]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");

      if (!form.name.trim()) {
        setError("El nombre del módulo es obligatorio.");
        return;
      }
      if (!form.status) {
        setError("Debes seleccionar un estado.");
        return;
      }

      setLoading(true);
      try {
        // TODO: conectar con backend Spring Boot cuando esté disponible
        await new Promise((r) => setTimeout(r, 700));
        console.log("Módulo creado:", form);
        
        if (onSuccess) {
          onSuccess();
        } else {
          navigate("/admin/modules");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No pudimos crear el módulo. Intenta de nuevo."
        );
      } finally {
        setLoading(false);
      }
    },
    [form, navigate, onSuccess]
  );

  return {
    form,
    statusOptions,
    error,
    loading,
    handleChange,
    handleSubmit,
    handleCancel,
  };
}
