import { useState, useCallback } from "react";
import { isFirebaseConfigured } from "@/config/firebase";
import {
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
} from "@/services/authService";
import { useUser } from "@/context/UserContext";
import * as api from "@/services/api";
import { userService } from "@/services/userService";

export function useAuth() {
    const { setUser } = useUser();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ---------- Backend-only auth (no Firebase) ----------

    const backendLogin = async (email: string, password: string) => {
        const res = await api.login(email, password);
        const userData = {
            uid: "",
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
            uid: "",
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

    const syncWithBackendAfterFirebase = async (firebaseUid: string, email: string, name: string, password: string) => {
        // Create Firestore profile for new Firebase users
        try {
            const existingProfile = await userService.getUserProfile(firebaseUid);
            if (!existingProfile) {
                await userService.createUserProfile(firebaseUid, {
                    hasFinishedOnboarding: false,
                });
            }
        } catch (e) {
            console.warn("Could not sync Firestore profile:", e);
        }

        try {
            const res = await api.signup(email, password, name);
            const firestoreProfile = await userService.getUserProfile(firebaseUid).catch(() => null);
            setUser({
                uid: firebaseUid,
                userid: res.userid, email: res.email, name: res.name,
                isNewUser: res.is_new_user,
                hasDoneOnboarding: (firestoreProfile?.hasFinishedOnboarding ?? firestoreProfile?.hasfinishedonboarding) ?? res.has_done_onboarding,
            });
            return { isNewUser: res.is_new_user, hasDoneOnboarding: (firestoreProfile?.hasFinishedOnboarding ?? firestoreProfile?.hasfinishedonboarding) ?? res.has_done_onboarding };
        } catch {
            try {
                const res = await api.login(email, password);
                const firestoreProfile = await userService.getUserProfile(firebaseUid).catch(() => null);
                setUser({
                    uid: firebaseUid,
                    userid: res.userid, email: res.email, name: res.name,
                    isNewUser: res.is_new_user,
                    hasDoneOnboarding: (firestoreProfile?.hasFinishedOnboarding ?? firestoreProfile?.hasfinishedonboarding) ?? res.has_done_onboarding,
                });
                return { isNewUser: res.is_new_user, hasDoneOnboarding: (firestoreProfile?.hasFinishedOnboarding ?? firestoreProfile?.hasfinishedonboarding) ?? res.has_done_onboarding };
            } catch {
                setUser({ uid: firebaseUid, userid: 0, email, name, isNewUser: true, hasDoneOnboarding: false });
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
                    const fbUser = await registerWithEmail(email, password, name);
                    return await syncWithBackendAfterFirebase(fbUser.uid, email, name, password);
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
        async (email: string, password: string, remember = false) => {
            setLoading(true);
            setError(null);
            try {
                if (isFirebaseConfigured) {
                    try {
                        // Try Firebase Auth first
                        const fbUser = await loginWithEmail(email, password, remember);
                        const firebaseUid = fbUser.uid;
                        try {
                            const res = await api.login(email, password);
                            const firestoreProfile = await userService.getUserProfile(firebaseUid).catch(() => null);
                            setUser({
                                uid: firebaseUid,
                                userid: res.userid, email: res.email, name: res.name,
                                isNewUser: res.is_new_user,
                                hasDoneOnboarding: (firestoreProfile?.hasFinishedOnboarding ?? firestoreProfile?.hasfinishedonboarding) ?? res.has_done_onboarding,
                            });
                            return { isNewUser: res.is_new_user, hasDoneOnboarding: (firestoreProfile?.hasFinishedOnboarding ?? firestoreProfile?.hasfinishedonboarding) ?? res.has_done_onboarding };
                        } catch {
                            // Backend call failed; try to read onboarding status from Firestore
                            const firestoreProfile = await userService.getUserProfile(firebaseUid).catch(() => null);
                            const hasDoneOnboarding = (firestoreProfile?.hasFinishedOnboarding ?? firestoreProfile?.hasfinishedonboarding) ?? false;
                            setUser({ uid: firebaseUid, userid: 0, email, name: "", isNewUser: false, hasDoneOnboarding });
                            return { isNewUser: false, hasDoneOnboarding };
                        }
                    } catch (firebaseErr) {
                        // Firebase Auth failed — password may have been reset via backend OTP flow.
                        // Fall back to backend-only login.
                        console.warn("Firebase login failed, trying backend-only login:", firebaseErr);
                        try {
                            const res = await api.login(email, password);
                            // Backend login succeeded — password was reset via OTP but Firebase Auth
                            // still has the old password. Also trigger backend to sync the password
                            // to Firebase via the REST API.
                            try {
                                await api.syncFirebasePassword(email, password);
                            } catch (syncErr) {
                                console.warn("Could not sync password to Firebase:", syncErr);
                            }
                            const userData = {
                                uid: "",
                                userid: res.userid,
                                email: res.email,
                                name: res.name,
                                isNewUser: res.is_new_user,
                                hasDoneOnboarding: res.has_done_onboarding,
                            };
                            setUser(userData);
                            return { isNewUser: res.is_new_user, hasDoneOnboarding: res.has_done_onboarding };
                        } catch {
                            // Both Firebase and backend failed — truly invalid credentials
                            throw firebaseErr;
                        }
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
            const firebaseUid = firebaseUser.uid;

            // Create Firestore profile for brand-new Google users
            if (isNewUser) {
                try {
                    await userService.createUserProfile(firebaseUid, {
                        hasFinishedOnboarding: false,
                    });
                } catch (e) {
                    console.warn("Could not create Firestore profile for Google user:", e);
                }
            }

            try {
                const firestoreProfile = await userService.getUserProfile(firebaseUid).catch(() => null);
                if (isNewUser) {
                    const res = await api.signup(email, firebaseUser.uid, name);
                    setUser({
                        uid: firebaseUid,
                        userid: res.userid, email: res.email, name: res.name,
                        isNewUser: res.is_new_user,
                        hasDoneOnboarding: (firestoreProfile?.hasFinishedOnboarding ?? firestoreProfile?.hasfinishedonboarding) ?? res.has_done_onboarding,
                    });
                    return { isNewUser: res.is_new_user, hasDoneOnboarding: (firestoreProfile?.hasFinishedOnboarding ?? firestoreProfile?.hasfinishedonboarding) ?? res.has_done_onboarding };
                } else {
                    const res = await api.login(email, firebaseUser.uid);
                    setUser({
                        uid: firebaseUid,
                        userid: res.userid, email: res.email, name: res.name,
                        isNewUser: res.is_new_user,
                        hasDoneOnboarding: (firestoreProfile?.hasFinishedOnboarding ?? firestoreProfile?.hasfinishedonboarding) ?? res.has_done_onboarding,
                    });
                    return { isNewUser: res.is_new_user, hasDoneOnboarding: (firestoreProfile?.hasFinishedOnboarding ?? firestoreProfile?.hasfinishedonboarding) ?? res.has_done_onboarding };
                }
            } catch {
                setUser({ uid: firebaseUid, userid: 0, email, name, isNewUser, hasDoneOnboarding: false });
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

