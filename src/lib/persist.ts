import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), ".data");

export function loadJson<T>(name: string, fallback: T): T {
  try {
    const file = path.join(DATA_DIR, name);
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function saveJson<T>(name: string, data: T) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, name), JSON.stringify(data, null, 2), "utf8");
}
