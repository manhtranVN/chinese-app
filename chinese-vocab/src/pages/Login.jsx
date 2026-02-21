// src/pages/Login.jsx
import { useState } from "react";
import { auth } from "../firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isLogin) {
                // Luồng đăng nhập bằng Firebase
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                // Luồng đăng ký bằng Firebase
                await createUserWithEmailAndPassword(auth, email, password);
            }
            navigate("/"); // Thành công thì chuyển hướng về trang chủ
        } catch (err) {
            setError(err.message.replace("Firebase: ", "")); // Hiển thị lỗi thân thiện hơn
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="flex flex-col items-center mb-8">
                    <BookOpen className="w-12 h-12 text-blue-600 mb-2" />
                    <h2 className="text-2xl font-bold text-gray-800">
                        {isLogin ? "Đăng nhập" : "Tạo tài khoản"}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Hệ thống luyện từ vựng HSK</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        disabled={loading}
                        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-blue-600 font-semibold hover:underline"
                    >
                        {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
                    </button>
                </div>
            </div>
        </div>
    );
}