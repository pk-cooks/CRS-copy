import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface UserData {
    uid: string;
    userid: number;
    email: string;
    name: string;
    isNewUser: boolean;
    hasDoneOnboarding: boolean;
    interests?: string[];
}

interface UserContextValue {
    user: UserData | null;
    setUser: (u: UserData) => void;
    clearUser: () => void;
    updateInterests: (interests: string[]) => void;
}

const STORAGE_KEY = "crs_user";

const UserContext = createContext<UserContextValue | undefined>(undefined);

function loadUser(): UserData | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw) as UserData;
    } catch {
        /* ignore corrupt data */
    }
    return null;
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUserState] = useState<UserData | null>(loadUser);

    // Persist whenever user changes
    useEffect(() => {
        if (user) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [user]);

    const setUser = useCallback((u: UserData) => setUserState(u), []);
    const clearUser = useCallback(() => setUserState(null), []);
    const updateInterests = useCallback(
        (interests: string[]) =>
            setUserState((prev) => (prev ? { ...prev, interests } : prev)),
        []
    );

    return (
        <UserContext.Provider value={{ user, setUser, clearUser, updateInterests }}>
            {children}
        </UserContext.Provider>
    );
};

export function useUser(): UserContextValue {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used within <UserProvider>");
    return ctx;
}
