import { NextRequest, NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/storage";

export async function GET() {
  const settings = getSettings();
  if (!settings) {
    return NextResponse.json(null);
  }
  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { birthdate, expectancyYears } = body;

  if (!birthdate || !expectancyYears) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const settings = {
    birthdate: String(birthdate),
    expectancyYears: Number(expectancyYears),
  };

  saveSettings(settings);
  return NextResponse.json(settings);
}
