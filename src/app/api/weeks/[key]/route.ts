import { NextRequest, NextResponse } from "next/server";
import { deleteWeek, getWeek } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: { key: string } }
) {
  const entry = await getWeek(params.key);
  if (!entry) {
    return NextResponse.json(null);
  }
  return NextResponse.json(entry);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { key: string } }
) {
  await deleteWeek(params.key);
  return NextResponse.json({ ok: true });
}
