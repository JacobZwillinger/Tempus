import { NextResponse } from "next/server";
import { getAllWeeks } from "@/lib/storage";

export async function GET() {
  const weeks = getAllWeeks();
  return NextResponse.json(weeks);
}
