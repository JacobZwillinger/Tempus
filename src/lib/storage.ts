import { Redis } from "@upstash/redis";
import { put, del } from "@vercel/blob";

const redis = Redis.fromEnv();

const SETTINGS_KEY = "tempus:settings";
const WEEKS_KEY = "tempus:weeks";

// --- Settings ---

export interface Settings {
  birthdate: string;
  expectancyYears: number;
}

export async function getSettings(): Promise<Settings | null> {
  return redis.get<Settings>(SETTINGS_KEY);
}

export async function saveSettings(settings: Settings): Promise<void> {
  await redis.set(SETTINGS_KEY, settings);
}

// --- Week Entries ---

export interface WeekEntry {
  isoYear: number;
  isoWeek: number;
  imagePath: string;
  createdAt: string;
}

type WeeksMap = Record<string, WeekEntry>;

export async function getAllWeeks(): Promise<WeeksMap> {
  const data = await redis.get<WeeksMap>(WEEKS_KEY);
  return data ?? {};
}

export async function getWeek(key: string): Promise<WeekEntry | null> {
  const weeks = await getAllWeeks();
  return weeks[key] ?? null;
}

export async function setWeek(key: string, entry: WeekEntry): Promise<void> {
  const weeks = await getAllWeeks();
  weeks[key] = entry;
  await redis.set(WEEKS_KEY, weeks);
}

export async function deleteWeek(key: string): Promise<void> {
  const weeks = await getAllWeeks();
  const entry = weeks[key];
  if (entry) {
    try {
      await del(entry.imagePath);
    } catch {
      // Ignore if blob already gone
    }
    delete weeks[key];
    await redis.set(WEEKS_KEY, weeks);
  }
}

// --- Image Storage ---

export async function uploadImage(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const filename = `tempus/${key}.jpg`;
  const blob = await put(filename, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });
  return blob.url;
}
