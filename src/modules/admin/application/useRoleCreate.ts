import { useState, useCallback, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { RoleFormData } from "../../../shared/types/forms";
import type { RoleRepository } from "../domain/ports/RoleRepository";
import { roleRepository } from "../infrastructure/RoleApiRepository";

interface UseRoleCreateReturn {
  form: RoleFormData;
  error: string;
  loading: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleCancel: () => void;
}

export function useRoleCreate(
  repository: RoleRepository = roleRepository
): UseRoleCreateReturn {
  const navigate = useNavigate();

  const [form, setForm] = useState<RoleFormData>({
    name: "",
    description: "",
    active: "",
  });

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
        await repository.create({
          name: form.name.trim(),
          description: form.description.trim(),
          active: form.active === "true",
        });

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
