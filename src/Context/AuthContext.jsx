/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { useMessage } from "./MessageContext";

const AuthContext = createContext();

const USERS_STORAGE_KEY = "allUsers";

function normalizeUser(user) {
    if (!user) return user;
    if (user.role === 'client') {
        return { ...user, role: 'customer' };
    }
    return user;
}

function persistCurrentUser(user) {
    if (localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    }
}

function clearCurrentUserStorage() {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
}

export function AuthProvider({ children }) {
    const [allUsers, setAllUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const { showMessage } = useMessage();

    useEffect(() => {
        const persistedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
        let persistedUsers = [];

        try { persistedUsers = persistedUsersRaw ? JSON.parse(persistedUsersRaw) : []; } catch { persistedUsers = []; }

        if (!persistedUsersRaw) localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([]));

        // migrate legacy client → customer in persisted users
        let usersChanged = false;
        persistedUsers = persistedUsers.map((u) => {
            if (u.role === 'client') {
                usersChanged = true;
                return { ...u, role: 'customer' };
            }
            return u;
        });
        if (usersChanged) {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(persistedUsers));
        }

        // ensure admin exists in persisted users (local until P2 Sanctum)
        const adminTestUser = {
            id: 0,
            name: 'Admin User',
            phone: '',
            email: 'admin@admin.com',
            password: 'admin',
            role: 'admin',
        };
        if (!persistedUsers.some(u => u.email === adminTestUser.email)) {
            persistedUsers = [adminTestUser, ...persistedUsers];
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(persistedUsers));
        }

        setAllUsers(persistedUsers);

        const storedCurrentRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (storedCurrentRaw) {
            try {
                const storedCurrent = JSON.parse(storedCurrentRaw);
                // staff sessions are no longer valid (staff surface removed)
                if (storedCurrent.accountRole === 'staff') {
                    clearCurrentUserStorage();
                } else {
                    const normalized = normalizeUser(storedCurrent);
                    if (storedCurrent.role === 'client') {
                        persistCurrentUser(normalized);
                    }
                    setCurrentUser(normalized);
                    setIsAuthenticated(true);
                }
            } catch {
                clearCurrentUserStorage();
            }
        }

        setLoading(false);
    }, []);

    const register = async (userData) => {
        try {
            const persistedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');

            const newId = persistedUsers.length > 0 ? Math.max(...persistedUsers.map(u => u.id || 0)) + 1 : 1;
            const newUser = {
                id: newId,
                name: userData.fullname,
                phone: userData.phone,
                email: userData.email.toLowerCase().trim(),
                password: userData.password,
                role: userData.role || 'customer',
            };

            for (const u of persistedUsers) {
                if (u.email && u.email.toLowerCase() === newUser.email) {
                    throw new Error('User already exists with this email');
                }
                if (u.phone === newUser.phone) {
                    throw new Error('User already exists with this phone number');
                }
            }

            const updatedPersisted = [...persistedUsers, newUser];
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedPersisted));
            setAllUsers(updatedPersisted);

            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }

    const login = async (userData) => {
        try {
            const email = userData.email.toLowerCase().trim();
            const password = userData.password;
            const rememberMe = userData.rememberMe;

            for (const u of allUsers) {
                if (u.email === email && u.password === password) {
                    const user = normalizeUser(u);
                    setCurrentUser(user);
                    setIsAuthenticated(true);
                    if (rememberMe) {
                        localStorage.setItem('currentUser', JSON.stringify(user));
                        sessionStorage.removeItem('currentUser');
                    } else {
                        sessionStorage.setItem('currentUser', JSON.stringify(user));
                        localStorage.removeItem('currentUser');
                    }
                    if (typeof showMessage === 'function') {
                        showMessage('success', 'Logged in successfully');
                    }
                    return { success: true };
                }
            }
            throw new Error('Invalid email or password');
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }

    const logout = async () => {
        setCurrentUser(null);
        setIsAuthenticated(false);
        clearCurrentUserStorage();
        if (typeof showMessage === 'function') {
            showMessage('success', 'Logged out successfully');
        }
    }

    const updatedUser = async (user) => {
        try {
            if (user?.accountRole === 'staff') {
                return { success: false, error: 'Staff accounts are no longer supported' };
            }

            const normalized = normalizeUser(user);
            const persistedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
            const updatedPersisted = persistedUsers.map((u) => (u.id === normalized.id ? normalized : u));
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedPersisted));
            setAllUsers(updatedPersisted);

            setCurrentUser(normalized);
            persistCurrentUser(normalized);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }

    const value = {
        currentUser,
        loading,
        isAuthenticated,
        register,
        login,
        logout,
        updatedUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
