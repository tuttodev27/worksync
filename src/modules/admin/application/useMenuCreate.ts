/**
 * Hook para crear menú - Application Layer
 * SRP: Este hook SOLO maneja la lógica de crear menús
 */

import { useState, useCallback, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { MenuFormData } from "../../../shared/types/forms";

interface UseMenuCreateReturn {
  form: MenuFormData;
  error: string;
  loading: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleCancel: () => void;
}

export function useMenuCreate(): UseMenuCreateReturn {
  const navigate = useNavigate();

  const [form, setForm] = useState<MenuFormData>({
    title: "",
    path: "",
    active: "true",
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
    navigate("/admin/menu");
  }, [navigate]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");

      if (!form.title.trim()) {
        setError("El título es obligatorio.");
        return;
      }

      if (!form.path.trim()) {
        setError("La ruta es obligatoria.");
        return;
      }

      setLoading(true);
      try {
        //TODO: conectar con backend cuando esté disponible
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        console.log("Menú creado:", {
          title: form.title.trim(),
          path: form.path.trim(),
          active: form.active === "true",
        });

        navigate("/admin/menu");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No pudimos crear el menú. Intenta de nuevo."
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
