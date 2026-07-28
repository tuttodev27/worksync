// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useUserEdit } from "../useUserEdit";
import type { UserRepository } from "../../domain/ports/UserRepository";

const mockNavigate = vi.fn();
let mockParams: Record<string, string> = {};

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
}));

const mockRoles = [
  { id: 1, name: "ADMIN", description: "Admin", active: true },
  { id: 2, name: "RECRUITER", description: "Recruiter", active: true },
];

const mockUser = {
  id: 1,
  name: "Alice",
  lastName: "Smith",
  email: "alice@test.com",
  countryCode: "+56",
  phone: "999999999",
  active: true,
  roles: [1],
  createdAt: "2024-01-01",
};

function createMockRepo(overrides?: Partial<UserRepository>): UserRepository {
  return {
    list: vi.fn(),
    getById: vi.fn().mockResolvedValue(mockUser),
    create: vi.fn(),
    update: vi.fn().mockResolvedValue(mockUser),
    deactivate: vi.fn(),
    listAvailableRoles: vi.fn().mockResolvedValue(mockRoles),
    ...overrides,
  };
}

function changeInput(
  result: ReturnType<typeof useUserEdit>,
  name: string,
  value: string
) {
  act(() => {
    result.current.handleChange({
      target: { name, value },
    } as React.ChangeEvent<HTMLInputElement>);
  });
}

function changeSelect(
  result: ReturnType<typeof useUserEdit>,
  name: string,
  value: string
) {
  act(() => {
    result.current.handleChange({
      target: { name, value },
    } as React.ChangeEvent<HTMLSelectElement>);
  });
}

function changeCheckbox(
  result: ReturnType<typeof useUserEdit>,
  name: string,
  checked: boolean
) {
  act(() => {
    result.current.handleChange({
      target: { name, checked, type: "checkbox" },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  });
}

describe("useUserEdit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams = { id: "1" };
  });

  it("loads user data on mount", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useUserEdit(repo));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.form.name).toBe("Alice");
    expect(result.current.form.lastName).toBe("Smith");
    expect(result.current.form.email).toBe("alice@test.com");
    expect(result.current.form.phone).toBe("999999999");
    expect(result.current.form.active).toBe(true);
    expect(result.current.notFound).toBe(false);
  });

  it("sets notFound when user does not exist", async () => {
    const repo = createMockRepo({
      getById: vi.fn().mockRejectedValue(new Error("Usuario no encontrado")),
    });
    const { result } = renderHook(() => useUserEdit(repo));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.notFound).toBe(true);
    expect(result.current.error).toBe("");
  });

  it("sets error for other getById failures", async () => {
    const repo = createMockRepo({
      getById: vi.fn().mockRejectedValue(new Error("Network error")),
    });
    const { result } = renderHook(() => useUserEdit(repo));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.notFound).toBe(false);
  });

  it("loads roles on mount", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useUserEdit(repo));

    await waitFor(() => {
      expect(result.current.loadingRoles).toBe(false);
    });

    expect(result.current.availableRoles).toEqual(mockRoles);
  });

  it("sets rolesError when listAvailableRoles fails", async () => {
    const repo = createMockRepo({
      listAvailableRoles: vi.fn().mockRejectedValue(new Error("Roles error")),
    });
    const { result } = renderHook(() => useUserEdit(repo));

    await waitFor(() => {
      expect(result.current.loadingRoles).toBe(false);
    });

    expect(result.current.rolesError).toBe("Roles error");
  });

  it("updates form on handleChange", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useUserEdit(repo));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    changeInput(result, "name", "Bob");

    expect(result.current.form.name).toBe("Bob");
  });

  it("handles checkbox change", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useUserEdit(repo));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.form.active).toBe(true);

    changeCheckbox(result, "active", false);

    expect(result.current.form.active).toBe(false);
  });

  it("clears field error when field is edited", async () => {
    const repo = createMockRepo({
      getById: vi.fn().mockResolvedValue({
        ...mockUser,
        name: "",
        phone: "",
      }),
    });
    const { result } = renderHook(() => useUserEdit(repo));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.fieldErrors.name).toBe("El nombre es obligatorio.");

    changeInput(result, "name", "Bob");
    expect(result.current.fieldErrors.name).toBeUndefined();
  });

  it("validates required fields", async () => {
    const repo = createMockRepo({
      getById: vi.fn().mockResolvedValue({
        ...mockUser,
        name: "",
        lastName: "",
        phone: "",
      }),
    });
    const { result } = renderHook(() => useUserEdit(repo));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.fieldErrors.name).toBe("El nombre es obligatorio.");
    expect(result.current.fieldErrors.lastName).toBe("El apellido es obligatorio.");
    expect(result.current.fieldErrors.phone).toBe("El teléfono es obligatorio.");
  });

  it("validates password only when provided", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useUserEdit(repo));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    changeInput(result, "password", "short");

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.fieldErrors.password).toBe("La contraseña debe tener al menos 8 caracteres.");
  });

  it("validates password confirmation match", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useUserEdit(repo));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    changeInput(result, "password", "validpass");
    changeInput(result, "rePassword", "different");

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.fieldErrors.rePassword).toBe("Las contraseñas no coinciden.");
  });

  it("calls repository.update with correct payload", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useUserEdit(repo));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    changeInput(result, "name", "Updated");

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(repo.update).toHaveBeenCalledWith(1, {
      name: "Updated",
      lastName: "Smith",
      countryCode: "+56",
      phone: "999999999",
      active: true,
      roleId: 1,
    });
    expect(mockNavigate).toHaveBeenCalledWith("/admin/users");
  });

  it("includes password in payload only when provided", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useUserEdit(repo));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    changeInput(result, "password", "newpassword123");
    changeInput(result, "rePassword", "newpassword123");

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(repo.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ password: "newpassword123" })
    );
  });

  it("sets server error when update fails", async () => {
    const repo = createMockRepo({
      update: vi.fn().mockRejectedValue(new Error("Conflict")),
    });
    const { result } = renderHook(() => useUserEdit(repo));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe("Conflict");
  });

  it("handleCancel navigates to users list", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useUserEdit(repo));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleCancel();
    });

    expect(mockNavigate).toHaveBeenCalledWith("/admin/users");
  });
});
