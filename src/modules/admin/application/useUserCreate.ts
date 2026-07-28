/**
 * Hook para crear un usuario desde el panel admin
 * SRP: Solo maneja la lógica de creación de un usuario
 */

import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { CreateUserPayload } from "../domain/models/User";
import type { Role } from "../domain/models/Role";
import { userRepository } from "../infrastructure/UserApiRepository";
import type { UserRepository } from "../domain/ports/UserRepository";

export interface UserCreateFormData {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
  password: string;
  rePassword: string;
  roleId: number;
}

export type UserCreateFieldErrors = Partial<Record<keyof UserCreateFormData, string>>;

const initialForm: UserCreateFormData = {
  firstName: "",
  lastName: "",
  email: "",
  countryCode: "+56",
  phone: "",
  password: "",
  rePassword: "",
  roleId: 0,
};

interface UseUserCreateReturn {
  form: UserCreateFormData;
  error: string;
  fieldErrors: UserCreateFieldErrors;
  loading: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleCancel: () => void;
  setError: (error: string) => void;
  availableRoles: Role[];
  loadingRoles: boolean;
  rolesError: string;
}

function validateCreateForm(form: UserCreateFormData): UserCreateFieldErrors {
  const errors: UserCreateFieldErrors = {};

  if (!form.firstName.trim()) {
    errors.firstName = "El nombre es obligatorio.";
  }

  if (!form.lastName.trim()) {
    errors.lastName = "El apellido es obligatorio.";
  }

  if (!form.email.trim()) {
    errors.email = "El email es obligatorio.";
  }

  if (!form.phone.trim()) {
    errors.phone = "El teléfono es obligatorio.";
  }

  if (!form.password) {
    errors.password = "La contraseña es obligatoria.";
  } else if (form.password.length < 8) {
    errors.password = "La contraseña debe tener al menos 8 caracteres.";
  }

  if (form.password !== form.rePassword) {
    errors.rePassword = "Las contraseñas no coinciden.";
  }

  if (!form.roleId) {
    errors.roleId = "Selecciona un rol para el usuario.";
  }

  return errors;
}

export function useUserCreate(
  repository: UserRepository = userRepository
): UseUserCreateReturn {
  const navigate = useNavigate();

  const [form, setForm] = useState<UserCreateFormData>(initialForm);
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<UserCreateFieldErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState<boolean>(true);
  const [rolesError, setRolesError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    repository
      .listAvailableRoles()
      .then((roles) => {
        if (cancelled) return;
        setAvailableRoles(roles);
        setLoadingRoles(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setRolesError(err instanceof Error ? err.message : "Error al cargar roles");
        setLoadingRoles(false);
      });
    return () => {
      cancelled = true;
    };
  }, [repository]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      const numericFields: Array<keyof UserCreateFormData> = ["roleId"];
      setForm((prev) => ({
        ...prev,
        [name]: numericFields.includes(name as keyof UserCreateFormData)
          ? Number(value)
          : value,
      }));
      setFieldErrors((prev) => {
        if (!(name in prev)) return prev;
        const next = { ...prev };
        delete next[name as keyof UserCreateFieldErrors];
        return next;
      });
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

      const errors = validateCreateForm(form);
      setFieldErrors(errors);

      if (Object.keys(errors).length > 0) return;

      const payload: CreateUserPayload = {
        name: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        countryCode: form.countryCode,
        phone: form.phone.trim(),
        password: form.password,
        roleId: form.roleId,
      };

      setLoading(true);
      try {
        await repository.create(payload);
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
    [form, repository, navigate]
  );

  return {
    form,
    error,
    fieldErrors,
    loading,
    handleChange,
    handleSubmit,
    handleCancel,
    setError,
    availableRoles,
    loadingRoles,
    rolesError,
  };
}
