/**
 * Hook para crear rol - Application Layer
 * SRP: Este hook SOLO maneja la lógica de crear roles
 */

import { useState, useCallback, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { RoleFormData } from "../../../shared/types/forms";
import { API_USERS_URL } from "../../../shared/constants/forms";

interface UseRoleCreateReturn {
  form: RoleFormData;
  error: string;
  loading: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleCancel: () => void;
}

export function useRoleCreate(): UseRoleCreateReturn {
  const navigate = useNavigate();

  const [form, setForm] = useState<RoleFormData>({
    name: "",
    description: "",
    active: "",
  });

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
    navigate("/admin/roles");
  }, [navigate]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");

      if (!form.name.trim()) {
        setError("El nombre del rol es obligatorio.");
        return;
      }
      if (form.active === "") {
        setError("Debes seleccionar un estado.");
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_USERS_URL}/roles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim(),
            active: form.active === "true",
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.message ?? "No pudimos crear el rol.");
        }

        navigate("/admin/roles");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No pudimos crear el rol. Intenta de nuevo."
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
  };
}
