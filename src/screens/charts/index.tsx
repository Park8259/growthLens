import { useNavigate } from "react-router-dom";
import { useRecordsStore } from "../../store/records";
import ParentNav from "../../components/ParentNav";
import { TrendIcon } from "../../components/icons";
import { TASK_LABEL, TASK_ORDER, unitOf } from "../../data/tasks";
import TaskIcon from "../../components/TaskIcon";

// Figma 부모 버전 "변화". 기록이 3회 미만이면 칸 3개 진행 막대, 3회 이상이면 꺾은선 그래프
const NEED = 3;

function median(arr: number[]) {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
/** 최근 3개 중앙값으로 흔들림을 줄임 */
const rolling = (v: number[]) => v.map((_, i) => median(v.slice(Math.max(0, i - 2), i + 1)));

const fmtDay = (ts: number) => {
  const d = new Date(ts);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};

export default function ChartsScreen() {
  const navigate = useNavigate();
  const records = useRecordsStore((s) => s.records);
  const sorted = [...records].sort((a, b) => a.recordedAt - b.recordedAt);

  const ambient = sorted.filter((r) => r.result.ambient).map((r) => r.result.ambient!);
  const pct = (key: "caregiverOrientSec" | "activitySec") =>
    ambient.map((a) => (a.bothInFrameSec > 0 ? (a[key] / a.bothInFrameSec) * 100 : 0));

  const commons = [
    { label: "보호자 지향 비율", desc: "보호자를 바라보거나 다가간 시간", values: pct("caregiverOrientSec") },
    { label: "활동량 비율", desc: "촬영 중 움직인 시간", values: pct("activitySec") },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      <div className="flex-1 px-5 pt-16 pb-6">
        <h1 className="text-2xl font-bold text-p-title">변화</h1>

        {ambient.length < NEED && (
          <div className="mt-[18px] flex h-[103px] items-center gap-3.5 rounded-2xl bg-brand-soft px-[18px]">
            <TrendIcon size={30} className="text-brand-deep flex-shrink-0" />
            <div>
              <p className="text-base font-bold text-p-title">
                {ambient.length === 0 ? "첫 기록을 남겨보세요!" : "첫 기록을 남겼어요!"}
              </p>
              <p className="mt-2 text-[13px] leading-5 text-p-body">
                일주일에 한 번씩 찍으면 3주 뒤부터
                <br />
                변화 그래프를 볼 수 있어요
              </p>
            </div>
          </div>
        )}

        <h2 className="mt-6 px-2.5 text-base font-bold text-p-title">1군 · 공통 지표</h2>
        <div className="mt-3 space-y-2.5">
          {commons.map(({ label, desc, values }) => (
            <div key={label} className="rounded-2xl bg-p-card px-4 pt-[18px] pb-4">
              <p className="text-[15px] font-bold text-p-title">{label}</p>
              <p className="mt-1.5 text-xs text-p-gray">{desc}</p>
              {values.length < NEED ? (
                <>
                  <div className="mt-3 flex gap-1.5">
                    {Array.from({ length: NEED }, (_, i) => (
                      <span key={i} className={`h-1.5 flex-1 rounded-full ${i < values.length ? "bg-brand" : "bg-[#DADDE1]"}`} />
                    ))}
                  </div>
                  <p className="mt-3 text-[13px] text-p-body">
                    기록이 3회 쌓이면 변화를 보여드려요 · <b className="text-brand-deep">현재 {values.length}회</b>
                  </p>
                </>
              ) : (
                <LineChart values={rolling(values)} />
              )}
            </div>
          ))}
        </div>

        <h2 className="mt-6 px-2.5 text-base font-bold text-p-title">2군 · 과제 지표</h2>
        <ul className="mt-2.5 border-t border-p-line">
          {TASK_ORDER.map((task) => {
            const recs = sorted.filter((r) => r.taskType === task && r.result.status === "success" && r.result.metric);
            const last = recs[recs.length - 1];
            const sameDay = last ? recs.filter((r) => fmtDay(r.recordedAt) === fmtDay(last.recordedAt)) : [];
            return (
              <li key={task} className="flex h-[65px] items-center border-b border-p-line">
                <span className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${last ? "bg-brand-soft text-brand-deep" : "bg-p-card text-p-light"}`}>
                  <TaskIcon task={task} size={20} />
                </span>
                <span className="ml-3 flex-1">
                  <span className="block text-[15px] font-bold text-p-title">{TASK_LABEL[task]}</span>
                  <span className="mt-1 block text-xs text-p-gray">
                    {last
                      ? `${fmtDay(last.recordedAt)} · ${sameDay.map((r) => `${r.result.metric!.value}${unitOf(r.result.metric!.unit)}`).join(", ")}`
                      : "기록 없음"}
                  </span>
                </span>
                {!last && (
                  <button type="button" onClick={() => navigate(`/task-guide/${task}`)} className="h-[34px] rounded-full bg-p-card px-[18px] text-[13px] font-bold text-p-body">
                    찍으러 가기
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <ParentNav />
    </div>
  );
}

function LineChart({ values }: { values: number[] }) {
  const W = 320, H = 72, pad = 8;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => ({
    x: pad + (i / (values.length - 1)) * (W - pad * 2),
    y: H - pad - ((v - min) / range) * (H - pad * 2),
  }));
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ");
  const last = values[values.length - 1];
  return (
    <div className="mt-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        <path d={d} stroke="#74DCFF" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#fff" stroke="#74DCFF" strokeWidth={2} />)}
      </svg>
      <p className="mt-1 text-[13px] text-p-body">
        최근 <b className="text-brand-deep">{Math.round(last)}%</b> · 기록 {values.length}회
      </p>
    </div>
  );
}
