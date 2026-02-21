// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

// Khai báo danh sách email Admin (Có thể thêm nhiều email)
const ADMIN_EMAILS = ["tranducmanh2006@gmail.com"];

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Firebase Listener: Lắng nghe sự thay đổi trạng thái đăng nhập
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const isAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email);

    const value = {
        currentUser,
        isAdmin,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);