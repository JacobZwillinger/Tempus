"use client";

import { useCallback, useEffect, useState } from "react";
import LifespanGrid from "@/components/LifespanGrid";

const BIRTHDATE = "1987-08-17";
const EXPECTANCY_YEARS = 80;

interface WeekEntry {
  isoYear: number;
  isoWeek: number;
  imagePath: string;
  createdAt: string;
}

export default function Home() {
  const [weeks, setWeeks] = useState<Record<string, WeekEntry>>({});
  const [loaded, setLoaded] = useState(false);

  const fetchWeeks = useCallback(async () => {
    const res = await fetch("/api/weeks");
    const data = await res.json();
    setWeeks(data);
    setLoaded(true);
  }, []);

  useEffect(() => {
    fetchWeeks();
  }, [fetchWeeks]);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-8">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-light tracking-tight text-slate-200">Tempus</h1>
        <p className="text-xs text-slate-500 mt-1 italic">
          Memento mori.
        </p>
      </header>

      <LifespanGrid
        birthdate={BIRTHDATE}
        expectancyYears={EXPECTANCY_YEARS}
        weeks={weeks}
        onRefresh={fetchWeeks}
      />
    </div>
  );
}
