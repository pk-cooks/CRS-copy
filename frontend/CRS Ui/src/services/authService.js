import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/config/firebase";

const googleProvider = new GoogleAuthProvider();

function ensureAuth() {
  if (!isFirebaseConfigured || !auth) {
    throw new Error("Firebase is not configured. Please add your Firebase credentials to a .env file.");
  }
  return auth;
}

/**
 * Register a new user with email and password.
 * Optionally sets displayName on the Firebase user profile.
 */
export async function registerWithEmail(email, password, displayName = "") {
  const firebaseAuth = ensureAuth();
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }
  return credential.user;
}

/**
 * Sign in an existing user with email and password.
 */
export async function loginWithEmail(email, password) {
  const firebaseAuth = ensureAuth();
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  return credential.user;
}

/**
 * Sign in with Google using a popup.
 * Returns the Firebase user and whether this is a new user.
 */
export async function loginWithGoogle() {
  const firebaseAuth = ensureAuth();
  const result = await signInWithPopup(firebaseAuth, googleProvider);
  const isNewUser =
    result._tokenResponse?.isNewUser ??
    result.user.metadata.creationTime === result.user.metadata.lastSignInTime;

  return {
    user: result.user,
    isNewUser,
  };
}

/**
 * Sign out the current user.
 */
export function logoutUser() {
  if (!isFirebaseConfigured || !auth) return Promise.resolve();
  return signOut(auth);
}
