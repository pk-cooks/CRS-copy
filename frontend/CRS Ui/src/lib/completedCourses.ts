const STORAGE_KEY = "completedCourses";

export const getCompleted = (): number[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const markCompleted = (id: number) => {
  const current = getCompleted();
  if (!current.includes(id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, id]));
  }
};

export const unmarkCompleted = (id: number) => {
  const current = getCompleted().filter((c) => c !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
};

export const isCompleted = (id: number) => {
  return getCompleted().includes(id);
};
