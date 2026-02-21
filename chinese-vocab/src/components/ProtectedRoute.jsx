// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Dành cho mọi user đã đăng nhập
export const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();
    if (!currentUser) return <Navigate to="/login" replace />;
    return children;
};

// Dành riêng cho Admin
export const AdminRoute = ({ children }) => {
    const { currentUser, isAdmin } = useAuth();
    if (!currentUser) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/" replace />; // Nếu không phải admin, đẩy về trang chủ học tập
    return children;
};