import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";

// Auth
import LoginPage from "../../modules/auth/ui/pages/LoginPage";
import ForgotPasswordPage from "../../modules/auth/ui/pages/ForgotPasswordPage";

// Admin
import AdminLayout from "../../modules/admin-ui/AdminLayout";
import AdminDashboard from "../../modules/admin-ui/AdminDashboard";
import RegisterPage from "../../modules/admin-ui/RegisterPage";

function RequireAuth({ children }) {
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
        {/* Auth público */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Admin protegido */}
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

          <Route path="roles" element={<div style={{ padding: 32 }}>CRUD Roles — próximamente</div>} />
          <Route path="permissions" element={<div style={{ padding: 32 }}>CRUD Permisos — próximamente</div>} />
          <Route path="modules" element={<div style={{ padding: 32 }}>CRUD Módulos — próximamente</div>} />
          <Route path="menu" element={<div style={{ padding: 32 }}>CRUD Menú — próximamente</div>} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}