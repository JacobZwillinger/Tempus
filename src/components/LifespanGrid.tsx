"use client";

import { useMemo, useState, useCallback } from "react";
import { getCurrentISOWeek, getWeekState, weekKey, type WeekState } from "@/lib/dates";
import WeekModal from "./WeekModal";

interface WeekEntry {
  isoYear: number;
  isoWeek: number;
  imagePath: string;
  createdAt: string;
}

interface LifespanGridProps {
  birthdate: string;
  expectancyYears: number;
  weeks: Record<string, WeekEntry>;
  onRefresh: () => void;
}

// Columns = 52 weeks, Rows = years
const DOT = 12;
const GAP = 3;
const CELL = DOT + GAP;

export default function LifespanGrid({
  birthdate,
  expectancyYears,
  weeks,
  onRefresh,
}: LifespanGridProps) {
  const [selectedWeek, setSelectedWeek] = useState<{
    isoYear: number;
    isoWeek: number;
    state: WeekState;
  } | null>(null);

  const currentWeek = useMemo(() => getCurrentISOWeek(), []);

  const birthDate = useMemo(() => new Date(birthdate), [birthdate]);
  const birthISOYear = useMemo(() => {
    const d = new Date(
      Date.UTC(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    return d.getUTCFullYear();
  }, [birthDate]);

  const totalYears = expectancyYears;

  const handleCellClick = useCallback(
    (isoYear: number, isoWeek: number, state: WeekState) => {
      if (state === "future") return;
      setSelectedWeek({ isoYear, isoWeek, state });
    },
    []
  );

  const handleUpload = useCallback(
    async (file: File) => {
      if (!selectedWeek) return;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("isoYear", String(selectedWeek.isoYear));
      formData.append("isoWeek", String(selectedWeek.isoWeek));
      await fetch("/api/upload", { method: "POST", body: formData });
      onRefresh();
    },
    [selectedWeek, onRefresh]
  );

  const handleDelete = useCallback(async () => {
    if (!selectedWeek) return;
    const key = weekKey(selectedWeek.isoYear, selectedWeek.isoWeek);
    await fetch(`/api/weeks/${key}`, { method: "DELETE" });
    setSelectedWeek(null);
    onRefresh();
  }, [selectedWeek, onRefresh]);

  const selectedKey = selectedWeek
    ? weekKey(selectedWeek.isoYear, selectedWeek.isoWeek)
    : null;
  const selectedEntry = selectedKey ? weeks[selectedKey] ?? null : null;

  // Year labels along left side, every 5 years
  const yearLabels = useMemo(() => {
    const labels: { index: number; label: string }[] = [];
    for (let i = 0; i < totalYears; i += 10) {
      labels.push({ index: i, label: String(birthISOYear + i) });
    }
    return labels;
  }, [totalYears, birthISOYear]);

  const LABEL_WIDTH = 40;

  return (
    <div className="w-full overflow-auto pb-4">
      <div className="inline-flex">
        {/* Year labels column */}
        <div
          className="relative shrink-0"
          style={{ width: LABEL_WIDTH, height: totalYears * CELL }}
        >
          {yearLabels.map(({ index, label }) => (
            <span
              key={index}
              className="absolute text-[10px] text-slate-500 right-2"
              style={{ top: index * CELL + DOT / 2 - 5 }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Grid: columns=weeks (52), rows=years */}
        <div
          className="relative"
          style={{
            width: 52 * CELL,
            height: totalYears * CELL,
          }}
        >
          {Array.from({ length: totalYears }, (_, yearIdx) =>
            Array.from({ length: 52 }, (_, weekIdx) => {
              const isoYear = birthISOYear + yearIdx;
              const isoWeek = weekIdx + 1;
              const key = weekKey(isoYear, isoWeek);
              const hasFill = !!weeks[key];
              const state = getWeekState(isoYear, isoWeek, currentWeek, hasFill);

              return (
                <div
                  key={key}
                  className={cellClass(state)}
                  style={{
                    position: "absolute",
                    left: weekIdx * CELL,
                    top: yearIdx * CELL,
                    width: DOT,
                    height: DOT,
                    borderRadius: "50%",
                  }}
                  onClick={
                    state !== "future"
                      ? () => handleCellClick(isoYear, isoWeek, state)
                      : undefined
                  }
                />
              );
            })
          )}
        </div>
      </div>

      {selectedWeek && selectedWeek.state !== "future" && (
        <WeekModal
          isoYear={selectedWeek.isoYear}
          isoWeek={selectedWeek.isoWeek}
          imagePath={selectedEntry?.imagePath ?? null}
          state={
            selectedWeek.state === "current"
              ? "current"
              : selectedEntry
                ? "past-filled"
                : "past-empty"
          }
          onClose={() => setSelectedWeek(null)}
          onUpload={handleUpload}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

function cellClass(state: WeekState): string {
  switch (state) {
    case "future":
      return "bg-slate-800/40";
    case "past-empty":
      return "bg-slate-600 cursor-pointer hover:bg-slate-500 transition-colors";
    case "past-filled":
      return "bg-slate-200 cursor-pointer hover:bg-white transition-colors";
    case "current":
      return "bg-amber-500 cursor-pointer hover:bg-amber-400 transition-colors";
  }
}
