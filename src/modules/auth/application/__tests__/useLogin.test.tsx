// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import type { AuthRepository, AuthResult } from "../../domain/ports/AuthRepository";

vi.mock("../../../../shared/services/authStorage", () => ({
  saveAuthUser: vi.fn(),
}));

vi.mock("../../../../shared/utils/logger", () => ({
  logger: { debug: vi.fn(), error: vi.fn() },
}));

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

const mockLogin = vi.fn();

const mockRepository: AuthRepository = {
  login: mockLogin,
};

const adminResult: AuthResult = {
  user: { email: "admin@test.com", role: "ADMIN", roles: ["ADMIN"], token: "token-abc" },
  token: "token-abc",
};

const recruiterResult: AuthResult = {
  user: { email: "recruiter@test.com", role: "RECRUITER", roles: ["RECRUITER"], token: "token-xyz" },
  token: "token-xyz",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useLogin", () => {
  it("initializes with default values", async () => {
    const { useLogin } = await import("../useLogin");
    const { result } = renderHook(() => useLogin(mockRepository), { wrapper });
    expect(result.current.form).toEqual({ email: "", password: "" });
    expect(result.current.error).toBe("");
    expect(result.current.loading).toBe(false);
  });

  it("handleChange updates form fields", async () => {
    const { useLogin } = await import("../useLogin");
    const { result } = renderHook(() => useLogin(mockRepository), { wrapper });
    act(() => {
      result.current.handleChange({
        target: { name: "email", value: "test@test.com" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.form.email).toBe("test@test.com");
  });

  it("handleSubmit calls repository.login and navigates to /admin for ADMIN", async () => {
    mockLogin.mockResolvedValue(adminResult);
    const { useLogin } = await import("../useLogin");
    const { result } = renderHook(() => useLogin(mockRepository), { wrapper });
    act(() => {
      result.current.handleChange({
        target: { name: "email", value: "admin@test.com" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handleChange({
        target: { name: "password", value: "admin123" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    expect(mockLogin).toHaveBeenCalledWith({ email: "admin@test.com", password: "admin123" });
  });

  it("handleSubmit navigates to /recruiter for non-ADMIN role", async () => {
    mockLogin.mockResolvedValue(recruiterResult);
    const { useLogin } = await import("../useLogin");
    const { result } = renderHook(() => useLogin(mockRepository), { wrapper });
    act(() => {
      result.current.handleChange({
        target: { name: "email", value: "recruiter@test.com" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handleChange({
        target: { name: "password", value: "recruiter123" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    expect(mockLogin).toHaveBeenCalledWith({
      email: "recruiter@test.com",
      password: "recruiter123",
    });
  });

  it("handleSubmit calls saveAuthUser with user data", async () => {
    mockLogin.mockResolvedValue(adminResult);
    const { useLogin } = await import("../useLogin");
    const { result } = renderHook(() => useLogin(mockRepository), { wrapper });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    const { saveAuthUser } = await import("../../../../shared/services/authStorage");
    expect(saveAuthUser).toHaveBeenCalledWith(adminResult.user);
  });

  it("handleSubmit sets error when login fails", async () => {
    mockLogin.mockRejectedValue(new Error("Credenciales inválidas"));
    const { useLogin } = await import("../useLogin");
    const { result } = renderHook(() => useLogin(mockRepository), { wrapper });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    expect(result.current.error).toBe("Credenciales inválidas");
  });

  it("loading is true during request and false after success", async () => {
    let resolveLogin: (value: AuthResult) => void;
    mockLogin.mockImplementation(() => new Promise((resolve) => { resolveLogin = resolve; }));
    const { useLogin } = await import("../useLogin");
    const { result } = renderHook(() => useLogin(mockRepository), { wrapper });
    let promise: Promise<void>;
    act(() => {
      promise = result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    expect(result.current.loading).toBe(true);
    await act(async () => {
      resolveLogin!(adminResult);
      await promise!;
    });
    expect(result.current.loading).toBe(false);
  });

  it("loading is false after error", async () => {
    mockLogin.mockRejectedValue(new Error("Error"));
    const { useLogin } = await import("../useLogin");
    const { result } = renderHook(() => useLogin(mockRepository), { wrapper });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    expect(result.current.loading).toBe(false);
  });
});
