const STORAGE_KEY = "favoriteCourses";

export const getFavorites = (): number[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const addFavorite = (id: number) => {
  const current = getFavorites();
  if (!current.includes(id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, id]));
  }
};

export const removeFavorite = (id: number) => {
  const current = getFavorites().filter((c) => c !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
};

export const isFavorite = (id: number) => {
  return getFavorites().includes(id);
};