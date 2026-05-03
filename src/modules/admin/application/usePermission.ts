/**
 * Hook para permiso - Application Layer
 * SRP: Este hook SOLO maneja la lógica de permisos
 */

import { useState, useCallback, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { PermissionFormData, ModuleOption } from "../../../shared/types/forms";
import { MODULE_OPTIONS, STATUS_OPTIONS } from "../../../shared/constants/forms";

interface UsePermissionReturn {
  form: PermissionFormData;
  availableModules: readonly ModuleOption[];
  error: string;
  loading: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleCancel: () => void;
}

const initialForm: PermissionFormData = {
  code: "",
  description: "",
  moduleId: "",
  status: "active",
};

export function usePermission(): UsePermissionReturn {
  const navigate = useNavigate();

  const [form, setForm] = useState<PermissionFormData>(initialForm);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const availableModules = MODULE_OPTIONS;

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

      // Validar formato: modulo.accion
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

      if (!form.status) {
        setError("Selecciona el estado del permiso.");
        return;
      }

      setLoading(true);
      try {
        // TODO: conectar con backend cuando esté disponible
        await new Promise((r) => setTimeout(r, 500));
        console.log("Crear permiso:", form);
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
    [form, navigate]
  );

  return {
    form,
    availableModules,
    error,
    loading,
    handleChange,
    handleSubmit,
    handleCancel,
  };
}
