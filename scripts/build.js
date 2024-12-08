/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const { execSync } = require("child_process");
const { performance } = require("perf_hooks");

const start = performance.now();

try {
  execSync("rimraf ./dist", { stdio: "inherit" });
  execSync("tsc", { stdio: "inherit" });
  execSync("tsc-alias", { stdio: "inherit" });

  const duration = ((performance.now() - start) / 1000).toFixed(2);
  console.log(`\n✨ Build completed in ${duration}s`);
} catch (error) {
  console.error("Build failed:", error);
  process.exit(1);
}
