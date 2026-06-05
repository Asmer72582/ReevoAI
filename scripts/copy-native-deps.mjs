import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcModules = path.join(root, "node_modules");
const destModules = path.join(root, ".vercel/output/functions/__server.func/node_modules");

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
  return true;
}

function copyPackage(name) {
  const src = path.join(srcModules, name);
  const dest = path.join(destModules, name);
  if (copyDir(src, dest)) {
    console.log(`Copied ${name} → Vercel function`);
    return true;
  }
  return false;
}

if (!fs.existsSync(destModules)) {
  console.log("No Vercel function output — skipping native dep copy");
  process.exit(0);
}

let copied = 0;

if (copyPackage("sharp")) copied++;

const imgDir = path.join(srcModules, "@img");
const imgDest = path.join(destModules, "@img");
if (fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDest, { recursive: true });
  for (const entry of fs.readdirSync(imgDir)) {
    if (entry.startsWith("sharp")) {
      if (copyDir(path.join(imgDir, entry), path.join(imgDest, entry))) copied++;
    }
  }
}

// Backend install may hold sharp when hoisted differently
const backendImg = path.join(root, "backend/node_modules/@img");
if (fs.existsSync(backendImg)) {
  fs.mkdirSync(imgDest, { recursive: true });
  for (const entry of fs.readdirSync(backendImg)) {
    if (entry.startsWith("sharp")) {
      const dest = path.join(imgDest, entry);
      if (!fs.existsSync(dest) && copyDir(path.join(backendImg, entry), dest)) copied++;
    }
  }
}

const backendSharp = path.join(root, "backend/node_modules/sharp");
if (!fs.existsSync(path.join(destModules, "sharp")) && copyDir(backendSharp, path.join(destModules, "sharp"))) {
  copied++;
}

console.log(`Native deps copied: ${copied} package(s)`);
