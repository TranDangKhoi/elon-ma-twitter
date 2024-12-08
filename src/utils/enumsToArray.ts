// This function is currently usable for Typescript version <= 5.x and >= 3.x, because enum's behavior might change in the future
export const enumValuesToArray = (enumObject: Record<string, any>): (number | string)[] => {
  // Example i/o: { A: 0, B: 1, C: 2 } => [0, 1, 2]
  return Object.values(enumObject).filter((value) => typeof value === "number" || typeof value === "string");
};
