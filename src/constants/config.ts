import minimist from "minimist";
const argv = minimist(process.argv.slice(2));
export const isProduction = argv.production === true;
export const isDevelopment = argv.development === true;
