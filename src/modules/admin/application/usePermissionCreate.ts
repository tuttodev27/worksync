import { useState, useCallback, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { PermissionFormData } from "../../../shared/types/forms";
import type { PermissionRepository } from "../domain/ports/PermissionRepository";
import { permissionRepository } from "../infrastructure/PermissionApiRepository";

interface UsePermissionCreateReturn {
  form: PermissionFormData;
  error: string;
  loading: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleCancel: () => void;
}

const initialForm: PermissionFormData = {
  code: "",
  description: "",
  moduleId: "",
  status: "",
};

export function usePermissionCreate(
  repository: PermissionRepository = permissionRepository
): UsePermissionCreateReturn {
  const navigate = useNavigate();

  const [form, setForm] = useState<PermissionFormData>(initialForm);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleCancel = useCallback(() => {
    navigate("/admin/permissions");
  }, [navigate]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");

      if (!form.code.trim()) {
        setError("El código del permiso es obligatorio.");
        return;
      }

      if (!/^[a-z0-9]+(\.[a-z0-9]+)+$/i.test(form.code.trim())) {
        setError(
          "El código debe tener formato tipo 'modulo.accion' (ej: users.create)."
        );
        return;
      }

      if (!form.moduleId) {
        setError("Selecciona el módulo al que pertenece el permiso.");
        return;
      }

      if (form.status === "") {
        setError("Selecciona el estado del permiso.");
        return;
      }

      setLoading(true);
      try {
        await repository.create({
          code: form.code.trim(),
          description: form.description.trim(),
          moduleId: form.moduleId,
          active: form.status === "true",
        });

        navigate("/admin/permissions");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No pudimos crear el permiso. Intenta de nuevo."
        );
      } finally {
        setLoading(false);
      }
    },
    [form, navigate, repository]
  );

  return {
    form,
    error,
    loading,
    handleChange,
    handleSubmit,
    handleCancel,
  };
}
