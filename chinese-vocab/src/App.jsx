import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Home from "./pages/Home";
import Flashcard from "./pages/Flashcard";
// 1. Thêm dòng này
import Quiz from "./pages/Quiz";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    } />

                    <Route path="/flashcard" element={
                        <ProtectedRoute>
                            <Flashcard />
                        </ProtectedRoute>
                    } />

                    {/* 2. Thêm Route này */}
                    <Route path="/quiz" element={
                        <ProtectedRoute>
                            <Quiz />
                        </ProtectedRoute>
                    } />

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