/**
 * Hook para crear/editar solicitud - Application Layer
 * SRP: Maneja el formulario de solicitud y la gestion de candidatos asignados.
 */

import { useState, useCallback, useEffect, useMemo, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type {
  Solicitud,
  SolicitudFormData,
  Candidate,
  SolicitudStatus,
} from "../../../shared/types/forms";
import { solicitudRepository } from "../infrastructure/SolicitudApiRepository";

export interface UseSolicitudOptions {
  solicitudId?: string;
  candidates: Candidate[];
}

export interface UseSolicitudReturn {
  form: SolicitudFormData;
  error: string;
  loading: boolean;
  isEdit: boolean;
  isLocked: boolean;
  assignedCandidateIds: string[];
  assignedCandidates: Candidate[];
  setFormData: (values: Partial<SolicitudFormData>) => void;
  setErrorMessage: (message: string) => void;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleCancel: () => void;
  assignCandidate: (id: string) => void;
  unassignCandidate: (id: string) => void;
}

const emptyForm: SolicitudFormData = {
  title: "",
  description: "",
  requiredTechnicalSkills: "",
  requiredExperience: "",
  status: "ABIERTA",
};

export function useSolicitud(
  options: UseSolicitudOptions = { candidates: [] },
): UseSolicitudReturn {
  const { solicitudId, candidates } = options;
  const navigate = useNavigate();

  const isEdit = Boolean(solicitudId);

  const [form, setForm] = useState<SolicitudFormData>(emptyForm);
  const [assignedIds, setAssignedIds] = useState<string[]>([]);
  const [initialAssignedCount, setInitialAssignedCount] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!solicitudId) return;
    setLoading(true);
    solicitudRepository.getById(Number(solicitudId)).then((found) => {
      setForm({
        title: found.title,
        description: found.description,
        requiredTechnicalSkills: found.requiredTechnicalSkills,
        requiredExperience: found.requiredExperience,
        status: found.status as SolicitudStatus,
      });
      const ids = found.assignedCandidateIds.map(String);
      setAssignedIds(ids);
      setInitialAssignedCount(ids.length);
    }).catch(() => {
      setError("No se encontro la solicitud.");
    }).finally(() => {
      setLoading(false);
    });
  }, [solicitudId]);

  const isLocked = initialAssignedCount > 0;

  const assignedCandidates = useMemo<Candidate[]>(() => {
    const map = new Map(candidates.map((c) => [c.id, c]));
    return assignedIds
      .map((id) => map.get(id))
      .filter((c): c is Candidate => Boolean(c));
  }, [assignedIds, candidates]);

  const handleChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const setFormData = useCallback((values: Partial<SolicitudFormData>) => {
    setForm((prev) => ({ ...prev, ...values }));
  }, []);

  const setErrorMessage = useCallback((message: string) => {
    setError(message);
  }, []);

  const handleCancel = useCallback(() => {
    navigate("/recruiter/solicitudes");
  }, [navigate]);

  const assignCandidate = useCallback((id: string) => {
    setAssignedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const unassignCandidate = useCallback((id: string) => {
    setAssignedIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");

      if (!form.title.trim()) {
        setError("El titulo de la solicitud es obligatorio.");
        return;
      }
      if (!form.requiredTechnicalSkills.trim()) {
        setError("Indica al menos una habilidad tecnica requerida.");
        return;
      }
      const validStatuses: SolicitudStatus[] = [
        "ABIERTA",
        "EN_PROCESO",
        "CERRADA",
        "CANCELADA",
      ];
      if (!validStatuses.includes(form.status)) {
        setError("Estado invalido.");
        return;
      }

      setLoading(true);
      try {
        const nextStatus: SolicitudStatus =
          isEdit && isLocked
            ? form.status
            : assignedIds.length > 0 && form.status === "ABIERTA"
              ? "EN_PROCESO"
              : form.status;

        const payload = {
          title: form.title.trim(),
          description: form.description.trim(),
          requiredTechnicalSkills: form.requiredTechnicalSkills.trim(),
          requiredExperience: form.requiredExperience.trim(),
          status: nextStatus,
          assignedCandidateIds: assignedIds.map(Number),
        };

        if (solicitudId) {
          await solicitudRepository.update(Number(solicitudId), payload);
        } else {
          await solicitudRepository.create(payload);
        }

        navigate("/recruiter/solicitudes");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No pudimos guardar la solicitud. Intenta de nuevo.",
        );
      } finally {
        setLoading(false);
      }
    },
    [form, assignedIds, solicitudId, isEdit, isLocked, navigate],
  );

  return {
    form,
    error,
    loading,
    isEdit,
    isLocked,
    assignedCandidateIds: assignedIds,
    assignedCandidates,
    setFormData,
    setErrorMessage,
    handleChange,
    handleSubmit,
    handleCancel,
    assignCandidate,
    unassignCandidate,
  };
}
