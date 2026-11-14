import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChildProfile } from "../types/child";

interface ChildState {
  profile: ChildProfile | null;
  setProfile: (profile: ChildProfile) => void;
  clearProfile: () => void;
}

export const useChildStore = create<ChildState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    { name: "growthlens-child" }
  )
);
