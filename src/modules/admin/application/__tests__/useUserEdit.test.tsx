// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useUserEdit } from "../useUserEdit";
import type { UserRepository } from "../../domain/ports/UserRepository";

const mockGetById = vi.fn();
const mockUpdate = vi.fn();
const mockListRoles = vi.fn();

const mockRepository: UserRepository = {
  list: vi.fn(),
  getById: mockGetById,
  create: vi.fn(),
  update: mockUpdate,
  deactivate: vi.fn(),
  listAvailableRoles: mockListRoles,
};

const mockRoles = [
  { id: 1, name: "ADMIN", description: "Administrador", active: true },
  { id: 2, name: "RECRUITER", description: "Reclutador", active: true },
];

const existingUser = {
  id: 5,
  name: "Juan",
  lastName: "Pérez",
  email: "juan@test.com",
  countryCode: "+56",
  phone: "999999999",
  active: true,
  createdAt: "2025-01-01T00:00:00Z",
  roles: ["1"],
};

function wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter initialEntries={["/admin/users/5/edit"]}>
      <Routes>
        <Route path="/admin/users/:id/edit" element={children} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockListRoles.mockResolvedValue(mockRoles);
  mockGetById.mockResolvedValue(existingUser);
});

describe("useUserEdit", () => {
  it("loads user and roles on mount", async () => {
    const { result } = renderHook(() => useUserEdit(mockRepository), { wrapper });
    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.form.name).toBe("Juan");
    expect(result.current.form.roleId).toBe(1);
    expect(result.current.availableRoles).toEqual(mockRoles);
  });

  it("sets notFound when user is not found", async () => {
    mockGetById.mockRejectedValue(new Error("Usuario no encontrado"));
    const { result } = renderHook(() => useUserEdit(mockRepository), { wrapper });
    await vi.waitFor(() => {
      expect(result.current.notFound).toBe(true);
    });
  });

  it("initializes form with empty values before loading", () => {
    const { result } = renderHook(() => useUserEdit(mockRepository), { wrapper });
    expect(result.current.form.name).toBe("");
    expect(result.current.error).toBe("");
    expect(result.current.loading).toBe(true);
    expect(result.current.fieldErrors).toEqual({});
  });

  it("handleChange updates text fields", async () => {
    const { result } = renderHook(() => useUserEdit(mockRepository), { wrapper });
    await vi.waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      result.current.handleChange({
        target: { name: "name", value: "Carlos" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.form.name).toBe("Carlos");
  });

  it("handleChange updates checkbox fields", async () => {
    const { result } = renderHook(() => useUserEdit(mockRepository), { wrapper });
    await vi.waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      result.current.handleChange({
        target: { name: "active", checked: false },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.form.active).toBe(false);
  });

  it("handleChange converts roleId to number", async () => {
    const { result } = renderHook(() => useUserEdit(mockRepository), { wrapper });
    await vi.waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      result.current.handleChange({
        target: { name: "roleId", value: "2" },
      } as React.ChangeEvent<HTMLSelectElement>);
    });
    expect(result.current.form.roleId).toBe(2);
  });

  it("handleChange clears field error for edited field", async () => {
    const { result } = renderHook(() => useUserEdit(mockRepository), { wrapper });
    await vi.waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      result.current.handleChange({
        target: { name: "name", value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    expect(result.current.fieldErrors.name).toBe("El nombre es obligatorio.");
    act(() => {
      result.current.handleChange({
        target: { name: "name", value: "Carlos" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.fieldErrors.name).toBeUndefined();
  });

  it("handleSubmit validates required fields", async () => {
    const { result } = renderHook(() => useUserEdit(mockRepository), { wrapper });
    await vi.waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      result.current.handleChange({
        target: { name: "name", value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handleChange({
        target: { name: "lastName", value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handleChange({
        target: { name: "phone", value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handleChange({
        target: { name: "roleId", value: "0" },
      } as React.ChangeEvent<HTMLSelectElement>);
    });
    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    expect(result.current.fieldErrors.name).toBe("El nombre es obligatorio.");
    expect(result.current.fieldErrors.lastName).toBe("El apellido es obligatorio.");
    expect(result.current.fieldErrors.phone).toBe("El teléfono es obligatorio.");
    expect(result.current.fieldErrors.roleId).toBe("Selecciona un rol para el usuario.");
  });

  it("handleSubmit validates password length when provided", async () => {
    const { result } = renderHook(() => useUserEdit(mockRepository), { wrapper });
    await vi.waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      result.current.handleChange({
        target: { name: "password", value: "short" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    expect(result.current.fieldErrors.password).toBe(
      "La contraseña debe tener al menos 8 caracteres.",
    );
  });

  it("handleSubmit validates password mismatch", async () => {
    const { result } = renderHook(() => useUserEdit(mockRepository), { wrapper });
    await vi.waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      result.current.handleChange({
        target: { name: "password", value: "12345678" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handleChange({
        target: { name: "rePassword", value: "different" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    expect(result.current.fieldErrors.rePassword).toBe("Las contraseñas no coinciden.");
  });

  it("handleSubmit calls repository.update and navigates on success", async () => {
    mockUpdate.mockResolvedValue({ id: 5 });
    const { result } = renderHook(() => useUserEdit(mockRepository), { wrapper });
    await vi.waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    expect(mockUpdate).toHaveBeenCalledWith(5, {
      name: "Juan",
      lastName: "Pérez",
      countryCode: "+56",
      phone: "999999999",
      active: true,
      roleId: 1,
    });
  });

  it("handleSubmit includes password in update when provided", async () => {
    mockUpdate.mockResolvedValue({ id: 5 });
    const { result } = renderHook(() => useUserEdit(mockRepository), { wrapper });
    await vi.waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      result.current.handleChange({
        target: { name: "password", value: "newpass123" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handleChange({
        target: { name: "rePassword", value: "newpass123" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    expect(mockUpdate).toHaveBeenCalledWith(5, expect.objectContaining({
      password: "newpass123",
    }));
  });

  it("handleSubmit sets error when repository.update fails", async () => {
    mockUpdate.mockRejectedValue(new Error("Error del servidor"));
    const { result } = renderHook(() => useUserEdit(mockRepository), { wrapper });
    await vi.waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    expect(result.current.error).toBe("Error del servidor");
    expect(result.current.saving).toBe(false);
  });
});
