import { useState, useCallback, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { ModuloFormData } from "../../../shared/types/forms";
import { STATUS_OPTIONS } from "../../../shared/constants/forms";
import type { ModuleRepository } from "../domain/ports/ModuleRepository";
import { moduleRepository } from "../infrastructure/ModuleApiRepository";

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

export function useModule(
  repository: ModuleRepository = moduleRepository
): UseModuleReturn {
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
        await repository.create({
          name: form.name.trim(),
          description: form.description.trim(),
          active: form.status === "active",
        });

        navigate("/admin/modules");
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
    [form, navigate, repository]
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
