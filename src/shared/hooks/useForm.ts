/**
 * Hook genérico para formularios con validación
 * DRY: Evita repetir lógica de validación en cada form
 */

import { useState, useCallback, type ChangeEvent, type FormEvent } from "react";

export interface ValidationRule<T> {
  field: keyof T;
  validate: (value: T[keyof T], form: T) => boolean;
  message: string;
}

export interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: ValidationRule<T>[];
  onSubmit: (values: T) => Promise<void>;
}

/**
 * Hook genérico para manejar formularios
 * @param options - Configuración del formulario
 * @returns form, errors, loading, handlers
 */
export function useForm<T>({ initialValues, validationRules = [], onSubmit }: UseFormOptions<T>) {
  const [form, setForm] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Set<keyof T>>(new Set());

  // Manejar cambio de input
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Validar un campo específico
  const validateField = useCallback((field: keyof T, value: T[keyof T]): string | undefined => {
    const rule = validationRules.find((r) => r.field === field);
    if (rule && !rule.validate(value, form)) {
      return rule.message;
    }
    return undefined;
  }, [validationRules, form]);

  // Validar toda la forma
  const validateAll = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const rule of validationRules) {
      const error = validateField(rule.field, form[rule.field]);
      if (error) {
        newErrors[rule.field] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [validationRules, form, validateField]);

  // Manejar blur (marcar campo como touched)
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched((prev) => new Set(prev).add(name as keyof T));
  }, []);

  // Submit
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      
      if (!validateAll()) {
        return;
      }

      setLoading(true);
      try {
        await onSubmit(form);
      } catch (err) {
        // Manejar error según necesidad
        console.error("Form error:", err);
      } finally {
        setLoading(false);
      }
    },
    [form, onSubmit, validateAll]
  );

  // Reset
  const resetForm = useCallback(() => {
    setForm(initialValues);
    setErrors({});
    setTouched(new Set());
  }, [initialValues]);

  return {
    form,
    errors,
    loading,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setForm,
    setErrors,
    validateField,
  };
}

/**
 * Validadores predefinidos
 */
export const validators = {
  required: (message = "Este campo es obligatorio") => ({
    validate: (value: unknown) => value !== "" && value !== null && value !== undefined,
    message,
  }),

  minLength: (min: number, message?: string) => ({
    validate: (value: unknown) => typeof value === "string" && value.length >= min,
    message: message || `Mínimo ${min} caracteres`,
  }),

  email: (message = "Email inválido") => ({
    validate: (value: unknown) => 
      typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  pattern: (regex: RegExp, message: string) => ({
    validate: (value: unknown) => regex.test(String(value)),
    message,
  }),

  match: (field: string, message: string) => ({
    validate: (value: unknown, form: Record<string, unknown>) => value === form[field],
    message,
  }),
};
