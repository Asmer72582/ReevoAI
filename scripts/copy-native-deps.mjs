import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const funcRoot = path.join(root, ".vercel/output/functions/__server.func");

if (!fs.existsSync(funcRoot)) {
  console.log("No Vercel function output — skipping native dep install");
  process.exit(0);
}

const pkgPath = path.join(funcRoot, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

// Install sharp with its full dependency tree + correct platform binaries (linux-x64 on Vercel).
pkg.dependencies = {
  ...pkg.dependencies,
  sharp: "^0.34.5",
  cloudinary: "^2.10.0",
};

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

console.log(`Installing native deps into Vercel function (${process.platform}-${process.arch})...`);

execSync("npm install --no-package-lock --omit=dev --include=optional", {
  cwd: funcRoot,
  stdio: "inherit",
});

const modulesDir = path.join(funcRoot, "node_modules");
const required = ["sharp", "detect-libc", "semver", "cloudinary"];
const missing = required.filter((dep) => !fs.existsSync(path.join(modulesDir, dep)));

if (missing.length > 0) {
  console.error(`Missing after install: ${missing.join(", ")}`);
  process.exit(1);
}

const imgDir = path.join(modulesDir, "@img");
const nativeSharp = fs.existsSync(imgDir)
  ? fs.readdirSync(imgDir).filter((name) => name.startsWith("sharp-"))
  : [];

console.log(`Native deps OK — sharp: ${nativeSharp.join(", ") || "none"}, cloudinary: installed`);
