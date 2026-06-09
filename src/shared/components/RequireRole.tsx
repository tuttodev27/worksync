import { Navigate } from "react-router-dom";
import { useAuthUser } from "../hooks/useAuthUser";
import type { UserRole } from "../types/auth.type";

interface RequireRoleProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export default function RequireRole({
  allowedRoles,
  children,
}: RequireRoleProps) {
  const { user, isAuthenticated, isLoading } = useAuthUser();

  console.log("RequireRole →", {
    user,
    isAuthenticated,
    isLoading,
    allowedRoles,
  });

  if (isLoading) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const role = user!.role;
  console.log("role →", role, "allowedRoles →", allowedRoles);

  if (!allowedRoles.includes(role)) {
    const dashboard =
      role === "ADMIN"
        ? "/admin"
        : role === "RECRUITER"
          ? "/recruiter"
          : "/login";
    return <Navigate to={dashboard} replace />;
  }

  return <>{children}</>;
}
