import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { UpdateUserPayload } from "../domain/models/User";
import type { Role } from "../domain/models/Role";
import { userRepository } from "../infrastructure/UserApiRepository";
import type { UserRepository } from "../domain/ports/UserRepository";
import { COUNTRY_CODES } from "../../../shared/constants/forms";

export interface UserEditFormData {
  name: string;
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
  active: boolean;
  password: string;
  rePassword: string;
  roleId: number;
}

export type UserEditFieldErrors = Partial<Record<keyof UserEditFormData, string>>;

interface UseUserEditReturn {
  form: UserEditFormData;
  error: string;
  fieldErrors: UserEditFieldErrors;
  loading: boolean;
  saving: boolean;
  notFound: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleCancel: () => void;
  availableRoles: Role[];
  loadingRoles: boolean;
  rolesError: string;
}

export function useUserEdit(
  repository: UserRepository = userRepository
): UseUserEditReturn {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<UserEditFormData>({
    name: "",
    lastName: "",
    email: "",
    countryCode: COUNTRY_CODES[0],
    phone: "",
    active: true,
    password: "",
    rePassword: "",
    roleId: 0,
  });
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<UserEditFieldErrors>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);
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

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    repository
      .getById(Number(id))
      .then((user) => {
        if (cancelled) return;
        setForm({
          name: user.name ?? "",
          lastName: user.lastName ?? "",
          email: user.email ?? "",
          countryCode: user.countryCode ?? COUNTRY_CODES[0],
          phone: user.phone ?? "",
          active: user.active,
          password: "",
          rePassword: "",
          roleId: user.roles.length > 0 ? Number(user.roles[0]) : 0,
        });
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.message === "Usuario no encontrado") {
          setNotFound(true);
        } else {
          setError(err instanceof Error ? err.message : "Error al cargar usuario");
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, repository]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const target = e.target;
      const { name } = target;
      const numericFields: Array<keyof UserEditFormData> = ["roleId"];
      if ("checked" in target) {
        setForm((prev) => ({ ...prev, [name]: target.checked }));
      } else {
        setForm((prev) => ({
          ...prev,
          [name]: numericFields.includes(name as keyof UserEditFormData)
            ? Number(target.value)
            : target.value,
        }));
      }
      setFieldErrors((prev) => {
        if (!(name in prev)) return prev;
        const next = { ...prev };
        delete next[name as keyof UserEditFieldErrors];
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
      if (!id) return;

      setError("");

      const errors: UserEditFieldErrors = {};

      if (!form.name.trim()) {
        errors.name = "El nombre es obligatorio.";
      }

      if (!form.lastName.trim()) {
        errors.lastName = "El apellido es obligatorio.";
      }

      if (!form.phone.trim()) {
        errors.phone = "El teléfono es obligatorio.";
      }

      if (form.password && form.password.length < 8) {
        errors.password = "La contraseña debe tener al menos 8 caracteres.";
      }

      if (form.password !== form.rePassword) {
        errors.rePassword = "Las contraseñas no coinciden.";
      }

      if (!form.roleId) {
        errors.roleId = "Selecciona un rol para el usuario.";
      }

      setFieldErrors(errors);
      if (Object.keys(errors).length > 0) return;

      const payload: UpdateUserPayload = {
        name: form.name.trim(),
        lastName: form.lastName.trim(),
        countryCode: form.countryCode,
        phone: form.phone.trim(),
        active: form.active,
        roleId: form.roleId,
      };

      if (form.password) {
        payload.password = form.password;
      }

      setSaving(true);
      try {
        await repository.update(Number(id), payload);
        navigate("/admin/users");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No pudimos actualizar el usuario. Intenta de nuevo."
        );
      } finally {
        setSaving(false);
      }
    },
    [id, form, repository, navigate]
  );

  return {
    form,
    error,
    fieldErrors,
    loading,
    saving,
    notFound,
    handleChange,
    handleSubmit,
    handleCancel,
    availableRoles,
    loadingRoles,
    rolesError,
  };
}
