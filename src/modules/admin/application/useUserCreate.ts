/**
 * Hook para crear un usuario desde el panel admin
 * SRP: Solo maneja la lógica de creación de un usuario
 */

import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { CreateUserPayload } from "../domain/models/User";
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
  role: string;
}

const initialForm: UserCreateFormData = {
  firstName: "",
  lastName: "",
  email: "",
  countryCode: "+56",
  phone: "",
  password: "",
  rePassword: "",
  role: "",
};

interface UseUserCreateReturn {
  form: UserCreateFormData;
  error: string;
  loading: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleCancel: () => void;
  setError: (error: string) => void;
  availableRoles: string[];
  loadingRoles: boolean;
  rolesError: string;
}

export function useUserCreate(
  repository: UserRepository = userRepository
): UseUserCreateReturn {
  const navigate = useNavigate();

  const [form, setForm] = useState<UserCreateFormData>(initialForm);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
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

      if (form.password.length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres.");
        return;
      }

      if (form.password !== form.rePassword) {
        setError("Las contraseñas no coinciden.");
        return;
      }

      if (!form.role) {
        setError("Selecciona un rol para el usuario.");
        return;
      }

      const payload: CreateUserPayload = {
        name: form.firstName,
        lastName: form.lastName,
        email: form.email,
        countryCode: form.countryCode,
        phone: form.phone,
        password: form.password,
        role: form.role,
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
