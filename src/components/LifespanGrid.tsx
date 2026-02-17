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

const DOT = 8;
const GAP = 2;
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

  // Year labels: show every 5 years
  const yearLabels = useMemo(() => {
    const labels: { index: number; label: string }[] = [];
    for (let i = 0; i < totalYears; i += 5) {
      labels.push({ index: i, label: String(i) });
    }
    return labels;
  }, [totalYears]);

  return (
    <div className="w-full overflow-x-auto pb-4">
      {/* Year labels */}
      <div className="relative" style={{ height: 20, width: totalYears * CELL }}>
        {yearLabels.map(({ index, label }) => (
          <span
            key={index}
            className="absolute text-[9px] text-neutral-400"
            style={{ left: index * CELL }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div
        className="relative"
        style={{
          width: totalYears * CELL,
          height: 52 * CELL,
        }}
      >
        {Array.from({ length: 52 }, (_, weekIdx) =>
          Array.from({ length: totalYears }, (_, yearIdx) => {
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
                  left: yearIdx * CELL,
                  top: weekIdx * CELL,
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
      return "bg-neutral-100";
    case "past-empty":
      return "bg-neutral-300 cursor-pointer hover:bg-neutral-400 transition-colors";
    case "past-filled":
      return "bg-neutral-800 cursor-pointer hover:bg-neutral-900 transition-colors";
    case "current":
      return "bg-amber-500 cursor-pointer hover:bg-amber-600 transition-colors";
  }
}
