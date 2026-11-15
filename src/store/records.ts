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
  resetToSeed: () => void;
  clearAll: () => void;
}

const DAY = 24 * 60 * 60 * 1000;

function makeSeed(): SessionRecord[] {
  const now = Date.now();
  const ambient = (orient: number, activity: number) => ({
    bothInFrameSec: 52,
    caregiverOrientSec: orient,
    activitySec: activity,
    contactSec: 2.8,
  });

  const rows: Omit<SessionRecord, "id">[] = [
    // 3주 전
    { taskType: "name_response", recordedAt: now - 21 * DAY, result: { status: "success", metric: { value: 4.2, unit: "seconds", label: "호명 후 반응 지연" } } },
    { taskType: "imitation",     recordedAt: now - 20 * DAY, result: { status: "success", metric: { value: 5.1, unit: "seconds", label: "모방까지의 지연" }, ambient: ambient(21, 14) } },
    { taskType: "ball_play",     recordedAt: now - 19 * DAY, result: { status: "success", metric: { value: 2,   unit: "count",   label: "주고받은 횟수"  }, ambient: ambient(23, 16) } },
    // 2주 전
    { taskType: "name_response", recordedAt: now - 14 * DAY, result: { status: "success", metric: { value: 3.6, unit: "seconds", label: "호명 후 반응 지연" } } },
    { taskType: "imitation",     recordedAt: now - 13 * DAY, result: { status: "success", metric: { value: 4.0, unit: "seconds", label: "모방까지의 지연" }, ambient: ambient(27, 20) } },
    { taskType: "ball_play",     recordedAt: now - 12 * DAY, result: { status: "success", metric: { value: 3,   unit: "count",   label: "주고받은 횟수"  }, ambient: ambient(29, 22) } },
    // 1주 전
    { taskType: "name_response", recordedAt: now -  7 * DAY, result: { status: "success", metric: { value: 2.8, unit: "seconds", label: "호명 후 반응 지연" } } },
    { taskType: "imitation",     recordedAt: now -  6 * DAY, result: { status: "success", metric: { value: 3.2, unit: "seconds", label: "모방까지의 지연" }, ambient: ambient(32, 25) } },
    { taskType: "ball_play",     recordedAt: now -  5 * DAY, result: { status: "success", metric: { value: 4,   unit: "count",   label: "주고받은 횟수"  }, ambient: ambient(35, 27) } },
  ];

  return rows.map((r) => ({ ...r, id: crypto.randomUUID() }));
}

export const useRecordsStore = create<RecordsState>()(
  persist(
    (set) => ({
      records: makeSeed(), // 초기값이 seed — localStorage에 데이터 있으면 persist가 덮어씀
      addRecord: (r) =>
        set((s) => ({
          records: [...s.records, { ...r, id: crypto.randomUUID() }],
        })),
      deleteRecord: (id) =>
        set((s) => ({ records: s.records.filter((r) => r.id !== id) })),
      resetToSeed: () => set({ records: makeSeed() }),
      clearAll: () => set({ records: [] }),
    }),
    {
      name: "growthlens-records",
      merge: (persisted, current) => {
        const p = persisted as Partial<RecordsState>;
        // localStorage에 빈 배열이 저장돼 있으면 seed 유지
        if (!p.records || p.records.length === 0) return current;
        return { ...current, ...p };
      },
    }
  )
);
