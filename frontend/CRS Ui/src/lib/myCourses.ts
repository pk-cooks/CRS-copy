import type { StaticCourse } from "@/data/courses";

const STORAGE_KEY = "myCourses";

/**
 * Get all courses from the user's personal library (localStorage).
 */
export function getMyCourses(): StaticCourse[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw) as StaticCourse[];
    } catch {
        /* ignore corrupt data */
    }
    return [];
}

/**
 * Save courses to the user's personal library (localStorage).
 */
export function saveMyCourses(courses: StaticCourse[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

/**
 * Add a single course to the library (no duplicates by id).
 */
export function addMyCourse(course: StaticCourse): void {
    const current = getMyCourses();
    if (!current.some((c) => c.id === course.id)) {
        saveMyCourses([...current, course]);
    }
}

/**
 * Remove a course from the library by id.
 */
export function removeMyCourse(id: number): void {
    saveMyCourses(getMyCourses().filter((c) => c.id !== id));
}
