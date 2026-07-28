// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useUserCreate } from "../useUserCreate";
import type { UserRepository } from "../../domain/ports/UserRepository";

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

const mockRoles = [
  { id: 1, name: "ADMIN", description: "Admin", active: true },
  { id: 2, name: "RECRUITER", description: "Recruiter", active: true },
];

function createMockRepo(overrides?: Partial<UserRepository>): UserRepository {
  return {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn().mockResolvedValue({ id: 1, name: "Test" }),
    update: vi.fn(),
    deactivate: vi.fn(),
    listAvailableRoles: vi.fn().mockResolvedValue(mockRoles),
    ...overrides,
  };
}

function changeInput(
  result: ReturnType<typeof useUserCreate>,
  name: string,
  value: string
) {
  act(() => {
    result.current.handleChange({
      target: { name, value },
    } as React.ChangeEvent<HTMLInputElement>);
  });
}

describe("useUserCreate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads available roles on mount", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useUserCreate(repo));

    expect(result.current.loadingRoles).toBe(true);

    await waitFor(() => {
      expect(result.current.loadingRoles).toBe(false);
    });

    expect(result.current.availableRoles).toEqual(mockRoles);
    expect(result.current.rolesError).toBe("");
  });

  it("sets rolesError when listAvailableRoles fails", async () => {
    const repo = createMockRepo({
      listAvailableRoles: vi.fn().mockRejectedValue(new Error("Roles fetch failed")),
    });
    const { result } = renderHook(() => useUserCreate(repo));

    await waitFor(() => {
      expect(result.current.loadingRoles).toBe(false);
    });

    expect(result.current.rolesError).toBe("Roles fetch failed");
  });

  it("updates form state on handleChange", () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useUserCreate(repo));

    changeInput(result, "firstName", "Juan");
    expect(result.current.form.firstName).toBe("Juan");

    changeInput(result, "email", "juan@test.com");
    expect(result.current.form.email).toBe("juan@test.com");
  });

  it("clears field error when field is edited", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useUserCreate(repo));

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.fieldErrors.firstName).toBeDefined();

    changeInput(result, "firstName", "Juan");
    expect(result.current.fieldErrors.firstName).toBeUndefined();
  });

  it("validates required fields and returns fieldErrors", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useUserCreate(repo));

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.fieldErrors.firstName).toBe("El nombre es obligatorio.");
    expect(result.current.fieldErrors.lastName).toBe("El apellido es obligatorio.");
    expect(result.current.fieldErrors.email).toBe("El email es obligatorio.");
    expect(result.current.fieldErrors.phone).toBe("El teléfono es obligatorio.");
    expect(result.current.fieldErrors.password).toBe("La contraseña es obligatoria.");
    expect(result.current.fieldErrors.roleId).toBe("Selecciona un rol para el usuario.");
    expect(result.current.error).toBe("");
  });

  it("validates password minimum length", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useUserCreate(repo));

    changeInput(result, "firstName", "Juan");
    changeInput(result, "lastName", "Perez");
    changeInput(result, "email", "juan@test.com");
    changeInput(result, "phone", "999999999");
    changeInput(result, "password", "short");
    changeInput(result, "rePassword", "short");

    act(() => {
      result.current.handleChange({
        target: { name: "roleId", value: "1" },
      } as React.ChangeEvent<HTMLSelectElement>);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.fieldErrors.password).toBe("La contraseña debe tener al menos 8 caracteres.");
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("validates password confirmation match", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useUserCreate(repo));

    changeInput(result, "firstName", "Juan");
    changeInput(result, "lastName", "Perez");
    changeInput(result, "email", "juan@test.com");
    changeInput(result, "phone", "999999999");
    changeInput(result, "password", "validpass");
    changeInput(result, "rePassword", "different");

    act(() => {
      result.current.handleChange({
        target: { name: "roleId", value: "1" },
      } as React.ChangeEvent<HTMLSelectElement>);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.fieldErrors.rePassword).toBe("Las contraseñas no coinciden.");
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("calls repository.create with correct payload on valid submit", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useUserCreate(repo));

    changeInput(result, "firstName", "Juan");
    changeInput(result, "lastName", "Perez");
    changeInput(result, "email", "juan@test.com");
    changeInput(result, "phone", "999999999");
    changeInput(result, "password", "validpass");
    changeInput(result, "rePassword", "validpass");

    act(() => {
      result.current.handleChange({
        target: { name: "roleId", value: "1" },
      } as React.ChangeEvent<HTMLSelectElement>);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(repo.create).toHaveBeenCalledWith({
      name: "Juan",
      lastName: "Perez",
      email: "juan@test.com",
      countryCode: "+56",
      phone: "999999999",
      password: "validpass",
      roleId: 1,
    });
  });

  it("sets server error when create fails", async () => {
    const repo = createMockRepo({
      create: vi.fn().mockRejectedValue(new Error("El usuario ya existe")),
    });
    const { result } = renderHook(() => useUserCreate(repo));

    changeInput(result, "firstName", "Juan");
    changeInput(result, "lastName", "Perez");
    changeInput(result, "email", "juan@test.com");
    changeInput(result, "phone", "999999999");
    changeInput(result, "password", "validpass");
    changeInput(result, "rePassword", "validpass");

    act(() => {
      result.current.handleChange({
        target: { name: "roleId", value: "1" },
      } as React.ChangeEvent<HTMLSelectElement>);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe("El usuario ya existe");
  });

  it("sets generic error for non-Error exceptions", async () => {
    const repo = createMockRepo({
      create: vi.fn().mockRejectedValue("unknown"),
    });
    const { result } = renderHook(() => useUserCreate(repo));

    changeInput(result, "firstName", "Juan");
    changeInput(result, "lastName", "Perez");
    changeInput(result, "email", "juan@test.com");
    changeInput(result, "phone", "999999999");
    changeInput(result, "password", "validpass");
    changeInput(result, "rePassword", "validpass");

    act(() => {
      result.current.handleChange({
        target: { name: "roleId", value: "1" },
      } as React.ChangeEvent<HTMLSelectElement>);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe("No pudimos crear el usuario. Intenta de nuevo.");
  });

  it("trims whitespace from text fields", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useUserCreate(repo));

    changeInput(result, "firstName", "  Juan  ");
    changeInput(result, "lastName", "  Perez  ");
    changeInput(result, "email", "  juan@test.com  ");
    changeInput(result, "phone", "  999999999  ");
    changeInput(result, "password", "validpass");
    changeInput(result, "rePassword", "validpass");

    act(() => {
      result.current.handleChange({
        target: { name: "roleId", value: "1" },
      } as React.ChangeEvent<HTMLSelectElement>);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Juan",
        lastName: "Perez",
        email: "juan@test.com",
        phone: "999999999",
      })
    );
  });
});
