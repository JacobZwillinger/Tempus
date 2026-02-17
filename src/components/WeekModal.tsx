"use client";

import { useRef, useState } from "react";

interface WeekModalProps {
  isoYear: number;
  isoWeek: number;
  imagePath: string | null;
  state: "past-empty" | "past-filled" | "current";
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function WeekModal({
  isoYear,
  isoWeek,
  imagePath,
  state,
  onClose,
  onUpload,
  onDelete,
}: WeekModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File must be under 5 MB.");
      return;
    }
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  };

  const weekLabel = `${isoYear}, Week ${isoWeek}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <span className="text-sm font-medium text-neutral-600">{weekLabel}</span>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 text-lg leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-5">
          {imagePath ? (
            <div>
              <img
                src={imagePath}
                alt={weekLabel}
                className="w-full rounded mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 text-sm py-2 border border-neutral-200 rounded hover:bg-neutral-50 transition-colors disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Replace"}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 text-sm py-2 border border-red-200 text-red-600 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-neutral-400 mb-4">No photo for this week.</p>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="text-sm py-2 px-6 bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload photo"}
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
      </div>
    </div>
  );
}
