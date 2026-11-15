import { useNavigate } from "react-router-dom";
import { useRecordsStore } from "../../store/records";
import BottomNav from "../../components/BottomNav";
import NavBar from "../../components/NavBar";
import type { TaskType } from "../../types/analysis";

const TASK_LABEL: Record<TaskType, string> = {
  name_response: "호명반응",
  imitation: "동작 모방",
  ball_play: "공 주고받기",
};

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
}

function fmtMetric(result: { status: string; metric?: { value: number; unit: string } }): string {
  if (result.status === "retry_needed") return "재촬영 필요";
  if (!result.metric) return "-";
  const { value, unit } = result.metric;
  return `${value}${unit === "seconds" ? "초" : "회"}`;
}

const NAV_ITEMS = [
  { label: "과제", path: "/tasks", icon: (a: boolean) => <TaskIcon active={a} /> },
  { label: "기록", path: "/timeline", icon: (a: boolean) => <TimelineIcon active={a} /> },
  { label: "변화", path: "/charts", icon: (a: boolean) => <ChartIcon active={a} /> },
];

export default function TimelineScreen() {
  const navigate = useNavigate();
  const records = useRecordsStore((s) => s.records);

  const sorted = [...records].sort((a, b) => b.recordedAt - a.recordedAt);

  const groups: Record<string, typeof sorted> = {};
  for (const r of sorted) {
    const key = fmtDate(r.recordedAt);
    (groups[key] ??= []).push(r);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      <NavBar title="기록" back={false} />

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-gray-400 text-sm">아직 기록이 없어요</p>
            <button
              onClick={() => navigate("/tasks")}
              className="px-6 py-3 rounded-2xl bg-gray-900 text-white text-sm font-medium"
            >
              과제 하러 가기
            </button>
          </div>
        ) : (
          Object.entries(groups).map(([date, recs]) => (
            <div key={date} className="mb-6">
              <p className="text-xs font-medium text-gray-400 mb-2">{date}</p>
              <div className="space-y-0">
                {recs.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => navigate(`/replay/${r.id}`)}
                    className="w-full flex items-center justify-between py-3 border-b border-gray-50 last:border-0 text-left"
                  >
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {TASK_LABEL[r.taskType]}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${r.result.status === "retry_needed" ? "text-orange-500" : "text-gray-900"}`}>
                        {fmtMetric(r.result)}
                      </span>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M5 3l4 4-4 4" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav items={NAV_ITEMS} />
    </div>
  );
}

function TaskIcon({ active }: { active: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active ? "#111" : "#aaa"} strokeWidth="1.5" strokeLinecap="round"><rect x="4" y="4" width="14" height="14" rx="2"/><path d="M8 11h6M8 14h4"/></svg>;
}
function TimelineIcon({ active }: { active: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active ? "#111" : "#aaa"} strokeWidth="1.5" strokeLinecap="round"><path d="M4 6h14M4 11h14M4 16h8"/></svg>;
}
function ChartIcon({ active }: { active: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active ? "#111" : "#aaa"} strokeWidth="1.5" strokeLinecap="round"><path d="M4 17 L8 11 L12 13 L18 6"/></svg>;
}
