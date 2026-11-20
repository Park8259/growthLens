import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DoctorNote {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  text: string;
  isShared: boolean; // true면 부모 앱에 공개
  nextTasks?: string[]; // 다음 진료 전까지 보호자에게 보낼 관찰 과제
}

const SEED_NOTES: DoctorNote[] = [
  { id: "seed-n1", patientId: "p1", date: "2026-11-11", text: "대근육 발달 양호. 좌우 균형 개선됨. 다음 세션에서 소근육 집중 권장.", isShared: false },
  { id: "seed-n2", patientId: "p1", date: "2026-11-04", text: "지난 달보다 보호자 지향 시간이 늘었습니다.\n집에서 눈 맞춤 놀이 꾸준히 해주세요.", isShared: true },
  { id: "seed-n3", patientId: "p1", date: "2026-10-10", text: "초진. 월령 대비 발달 지표 전반적으로 양호. 사회성 반응 시간 모니터링 시작.", isShared: false },
];

interface NotesState {
  notes: DoctorNote[];
  addNote: (n: Omit<DoctorNote, "id">) => void;
  deleteNote: (id: string) => void;
  toggleShare: (id: string) => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      notes: SEED_NOTES,
      addNote: (n) =>
        set((s) => ({ notes: [{ ...n, id: crypto.randomUUID() }, ...s.notes] })),
      deleteNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
      toggleShare: (id) =>
        set((s) => ({
          notes: s.notes.map((n) => n.id === id ? { ...n, isShared: !n.isShared } : n),
        })),
    }),
    {
      name: "growthlens-notes",
      // 예시 메모 문구를 고치면 version을 올려요. 이미 저장된 기기에서도 예시 메모(seed-*)만 새 문구로 바꿔요.
      version: 1,
      migrate: (persisted) => {
        const s = persisted as NotesState;
        const seed = new Map(SEED_NOTES.map((n) => [n.id, n]));
        return {
          ...s,
          notes: (s.notes ?? []).map((n) => (seed.has(n.id) ? { ...n, text: seed.get(n.id)!.text } : n)),
        };
      },
    }
  )
);
