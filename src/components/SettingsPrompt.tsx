"use client";

import { useState } from "react";

interface SettingsPromptProps {
  onSave: (birthdate: string, expectancyYears: number) => void;
}

export default function SettingsPrompt({ onSave }: SettingsPromptProps) {
  const [birthdate, setBirthdate] = useState("");
  const [expectancy, setExpectancy] = useState(80);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthdate) return;
    onSave(birthdate, expectancy);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <form onSubmit={handleSubmit} className="max-w-sm w-full px-6">
        <h1 className="text-3xl font-light tracking-tight mb-2">Tempus</h1>
        <p className="text-sm text-neutral-400 mb-10">
          Your life in weeks.
        </p>

        <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
          Date of birth
        </label>
        <input
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          required
          className="w-full border border-neutral-200 rounded px-3 py-2 text-sm mb-6 focus:outline-none focus:border-neutral-400"
        />

        <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
          Life expectancy (years)
        </label>
        <input
          type="number"
          value={expectancy}
          onChange={(e) => setExpectancy(Number(e.target.value))}
          min={1}
          max={150}
          required
          className="w-full border border-neutral-200 rounded px-3 py-2 text-sm mb-8 focus:outline-none focus:border-neutral-400"
        />

        <button
          type="submit"
          className="w-full bg-neutral-900 text-white text-sm py-2.5 rounded hover:bg-neutral-800 transition-colors"
        >
          Begin
        </button>
      </form>
    </div>
  );
}
