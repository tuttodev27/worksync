import { Navigate } from "react-router-dom";
import { useAuthUser } from "../hooks/useAuthUser";
import type { UserRole } from "../types/auth.type";
import { logger } from "../utils/logger";
import Spinner from "./Spinner";

interface RequireRoleProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export default function RequireRole({
  allowedRoles,
  children,
}: RequireRoleProps) {
  const { user, isAuthenticated, isLoading } = useAuthUser();

  logger.debug("RequireRole →", { user, isAuthenticated, isLoading, allowedRoles });

  if (isLoading) return <Spinner />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const role = user!.role;
  logger.debug("role →", role, "allowedRoles →", allowedRoles);

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
