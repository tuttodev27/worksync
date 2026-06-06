import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { UpdateUserPayload } from "../domain/models/User";
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
}

interface UseUserEditReturn {
  form: UserEditFormData;
  error: string;
  loading: boolean;
  saving: boolean;
  notFound: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleCancel: () => void;
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
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);

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
      if ("checked" in target) {
        setForm((prev) => ({ ...prev, [name]: target.checked }));
      } else {
        setForm((prev) => ({ ...prev, [name]: target.value }));
      }
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

      if (!form.name.trim()) {
        setError("El nombre es obligatorio.");
        return;
      }

      if (!form.lastName.trim()) {
        setError("El apellido es obligatorio.");
        return;
      }

      if (!form.phone.trim()) {
        setError("El teléfono es obligatorio.");
        return;
      }

      const payload: UpdateUserPayload = {
        name: form.name.trim(),
        lastName: form.lastName.trim(),
        countryCode: form.countryCode,
        phone: form.phone.trim(),
        active: form.active,
      };

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
    loading,
    saving,
    notFound,
    handleChange,
    handleSubmit,
    handleCancel,
  };
}
