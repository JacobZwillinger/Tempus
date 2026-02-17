import { NextResponse } from "next/server";
import { getAllWeeks } from "@/lib/storage";

export async function GET() {
  const weeks = await getAllWeeks();
  return NextResponse.json(weeks);
}
