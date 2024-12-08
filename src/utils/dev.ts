import { inspect } from "util";

/**
 * Because the console.log() function is not always enough to inspect an object, we can use the util.inspect() function to inspect an object and print it to the console.
 * @param obj
 */
export const utilInspect = (obj: any) => {
  console.log(inspect(obj, { showHidden: false, depth: null, colors: true }));
};
