import { inspect } from "util";

/**
 * Inspect an object and print it to the console
 * @param obj
 */
export const utilInspect = (obj: any) => {
  console.log(inspect(obj, { showHidden: false, depth: null, colors: true }));
};
