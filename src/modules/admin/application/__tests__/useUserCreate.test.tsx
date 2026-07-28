// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { useUserCreate } from "../useUserCreate";
import type { UserRepository } from "../../domain/ports/UserRepository";

const mockCreateUser = vi.fn();
const mockListRoles = vi.fn();

const mockRepository: UserRepository = {
  list: vi.fn(),
  getById: vi.fn(),
  create: mockCreateUser,
  update: vi.fn(),
  deactivate: vi.fn(),
  listAvailableRoles: mockListRoles,
};

const mockRoles = [
  { id: 1, name: "ADMIN", description: "Administrador", active: true },
  { id: 2, name: "RECRUITER", description: "Reclutador", active: true },
];

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockListRoles.mockResolvedValue(mockRoles);
});

describe("useUserCreate", () => {
  it("loads available roles on mount", async () => {
    const { result } = renderHook(() => useUserCreate(mockRepository), { wrapper });
    await vi.waitFor(() => {
      expect(result.current.availableRoles).toEqual(mockRoles);
      expect(result.current.loadingRoles).toBe(false);
    });
  });

  it("sets rolesError when role loading fails", async () => {
    mockListRoles.mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useUserCreate(mockRepository), { wrapper });
    await vi.waitFor(() => {
      expect(result.current.rolesError).toBe("Network error");
      expect(result.current.loadingRoles).toBe(false);
    });
  });

  it("initializes form with default values", () => {
    const { result } = renderHook(() => useUserCreate(mockRepository), { wrapper });
    expect(result.current.form).toEqual({
      firstName: "",
      lastName: "",
      email: "",
      countryCode: "+56",
      phone: "",
      password: "",
      rePassword: "",
      roleId: 0,
    });
    expect(result.current.error).toBe("");
    expect(result.current.loading).toBe(false);
    expect(result.current.fieldErrors).toEqual({});
  });

  it("handleChange updates form fields", () => {
    const { result } = renderHook(() => useUserCreate(mockRepository), { wrapper });
    act(() => {
      result.current.handleChange({
        target: { name: "firstName", value: "Juan" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.form.firstName).toBe("Juan");
  });

  it("handleChange converts roleId to number", () => {
    const { result } = renderHook(() => useUserCreate(mockRepository), { wrapper });
    act(() => {
      result.current.handleChange({
        target: { name: "roleId", value: "2" },
      } as React.ChangeEvent<HTMLSelectElement>);
    });
    expect(result.current.form.roleId).toBe(2);
  });

  it("handleChange clears field error for the field being edited", () => {
    const { result } = renderHook(() => useUserCreate(mockRepository), { wrapper });
    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    expect(result.current.fieldErrors.firstName).toBe("El nombre es obligatorio.");
    act(() => {
      result.current.handleChange({
        target: { name: "firstName", value: "Juan" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.fieldErrors.firstName).toBeUndefined();
  });

  it("handleSubmit validates required fields", () => {
    const { result } = renderHook(() => useUserCreate(mockRepository), { wrapper });
    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    expect(result.current.fieldErrors.firstName).toBe("El nombre es obligatorio.");
    expect(result.current.fieldErrors.lastName).toBe("El apellido es obligatorio.");
    expect(result.current.fieldErrors.email).toBe("El email es obligatorio.");
    expect(result.current.fieldErrors.phone).toBe("El teléfono es obligatorio.");
    expect(result.current.fieldErrors.password).toBe("La contraseña es obligatoria.");
    expect(result.current.fieldErrors.roleId).toBe("Selecciona un rol para el usuario.");
  });

  it("handleSubmit validates password length", () => {
    const { result } = renderHook(() => useUserCreate(mockRepository), { wrapper });
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

  it("handleSubmit validates password mismatch", () => {
    const { result } = renderHook(() => useUserCreate(mockRepository), { wrapper });
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

  it("handleSubmit calls repository.create and navigates on success", async () => {
    mockCreateUser.mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => useUserCreate(mockRepository), { wrapper });
    act(() => {
      result.current.handleChange({
        target: { name: "firstName", value: "Juan" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handleChange({
        target: { name: "lastName", value: "Pérez" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handleChange({
        target: { name: "email", value: "juan@test.com" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handleChange({
        target: { name: "phone", value: "999999999" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handleChange({
        target: { name: "password", value: "12345678" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handleChange({
        target: { name: "rePassword", value: "12345678" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handleChange({
        target: { name: "roleId", value: "1" },
      } as React.ChangeEvent<HTMLSelectElement>);
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    expect(mockCreateUser).toHaveBeenCalledWith({
      name: "Juan",
      lastName: "Pérez",
      email: "juan@test.com",
      countryCode: "+56",
      phone: "999999999",
      password: "12345678",
      roleId: 1,
    });
  });

  it("handleSubmit sets error when repository.create fails", async () => {
    mockCreateUser.mockRejectedValue(new Error("El usuario ya existe"));
    const { result } = renderHook(() => useUserCreate(mockRepository), { wrapper });
    act(() => {
      result.current.handleChange({
        target: { name: "firstName", value: "Juan" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handleChange({
        target: { name: "lastName", value: "Pérez" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handleChange({
        target: { name: "email", value: "juan@test.com" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handleChange({
        target: { name: "phone", value: "999999999" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handleChange({
        target: { name: "password", value: "12345678" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handleChange({
        target: { name: "rePassword", value: "12345678" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handleChange({
        target: { name: "roleId", value: "1" },
      } as React.ChangeEvent<HTMLSelectElement>);
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    expect(result.current.error).toBe("El usuario ya existe");
    expect(result.current.loading).toBe(false);
  });
});
