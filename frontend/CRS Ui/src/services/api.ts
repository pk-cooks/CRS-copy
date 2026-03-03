const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ── Helpers ──────────────────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as Record<string, string>).detail ||
      `Request failed with status ${res.status}`
    );
  }
  return res.json() as Promise<T>;
}

// ── Types ────────────────────────────────────────────────────────────

export interface AuthResponse {
  userid: number;
  email: string;
  name: string;
  is_new_user: boolean;
  has_done_onboarding: boolean;
}

export interface BackendCourse {
  Title?: string;
  "Course Name"?: string;
  "Sub-Category"?: string;
  Category?: string;
  Rating?: number;
  "Short Intro"?: string;
  "Course Description"?: string;
  Skills?: string;
  URL?: string;
  "Course URL"?: string;
  Site?: string;
  "Course Type"?: string;
  Level?: string;
  Language?: string;
  Instructors?: string;
  Duration?: string;
  [key: string]: unknown;
}

// ── Auth ─────────────────────────────────────────────────────────────

export function signup(email: string, password: string, name: string) {
  return request<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ── Onboarding ───────────────────────────────────────────────────────

export function setEducationLevel(userid: number, education_level: string) {
  return request<{ message: string }>("/educationLevel", {
    method: "POST",
    body: JSON.stringify({ userid, education_level }),
  });
}

export function setInterest(userid: number, interested_fields: string[]) {
  return request<{ message: string }>("/interest", {
    method: "POST",
    body: JSON.stringify({ userid, interested_fields }),
  });
}

// ── Recommendations & Data ──────────────────────────────────────────

export async function getRecommendations(
  userid: number
): Promise<BackendCourse[]> {
  const data = await request<BackendCourse[] | { error: string }>(
    `/recommend?userid=${userid}`
  );
  if (Array.isArray(data)) return data;
  // Backend may return { error: "..." } — treat as empty
  return [];
}

export function getCourses() {
  return request<BackendCourse[]>("/courses");
}

export function getProfile(userid: number) {
  return request<Record<string, unknown>>(`/profile/${userid}`);
}


