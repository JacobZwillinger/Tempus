"use client";

import { useCallback, useEffect, useState } from "react";
import SettingsPrompt from "@/components/SettingsPrompt";
import LifespanGrid from "@/components/LifespanGrid";

interface Settings {
  birthdate: string;
  expectancyYears: number;
}

interface WeekEntry {
  isoYear: number;
  isoWeek: number;
  imagePath: string;
  createdAt: string;
}

export default function Home() {
  const [settings, setSettings] = useState<Settings | null | undefined>(undefined);
  const [weeks, setWeeks] = useState<Record<string, WeekEntry>>({});

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setSettings(data);
  }, []);

  const fetchWeeks = useCallback(async () => {
    const res = await fetch("/api/weeks");
    const data = await res.json();
    setWeeks(data);
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchWeeks();
  }, [fetchSettings, fetchWeeks]);

  const handleSaveSettings = useCallback(
    async (birthdate: string, expectancyYears: number) => {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthdate, expectancyYears }),
      });
      setSettings({ birthdate, expectancyYears });
    },
    []
  );

  // Loading
  if (settings === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-300 text-sm">Loading...</div>
      </div>
    );
  }

  // No settings yet → prompt
  if (!settings) {
    return <SettingsPrompt onSave={handleSaveSettings} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-light tracking-tight">Tempus</h1>
        <p className="text-xs text-neutral-400 mt-1 italic">
          Memento mori.
        </p>
      </header>

      <LifespanGrid
        birthdate={settings.birthdate}
        expectancyYears={settings.expectancyYears}
        weeks={weeks}
        onRefresh={fetchWeeks}
      />
    </div>
  );
}
