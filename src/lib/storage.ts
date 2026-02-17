import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const WEEKS_FILE = path.join(DATA_DIR, "weeks.json");
const IMAGES_DIR = path.join(DATA_DIR, "images");

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// --- Settings ---

export interface Settings {
  birthdate: string; // ISO date string
  expectancyYears: number;
}

export function getSettings(): Settings | null {
  ensureDirs();
  if (!fs.existsSync(SETTINGS_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
  } catch {
    return null;
  }
}

export function saveSettings(settings: Settings): void {
  ensureDirs();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

// --- Week Entries ---

export interface WeekEntry {
  isoYear: number;
  isoWeek: number;
  imagePath: string;
  createdAt: string;
}

type WeeksMap = Record<string, WeekEntry>;

function readWeeks(): WeeksMap {
  ensureDirs();
  if (!fs.existsSync(WEEKS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(WEEKS_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function writeWeeks(weeks: WeeksMap): void {
  ensureDirs();
  fs.writeFileSync(WEEKS_FILE, JSON.stringify(weeks, null, 2));
}

export function getAllWeeks(): WeeksMap {
  return readWeeks();
}

export function getWeek(key: string): WeekEntry | null {
  const weeks = readWeeks();
  return weeks[key] || null;
}

export function setWeek(key: string, entry: WeekEntry): void {
  const weeks = readWeeks();
  weeks[key] = entry;
  writeWeeks(weeks);
}

export function deleteWeek(key: string): void {
  const weeks = readWeeks();
  const entry = weeks[key];
  if (entry) {
    // Delete the image file
    const imgPath = path.join(process.cwd(), "public", entry.imagePath);
    if (fs.existsSync(imgPath)) {
      fs.unlinkSync(imgPath);
    }
    delete weeks[key];
    writeWeeks(weeks);
  }
}

// --- Image Storage ---

export function getImagesDir(): string {
  ensureDirs();
  return IMAGES_DIR;
}
