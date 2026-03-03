interface CourseHistoryEntry {
  id: number;
  timestamp: string;
}

export const getCourseHistory = (): CourseHistoryEntry[] => {
  const history = localStorage.getItem("courseHistory");
  return history ? JSON.parse(history) : [];
};

export const clearCourseHistory = (): void => {
  localStorage.removeItem("courseHistory");
};

export const addCourseToHistory = (course: { id: number }): void => {
  const history = getCourseHistory();
  const entry: CourseHistoryEntry = {
    id: course.id,
    timestamp: new Date().toISOString(),
  };
  
  const filtered = history.filter(h => h.id !== course.id);
  const updated = [entry, ...filtered].slice(0, 50);
  localStorage.setItem("courseHistory", JSON.stringify(updated));
};
