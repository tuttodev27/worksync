// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLogin } from "../useLogin";
import type { AuthRepository } from "../domain/ports/AuthRepository";
import * as authStorage from "../../../../shared/services/authStorage";

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../../../shared/utils/logger", () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

const mockAuthUser = {
  email: "admin@test.com",
  role: "ADMIN" as const,
  token: "jwt-token-123",
  roles: ["ADMIN"],
};

function createMockRepo(overrides?: Partial<AuthRepository>): AuthRepository {
  return {
    login: vi.fn().mockResolvedValue({
      user: mockAuthUser,
      token: "jwt-token-123",
    }),
    ...overrides,
  };
}

function changeInput(
  result: ReturnType<typeof useLogin>,
  name: string,
  value: string
) {
  act(() => {
    result.current.handleChange({
      target: { name, value },
    } as React.ChangeEvent<HTMLInputElement>);
  });
}

describe("useLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authStorage, "saveAuthUser").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with empty form and no error", () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useLogin(repo));

    expect(result.current.form).toEqual({ email: "", password: "" });
    expect(result.current.error).toBe("");
    expect(result.current.loading).toBe(false);
  });

  it("updates form on handleChange", () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useLogin(repo));

    changeInput(result, "email", "admin@test.com");
    expect(result.current.form.email).toBe("admin@test.com");

    changeInput(result, "password", "secret123");
    expect(result.current.form.password).toBe("secret123");
  });

  it("calls repository.login and saves user on successful login", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useLogin(repo));

    changeInput(result, "email", "admin@test.com");
    changeInput(result, "password", "secret123");

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(repo.login).toHaveBeenCalledWith({
      email: "admin@test.com",
      password: "secret123",
    });
    expect(authStorage.saveAuthUser).toHaveBeenCalledWith(mockAuthUser);
  });

  it("navigates to /admin for ADMIN role", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useLogin(repo));

    changeInput(result, "email", "admin@test.com");
    changeInput(result, "password", "secret123");

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/admin");
  });

  it("navigates to /recruiter for RECRUITER role", async () => {
    const repo = createMockRepo({
      login: vi.fn().mockResolvedValue({
        user: { ...mockAuthUser, role: "RECRUITER" },
        token: "jwt-token-456",
      }),
    });
    const { result } = renderHook(() => useLogin(repo));

    changeInput(result, "email", "recruiter@test.com");
    changeInput(result, "password", "secret123");

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/recruiter");
  });

  it("sets error message for invalid credentials", async () => {
    const repo = createMockRepo({
      login: vi.fn().mockRejectedValue(new Error("Credenciales inválidas")),
    });
    const { result } = renderHook(() => useLogin(repo));

    changeInput(result, "email", "wrong@test.com");
    changeInput(result, "password", "wrongpass");

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe("Credenciales inválidas");
    expect(authStorage.saveAuthUser).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("sets generic error for non-Error exceptions", async () => {
    const repo = createMockRepo({
      login: vi.fn().mockRejectedValue("unknown"),
    });
    const { result } = renderHook(() => useLogin(repo));

    changeInput(result, "email", "test@test.com");
    changeInput(result, "password", "pass");

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe("Error al iniciar sesión");
  });

  it("clears previous error on new submit", async () => {
    const loginMock = vi.fn()
      .mockRejectedValueOnce(new Error("First error"))
      .mockResolvedValueOnce({
        user: mockAuthUser,
        token: "jwt-token-123",
      });

    const repo = createMockRepo({ login: loginMock });
    const { result } = renderHook(() => useLogin(repo));

    changeInput(result, "email", "test@test.com");
    changeInput(result, "password", "pass");

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe("First error");

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe("");
  });

  it("sets loading to true during submit and false after", async () => {
    let resolveLogin!: (value: unknown) => void;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });

    const repo = createMockRepo({
      login: vi.fn().mockReturnValue(loginPromise),
    });
    const { result } = renderHook(() => useLogin(repo));

    changeInput(result, "email", "test@test.com");
    changeInput(result, "password", "pass");

    act(() => {
      result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveLogin({
        user: mockAuthUser,
        token: "jwt-token-123",
      });
      await loginPromise;
    });

    expect(result.current.loading).toBe(false);
  });
});
