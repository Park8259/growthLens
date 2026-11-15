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

function median(arr: number[]): number {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function rollingMedians(values: number[]): number[] {
  return values.map((_, i) => {
    const win = values.slice(Math.max(0, i - 2), i + 1);
    return median(win);
  });
}

function MiniLineChart({ values }: { values: number[] }) {
  const W = 300, H = 70, pad = 10;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => ({
    x: pad + (i / (values.length - 1)) * (W - pad * 2),
    y: H - pad - ((v - min) / range) * (H - pad * 2),
  }));
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  return (
    <div className="bg-gray-50 rounded-2xl p-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        <path d={d} stroke="#111" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#111" />)}
      </svg>
    </div>
  );
}

const NAV_ITEMS = [
  { label: "과제", path: "/tasks", icon: (a: boolean) => <TaskIcon active={a} /> },
  { label: "기록", path: "/timeline", icon: (a: boolean) => <TimelineIcon active={a} /> },
  { label: "변화", path: "/charts", icon: (a: boolean) => <ChartIcon active={a} /> },
];

export default function ChartsScreen() {
  const navigate = useNavigate();
  const records = useRecordsStore((s) => s.records);

  const sorted = [...records].sort((a, b) => a.recordedAt - b.recordedAt);

  if (sorted.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
        <NavBar title="변화" back={false} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-gray-400 text-sm">첫 기록을 남겨 보세요</p>
          <button onClick={() => navigate("/tasks")} className="px-6 py-3 rounded-2xl bg-gray-900 text-white text-sm font-medium">
            과제 하러 가기
          </button>
        </div>
        <BottomNav items={NAV_ITEMS} />
      </div>
    );
  }

  // 1군: ambient 있는 기록만
  const ambientRecords = sorted.filter((r) => r.result.ambient);
  const orientValues = ambientRecords.map((r) => {
    const a = r.result.ambient!;
    return a.bothInFrameSec > 0 ? a.caregiverOrientSec / a.bothInFrameSec : 0;
  });
  const activityValues = ambientRecords.map((r) => {
    const a = r.result.ambient!;
    return a.bothInFrameSec > 0 ? a.activitySec / a.bothInFrameSec : 0;
  });

  // 2군: 과제별 성공 기록
  const taskRecords = (t: TaskType) =>
    sorted.filter((r) => r.taskType === t && r.result.status === "success" && r.result.metric);

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      <NavBar title="변화" back={false} />

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-8">
        {/* 1군 */}
        <div>
          <p className="text-xs font-medium text-gray-400 mb-4">1군 — 공통 지표</p>
          {[
            { label: "보호자 지향 비율", values: orientValues },
            { label: "활동량 비율", values: activityValues },
          ].map(({ label, values }) => (
            <div key={label} className="mb-5">
              <p className="text-sm font-medium text-gray-800 mb-2">{label}</p>
              {values.length < 3 ? (
                <div className="bg-gray-50 rounded-2xl px-4 py-5 text-center">
                  <p className="text-xs text-gray-400">기록이 3회 이상 쌓이면 변화를 보여드립니다 (현재 {values.length}회)</p>
                </div>
              ) : (
                <MiniLineChart values={rollingMedians(values)} />
              )}
            </div>
          ))}
        </div>

        {/* 2군 */}
        <div>
          <p className="text-xs font-medium text-gray-400 mb-4">2군 — 과제 지표</p>
          {(["name_response", "imitation", "ball_play"] as TaskType[]).map((t) => {
            const recs = taskRecords(t);
            return (
              <div key={t} className="mb-5">
                <p className="text-sm font-medium text-gray-800 mb-2">{TASK_LABEL[t]}</p>
                {recs.length === 0 ? (
                  <p className="text-xs text-gray-400">기록 없음</p>
                ) : (
                  <div className="space-y-1">
                    {recs.map((r) => (
                      <div key={r.id} className="flex justify-between text-sm text-gray-700">
                        <span className="text-gray-400">
                          {new Date(r.recordedAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                        </span>
                        <span className="font-medium tabular-nums">
                          {r.result.metric!.value}{r.result.metric!.unit === "seconds" ? "초" : "회"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
