/**
 * Stores one "core skill" per completed course.
 * Shape: { [courseId: number]: string }
 * The core skill is the FIRST skill from the course's Skills list.
 */
const STORAGE_KEY = "learnedSkills";

type LearnedSkillsMap = Record<number, string>;

export const getLearnedSkillsMap = (): LearnedSkillsMap => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

/** Returns a deduplicated array of all earned skill names. */
export const getLearnedSkills = (): string[] => {
  const map = getLearnedSkillsMap();
  const unique = Array.from(new Set(Object.values(map)));
  return unique;
};

/** Called when a course is marked completed – stores its core skill. */
export const addLearnedSkill = (courseId: number, coreSkill: string): void => {
  if (!coreSkill) return;
  const map = getLearnedSkillsMap();
  map[courseId] = coreSkill;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
};

/** Called when a course is unmarked – removes that course's core skill. */
export const removeLearnedSkill = (courseId: number): void => {
  const map = getLearnedSkillsMap();
  delete map[courseId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
};
