// This function is usable for Typescript version <= 5.x and >= 4.x, because the enum behavior might change in the future
export const enumValuesToArray = (enumObject: Record<string, any>): number[] => {
  return Object.values(enumObject).filter((value) => typeof value === "number");
};
