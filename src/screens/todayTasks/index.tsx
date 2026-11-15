import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChildStore } from "../../store/child";
import { useRecordsStore } from "../../store/records";
import { correctedAgeMonths } from "../../utils/ageCalc";
import BottomNav from "../../components/BottomNav";
import type { TaskType } from "../../types/analysis";

const TASK_LABEL: Record<TaskType, string> = {
  name_response: "호명반응",
  imitation: "동작 모방",
  ball_play: "공 주고받기",
};
const TASK_DESC: Record<TaskType, string> = {
  name_response: "이름을 부르면 얼마나 빨리 돌아보는지 봅니다",
  imitation: "보호자 동작을 아이가 따라 하는지 봅니다",
  ball_play: "공을 보호자와 주고받는지 봅니다",
};
const TASK_DURATION: Record<TaskType, string> = {
  name_response: "약 30초",
  imitation: "약 30초",
  ball_play: "약 1분",
};
const TASKS: TaskType[] = ["name_response", "imitation", "ball_play"];

const NAV = [
  {
    label: "과제", path: "/tasks",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active ? "#111" : "#aaa"} strokeWidth="1.5" strokeLinecap="round">
        <rect x="4" y="3" width="14" height="16" rx="2" />
        <line x1="8" y1="8" x2="14" y2="8" /><line x1="8" y1="12" x2="14" y2="12" /><line x1="8" y1="16" x2="11" y2="16" />
      </svg>
    ),
  },
  {
    label: "기록", path: "/timeline",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active ? "#111" : "#aaa"} strokeWidth="1.5" strokeLinecap="round">
        <circle cx="11" cy="11" r="8" /><polyline points="11,7 11,11 14,13" />
      </svg>
    ),
  },
  {
    label: "변화", path: "/charts",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active ? "#111" : "#aaa"} strokeWidth="1.5" strokeLinecap="round">
        <polyline points="3,16 8,10 13,13 19,6" />
      </svg>
    ),
  },
];

const todayStr = () => new Date().toISOString().split("T")[0];

export default function TodayTasksScreen() {
  const navigate = useNavigate();
  const profile = useChildStore((s) => s.profile);
  const records = useRecordsStore((s) => s.records);
  const resetToSeed = useRecordsStore((s) => s.resetToSeed);
  const clearAll = useRecordsStore((s) => s.clearAll);

  useEffect(() => {
    if (!profile) navigate("/");
  }, [profile, navigate]);

  if (!profile) return null;

  const ageMonths = correctedAgeMonths(profile.birthDate, profile.gestationalWeeks);
  const today = todayStr();

  const doneToday = new Set(
    records
      .filter((r) => new Date(r.recordedAt).toISOString().split("T")[0] === today)
      .map((r) => r.taskType)
  );

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      <div className="px-5 pt-14 pb-4">
        <p className="text-xs text-gray-400 mb-0.5">교정월령 {ageMonths}개월</p>
        <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
      </div>

      <div className="flex-1 px-5 space-y-3 pb-4">
        {TASKS.map((taskType) => {
          const done = doneToday.has(taskType);
          return (
            <button
              key={taskType}
              onClick={() => navigate(`/task-guide/${taskType}`)}
              className="w-full text-left p-4 rounded-2xl border border-gray-200 flex items-start justify-between gap-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">{TASK_LABEL[taskType]}</span>
                  {done && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">완료</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-1">{TASK_DESC[taskType]}</p>
                <p className="text-xs text-gray-400">{TASK_DURATION[taskType]}</p>
                {taskType === "ball_play" && (
                  <p className="text-xs text-gray-500 mt-1.5 bg-gray-50 rounded-lg px-2 py-1">
                    준비물: 밝은 단색 공 (지름 10~20cm)
                  </p>
                )}
              </div>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round">
                <path d="M6 4l5 5-5 5" />
              </svg>
            </button>
          );
        })}
      </div>

      {/* 목데이터 컨트롤 — 디자인팀 데모용 */}
      <div className="px-5 pb-2 flex gap-2">
        <button
          onClick={resetToSeed}
          className="flex-1 py-2 rounded-xl border border-dashed border-gray-300 text-xs text-gray-400"
        >
          목데이터 넣기
        </button>
        <button
          onClick={clearAll}
          className="flex-1 py-2 rounded-xl border border-dashed border-gray-300 text-xs text-gray-400"
        >
          데이터 초기화
        </button>
      </div>

      <BottomNav items={NAV} />
    </div>
  );
}
