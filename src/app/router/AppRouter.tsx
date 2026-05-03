import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";

import LoginPage from "../../modules/auth/ui/pages/LoginPage";
import ForgotPasswordPage from "../../modules/auth/ui/pages/ForgotPasswordPage";

import AdminLayout from "../../modules/admin-ui/AdminLayout";
import AdminDashboard from "../../modules/admin-ui/AdminDashboard";

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
import CandidatoCreatePage from "../../modules/recluiter-ui/CandidatoCreatePage";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function UsersPage() {
  return (
    <div style={{ padding: 32 }}>
      <h2>Usuarios</h2>

      <Link to="/admin/users/create">
        <button
          style={{
            marginTop: 16,
            padding: "10px 16px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          + Crear usuario
        </button>
      </Link>
    </div>
  );
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

          <Route path="users" element={<UsersPage />} />
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
          <Route path="candidates/new" element={<CandidatoCreatePage />} />
        </Route>

        {/* 🔥 FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
