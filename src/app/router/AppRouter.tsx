import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../../modules/auth/ui/pages/LoginPage";
import ForgotPasswordPage from "../../modules/auth/ui/pages/ForgotPasswordPage";

import AdminLayout from "../../modules/admin-ui/AdminLayout";
import AdminDashboard from "../../modules/admin-ui/AdminDashboard";

import ErrorBoundary from "../../shared/components/ErrorBoundary";
import UsersListPage from "../../modules/admin-ui/UsersListPage";
import RegisterPage from "../../modules/admin-ui/RegisterPage";
import EditUserPage from "../../modules/admin-ui/EditUserPage";
import RolesPage from "../../modules/admin-ui/RolesPage";
import PermissionListPage from "../../modules/admin-ui/PermissionListPage";
import ModuloPage from "../../modules/admin-ui/ModuloPage";
import MenusPage from "../../modules/admin-ui/MenusPage";

import RoleCreatePage from "../../modules/admin-ui/RoleCreatePage";
import PermissionCreatePage from "../../modules/admin-ui/PermissionCreatePage";
import ModuloCreatePage from "../../modules/admin-ui/ModuloCreatePage";
import MenuCreatePage from "../../modules/admin-ui/MenuCreatePage";

// Recruiter imports
import RecluiterLayout from "../../modules/recluiter-ui/RecluiterLayout";
import RecluiterDashboard from "../../modules/recluiter-ui/RecluiterDashboard";
import CandidateListPage from "../../modules/recluiter-ui/CandidateListPage";
import CandidateDetailPage from "../../modules/recluiter-ui/CandidateDetailPage";
import CandidatoCreatePage from "../../modules/recluiter-ui/CandidatoCreatePage";


function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔥 LOGIN */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* 🔥 ADMIN */}
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<ErrorBoundary><AdminDashboard /></ErrorBoundary>} />

          <Route path="users" element={<ErrorBoundary><UsersListPage /></ErrorBoundary>} />
          <Route path="users/create" element={<ErrorBoundary><RegisterPage /></ErrorBoundary>} />
          <Route path="users/:id/edit" element={<ErrorBoundary><EditUserPage /></ErrorBoundary>} />

          <Route path="roles" element={<ErrorBoundary><RolesPage /></ErrorBoundary>} />
          <Route path="roles/new" element={<ErrorBoundary><RoleCreatePage /></ErrorBoundary>} />

          <Route path="modules" element={<ErrorBoundary><ModuloPage /></ErrorBoundary>} />
          <Route path="modules/new" element={<ErrorBoundary><ModuloCreatePage /></ErrorBoundary>} />

          <Route path="menu" element={<ErrorBoundary><MenusPage /></ErrorBoundary>} />
          <Route path="menu/new" element={<ErrorBoundary><MenuCreatePage /></ErrorBoundary>} />

          <Route path="permissions" element={<ErrorBoundary><PermissionListPage /></ErrorBoundary>} />
          <Route path="permissions/create" element={<ErrorBoundary><PermissionCreatePage /></ErrorBoundary>} />
        </Route>

        {/* 🔥 RECRUITER */}
        <Route
          path="/recluiter"
          element={
            <RequireAuth>
              <RecluiterLayout />
            </RequireAuth>
          }
        >
          <Route index element={<ErrorBoundary><RecluiterDashboard /></ErrorBoundary>} />
          <Route path="candidates" element={<ErrorBoundary><CandidateListPage /></ErrorBoundary>} />
          <Route path="candidates/new" element={<ErrorBoundary><CandidatoCreatePage /></ErrorBoundary>} />
          <Route path="candidates/:id" element={<ErrorBoundary><CandidateDetailPage /></ErrorBoundary>} />
        </Route>

        {/* 🔥 FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
