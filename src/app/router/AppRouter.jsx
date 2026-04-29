import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../../modules/auth/ui/pages/LoginPage";
import RegisterPage from "../../modules/auth/ui/pages/RegisterPage";
import ForgotPasswordPage from "../../modules/auth/ui/pages/ForgotPasswordPage";
import ResetCodePage from "../../modules/auth/ui/pages/ResetCodePage";
import ResetPasswordPage from "../../modules/auth/ui/pages/ResetPasswordPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-code" element={<ResetCodePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </BrowserRouter>
  );
}