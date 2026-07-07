import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "../../../shared/hooks/useForm";
import type { RoleFormData } from "../../../shared/types/forms";
import type { RoleRepository } from "../domain/ports/RoleRepository";
import { roleRepository } from "../infrastructure/RoleApiRepository";

interface UseRoleCreateReturn {
  form: RoleFormData;
  submissionError: string;
  loading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleCancel: () => void;
}

const initialForm: RoleFormData = {
  name: "",
  description: "",
  active: "",
};

export function useRoleCreate(
  repository: RoleRepository = roleRepository
): UseRoleCreateReturn {
  const navigate = useNavigate();

  const { form, submissionError, loading, handleChange, handleSubmit } =
    useForm<RoleFormData>({
      initialValues: initialForm,
      validationRules: [
        {
          field: "name",
          validate: (value) =>
            typeof value === "string" && value.trim().length > 0,
          message: "El nombre del rol es obligatorio.",
        },
        {
          field: "active",
          validate: (value) => value !== "",
          message: "Debes seleccionar un estado.",
        },
      ],
      onSubmit: async (values) => {
        await repository.create({
          name: values.name.trim(),
          description: values.description.trim(),
          active: values.active === "true",
        });
        navigate("/admin/roles");
      },
    });

  const handleCancel = useCallback(() => {
    navigate("/admin/roles");
  }, [navigate]);

  return {
    form,
    submissionError,
    loading,
    handleChange,
    handleSubmit,
    handleCancel,
  };
}
