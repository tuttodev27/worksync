import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../../modules/auth/ui/pages/LoginPage";
import ForgotPasswordPage from "../../modules/auth/ui/pages/ForgotPasswordPage";

import AdminLayout from "../../modules/admin-ui/AdminLayout";
import AdminDashboard from "../../modules/admin-ui/AdminDashboard";

import UsersListPage from "../../modules/admin-ui/UsersListPage";
import RegisterPage from "../../modules/admin-ui/RegisterPage";
import RolesPage from "../../modules/admin-ui/RolesPage";
import ModuloPage from "../../modules/admin-ui/ModuloPage";
import MenusPage from "../../modules/admin-ui/MenusPage";

import RoleCreatePage from "../../modules/admin-ui/RoleCreatePage";
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
          <Route index element={<AdminDashboard />} />

          <Route path="users" element={<UsersListPage />} />
          <Route path="users/create" element={<RegisterPage />} />

          <Route path="roles" element={<RolesPage />} />
          <Route path="roles/new" element={<RoleCreatePage />} />

          <Route path="modules" element={<ModuloPage />} />
          <Route path="modules/new" element={<ModuloCreatePage />} />

          <Route path="menu" element={<MenusPage />} />
          <Route path="menu/new" element={<MenuCreatePage />} />

          <Route
            path="permissions"
            element={
              <div style={{ padding: 32 }}>CRUD Permisos — próximamente</div>
            }
          />
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
          <Route index element={<RecluiterDashboard />} />
          <Route path="candidates" element={<CandidateListPage />} />
          <Route path="candidates/new" element={<CandidatoCreatePage />} />
          <Route path="candidates/:id" element={<CandidateDetailPage />} />
        </Route>

        {/* 🔥 FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
