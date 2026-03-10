import { doc, getDoc, setDoc, arrayUnion, arrayRemove, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export interface SavedCourse {
    name: string;
    platform: string;
}

export interface UserProfile {
    educationLevel?: string;
    interests?: string[];
    skillLevel?: string;
    myCourses?: SavedCourse[];
    history?: string[];
    hasFinishedOnboarding?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

const USERS_COLLECTION = "users";

export const userService = {
    /**
     * Fetch the user's profile from Firestore.
     */
    async getUserProfile(uid: string): Promise<UserProfile | null> {
        if (!db) throw new Error("Firestore is not initialized");
        const docRef = doc(db, USERS_COLLECTION, uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as UserProfile;
        }
        return null;
    },

    /**
     * Create a new user profile document.
     */
    async createUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
        if (!db) throw new Error("Firestore is not initialized");
        const docRef = doc(db, USERS_COLLECTION, uid);
        const now = new Date().toISOString();
        await setDoc(docRef, {
            ...data,
            createdAt: now,
            updatedAt: now,
        }, { merge: true });
    },

    /**
     * Update an existing user profile document.
     */
    async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
        if (!db) throw new Error("Firestore is not initialized");
        const docRef = doc(db, USERS_COLLECTION, uid);
        const now = new Date().toISOString();
        await setDoc(docRef, {
            ...data,
            updatedAt: now,
        }, { merge: true });
    },

    /**
     * Add a course (name + platform) to the user's myCourses array in Firestore.
     */
    async addCourseToProfile(uid: string, course: SavedCourse): Promise<void> {
        if (!db) throw new Error("Firestore is not initialized");
        const docRef = doc(db, USERS_COLLECTION, uid);
        await setDoc(docRef, {
            myCourses: arrayUnion(course),
            updatedAt: new Date().toISOString(),
        }, { merge: true });
    },

    /**
     * Remove a course from the user's myCourses array in Firestore.
     */
    async removeCourseFromProfile(uid: string, course: SavedCourse): Promise<void> {
        if (!db) throw new Error("Firestore is not initialized");
        const docRef = doc(db, USERS_COLLECTION, uid);
        await updateDoc(docRef, {
            myCourses: arrayRemove(course),
            updatedAt: new Date().toISOString(),
        });
    },
};
