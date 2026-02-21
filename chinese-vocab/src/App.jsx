// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

// Import Pages (Chúng ta sẽ tạo các trang này ở bước sau)
import Login from "./pages/Login";
import Admin from "./pages/Admin";

// Component tạm thời để test Router
const HomePlaceholder = () => <div className="p-8 text-xl">Trang chủ: Chọn HSK và Chế độ học</div>;
const AdminPlaceholder = () => <div className="p-8 text-xl text-red-600">Khu vực Admin (Quản lý từ vựng)</div>;
const FlashcardPlaceholder = () => <div className="p-8 text-xl text-blue-600">Học Flashcard</div>;

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Route */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected Routes dành cho mọi User */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <HomePlaceholder /> {/* Sau này sẽ thay bằng file Home.jsx */}
                        </ProtectedRoute>
                    } />
                    <Route path="/flashcard" element={
                        <ProtectedRoute>
                            <FlashcardPlaceholder />
                        </ProtectedRoute>
                    } />

                    {/* Admin Protected Route */}
                    <Route path="/admin" element={
                        <AdminRoute>
                            <Admin />
                        </AdminRoute>
                    } />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;