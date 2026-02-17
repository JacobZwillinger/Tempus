import { NextRequest, NextResponse } from "next/server";
import { setWeek, getWeek, getImagesDir } from "@/lib/storage";
import { weekKey } from "@/lib/dates";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const isoYear = Number(formData.get("isoYear"));
  const isoWeek = Number(formData.get("isoWeek"));

  if (!file || !isoYear || !isoWeek) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const key = weekKey(isoYear, isoWeek);

  // Delete old image if replacing
  const existing = getWeek(key);
  if (existing) {
    const oldPath = path.join(process.cwd(), "public", existing.imagePath);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  // Process image with sharp: resize to max 1600px width, compress as JPEG
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${key}.jpg`;
  const outputDir = path.join(process.cwd(), "data", "images");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, filename);

  await sharp(buffer)
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(outputPath);

  const imagePath = `/api/images/${filename}`;

  setWeek(key, {
    isoYear,
    isoWeek,
    imagePath,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, imagePath });
}
