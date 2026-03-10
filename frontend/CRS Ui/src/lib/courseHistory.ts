interface CourseHistoryEntry {
  id: number;
  timestamp: string;
}

export const getCourseHistory = () => {
  return JSON.parse(localStorage.getItem("course_history") || "[]");
};

export const clearCourseHistory = (): void => {
  localStorage.removeItem("course_history");
};

export const addCourseToHistory = (course: any) => {
  const history = JSON.parse(localStorage.getItem("course_history") || "[]");

  const newEntry = {
    id: course.id,
    title: course.title,
    platform: course.platform,
    rating: course.rating,
    level: course.level,
    description: course.description,
    url: course.url || "",
    timestamp: new Date().toISOString(),
  };

  const filtered = history.filter((h: any) => h.id !== course.id);

  const updated = [newEntry, ...filtered].slice(0, 10);

  localStorage.setItem("course_history", JSON.stringify(updated));
};
