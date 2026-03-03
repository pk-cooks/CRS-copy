import { useState, useCallback } from "react";
import { isFirebaseConfigured } from "@/config/firebase";
import {
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
} from "@/services/authService";
import { useUser } from "@/context/UserContext";
import * as api from "@/services/api";

export function useAuth() {
    const { setUser } = useUser();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ---------- Backend-only auth (no Firebase) ----------

    const backendLogin = async (email: string, password: string) => {
        const res = await api.login(email, password);
        const userData = {
            userid: res.userid,
            email: res.email,
            name: res.name,
            isNewUser: res.is_new_user,
            hasDoneOnboarding: res.has_done_onboarding,
        };
        setUser(userData);
        return { isNewUser: res.is_new_user, hasDoneOnboarding: res.has_done_onboarding };
    };

    const backendSignup = async (email: string, password: string, name: string) => {
        const res = await api.signup(email, password, name);
        const userData = {
            userid: res.userid,
            email: res.email,
            name: res.name,
            isNewUser: res.is_new_user,
            hasDoneOnboarding: res.has_done_onboarding,
        };
        setUser(userData);
        return { isNewUser: res.is_new_user, hasDoneOnboarding: res.has_done_onboarding };
    };

    // ---------- Firebase + Backend auth ----------

    const syncWithBackendAfterFirebase = async (email: string, name: string, password: string) => {
        try {
            const res = await api.signup(email, password, name);
            setUser({
                userid: res.userid, email: res.email, name: res.name,
                isNewUser: res.is_new_user, hasDoneOnboarding: res.has_done_onboarding,
            });
            return { isNewUser: res.is_new_user, hasDoneOnboarding: res.has_done_onboarding };
        } catch {
            try {
                const res = await api.login(email, password);
                setUser({
                    userid: res.userid, email: res.email, name: res.name,
                    isNewUser: res.is_new_user, hasDoneOnboarding: res.has_done_onboarding,
                });
                return { isNewUser: res.is_new_user, hasDoneOnboarding: res.has_done_onboarding };
            } catch {
                setUser({ userid: 0, email, name, isNewUser: true, hasDoneOnboarding: false });
                return { isNewUser: true, hasDoneOnboarding: false };
            }
        }
    };

    // ---------- Public API ----------

    const signupFn = useCallback(
        async (email: string, password: string, name: string) => {
            setLoading(true);
            setError(null);
            try {
                if (isFirebaseConfigured) {
                    await registerWithEmail(email, password, name);
                    return await syncWithBackendAfterFirebase(email, name, password);
                } else {
                    return await backendSignup(email, password, name);
                }
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Signup failed";
                setError(msg);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [setUser]
    );

    const loginFn = useCallback(
        async (email: string, password: string) => {
            setLoading(true);
            setError(null);
            try {
                if (isFirebaseConfigured) {
                    await loginWithEmail(email, password);
                    try {
                        const res = await api.login(email, password);
                        setUser({
                            userid: res.userid, email: res.email, name: res.name,
                            isNewUser: res.is_new_user, hasDoneOnboarding: res.has_done_onboarding,
                        });
                        return { isNewUser: res.is_new_user, hasDoneOnboarding: res.has_done_onboarding };
                    } catch {
                        setUser({ userid: 0, email, name: "", isNewUser: false, hasDoneOnboarding: false });
                        return { isNewUser: false, hasDoneOnboarding: false };
                    }
                } else {
                    return await backendLogin(email, password);
                }
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Login failed";
                setError(msg);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [setUser]
    );

    const googleLoginFn = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { user: firebaseUser, isNewUser } = await loginWithGoogle();
            const email = firebaseUser.email || "";
            const name = firebaseUser.displayName || "";

            try {
                if (isNewUser) {
                    const res = await api.signup(email, firebaseUser.uid, name);
                    setUser({
                        userid: res.userid, email: res.email, name: res.name,
                        isNewUser: res.is_new_user, hasDoneOnboarding: res.has_done_onboarding,
                    });
                    return { isNewUser: res.is_new_user, hasDoneOnboarding: res.has_done_onboarding };
                } else {
                    const res = await api.login(email, firebaseUser.uid);
                    setUser({
                        userid: res.userid, email: res.email, name: res.name,
                        isNewUser: res.is_new_user, hasDoneOnboarding: res.has_done_onboarding,
                    });
                    return { isNewUser: res.is_new_user, hasDoneOnboarding: res.has_done_onboarding };
                }
            } catch {
                setUser({ userid: 0, email, name, isNewUser, hasDoneOnboarding: false });
                return { isNewUser, hasDoneOnboarding: false };
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Google login failed";
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setUser]);

    return {
        login: loginFn,
        signup: signupFn,
        googleLogin: googleLoginFn,
        loading,
        error,
    };
}
