import { inspect } from "util";
import path from "path";
import pino from "pino";

/**
 * Because the console.log() function is not always enough to inspect an object, we can use the util.inspect() function to inspect an object and print it to the console.
 * @param obj
 */
export const utilInspect = (obj: any) => {
  console.log(inspect(obj, { showHidden: false, depth: null, colors: true }));
};

export const trace = (message: any) => {
  // Tạo một lỗi để lấy stack trace
  const error = new Error();
  if (error && error.stack) {
    const stackLines = error.stack.split("\n");

    const callerLine = stackLines[2];

    const match = callerLine.match(/\((.*):(\d+):\d+\)/);
    if (match) {
      const filePath = match[1];
      const lineNumber = match[2];
      const fileName = path.basename(filePath);

      console.log(
        `[${fileName}:${lineNumber}] ${inspect(message, {
          depth: null,
          colors: true,
          showHidden: false,
        })}`,
      );
    } else {
      console.log(`[Unknown location] ${inspect(message, { depth: null, colors: true, showHidden: false })}`);
    }
  }
};

export const mapSerializer = (map: Map<any, any>) => {
  return Array.from(map.entries()).reduce((obj: any, [key, value]) => {
    obj[key] = value;
    return obj;
  }, {});
};

export const pinoLog = pino({
  serializers: {
    map: mapSerializer,
  },
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});
