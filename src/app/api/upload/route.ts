import { NextRequest, NextResponse } from "next/server";
import { setWeek, getWeek, uploadImage } from "@/lib/storage";
import { weekKey } from "@/lib/dates";
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

  // Delete old image handled by deleteWeek if replacing
  const existing = await getWeek(key);
  if (existing) {
    // uploadImage with same key will overwrite in blob
  }

  // Process image with sharp: resize to max 1600px width, compress as JPEG
  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const processedBuffer = await sharp(rawBuffer)
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  const imagePath = await uploadImage(key, processedBuffer, "image/jpeg");

  await setWeek(key, {
    isoYear,
    isoWeek,
    imagePath,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, imagePath });
}
