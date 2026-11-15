import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TaskType, AnalysisResult } from "../types/analysis";

export interface SessionRecord {
  id: string;
  taskType: TaskType;
  recordedAt: number;  // Unix ms
  result: AnalysisResult;
}

interface RecordsState {
  records: SessionRecord[];
  addRecord: (r: Omit<SessionRecord, "id">) => void;
  deleteRecord: (id: string) => void;
}

export const useRecordsStore = create<RecordsState>()(
  persist(
    (set) => ({
      records: [],
      addRecord: (r) =>
        set((s) => ({
          records: [...s.records, { ...r, id: crypto.randomUUID() }],
        })),
      deleteRecord: (id) =>
        set((s) => ({ records: s.records.filter((r) => r.id !== id) })),
    }),
    { name: "growthlens-records" }
  )
);
