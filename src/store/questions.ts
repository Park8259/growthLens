import { create } from "zustand";
import { persist } from "zustand/middleware";

// 진료 요약의 "선생님께 물어볼 것" (보호자가 적어 두는 질문)
interface QuestionsState {
  questions: string[];
  add: (q: string) => void;
  remove: (index: number) => void;
}

export const useQuestionsStore = create<QuestionsState>()(
  persist(
    (set) => ({
      questions: ["공을 주고받다가 자꾸 던지기만 해요.\n이런 행동도 괜찮은 걸까요?"],
      add: (q) => set((s) => ({ questions: [...s.questions, q] })),
      remove: (index) => set((s) => ({ questions: s.questions.filter((_, i) => i !== index) })),
    }),
    { name: "growthlens-questions" }
  )
);
