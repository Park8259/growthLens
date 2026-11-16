import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecordsStore } from "../../store/records";
import ParentNav from "../../components/ParentNav";
import { TASK_LABEL, unitOf } from "../../data/tasks";
import TaskIcon from "../../components/TaskIcon";
import type { TaskType } from "../../types/analysis";

// Figma 부모 버전 "기록"
const FILTERS: (TaskType | "all")[] = ["all", "name_response", "imitation", "ball_play"];
const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];

function dayKey(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
function dayLabel(ts: number, now: Date) {
  const d = new Date(ts);
  const base = `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAY[d.getDay()]})`;
  return dayKey(ts) === dayKey(now.getTime()) ? `${base} · 오늘` : base;
}
function timeLabel(ts: number) {
  const d = new Date(ts);
  const h = d.getHours();
  return `${h < 12 ? "오전" : "오후"} ${h % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function TimelineScreen() {
  const navigate = useNavigate();
  const records = useRecordsStore((s) => s.records);
  const [filter, setFilter] = useState<TaskType | "all">("all");
  const [now] = useState(() => new Date());

  const shown = records
    .filter((r) => filter === "all" || r.taskType === filter)
    .sort((a, b) => b.recordedAt - a.recordedAt);

  const groups: { key: string; label: string; items: typeof shown }[] = [];
  for (const r of shown) {
    const key = dayKey(r.recordedAt);
    const g = groups.find((x) => x.key === key);
    if (g) g.items.push(r);
    else groups.push({ key, label: dayLabel(r.recordedAt, now), items: [r] });
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      <div className="flex-1 px-5 pt-16 pb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-p-title">기록</h1>
          <span className="text-sm text-p-gray">총 {records.length}회</span>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`h-[37px] flex-shrink-0 rounded-xl px-3.5 text-sm ${
                filter === f ? "bg-brand font-bold text-white" : "border border-p-line bg-white text-p-body"
              }`}
            >
              {f === "all" ? "전체" : TASK_LABEL[f]}
            </button>
          ))}
        </div>

        {groups.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24">
            <p className="text-sm text-p-gray">아직 기록이 없어요</p>
            <button type="button" onClick={() => navigate("/tasks")} className="h-[46px] rounded-[14px] bg-brand px-6 text-sm font-bold text-white">
              과제 하러 가기
            </button>
          </div>
        ) : (
          groups.map((g) => (
            <section key={g.key} className="mt-[18px]">
              <h2 className="text-[13px] font-bold text-p-gray">{g.label}</h2>
              <ul className="mt-[21px] space-y-[27px]">
                {g.items.map((r) => {
                  const ok = r.result.status === "success";
                  // 같은 과제를 이 기록 뒤에 다시 찍었으면 재촬영은 끝난 것
                  const retaken = !ok && records.some((x) => x.taskType === r.taskType && x.recordedAt > r.recordedAt);
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        // 재촬영 필요한 기록은 그 과제를 바로 다시 시작. 이미 다시 찍었으면 누를 수 없음
                        disabled={retaken}
                        onClick={() => navigate(ok ? `/replay/${r.id}` : `/task-guide/${r.taskType}`)}
                        className="flex w-full items-center px-1 text-left"
                      >
                        <span className={`flex h-[38px] w-[38px] items-center justify-center rounded-[10px] ${ok ? "bg-brand-soft text-brand-icon" : "bg-p-card text-[#9C9C9C]"}`}>
                          <TaskIcon task={r.taskType} size={19} />
                        </span>
                        <span className="ml-3 flex-1">
                          <span className="block text-[15px] font-bold text-p-title">{TASK_LABEL[r.taskType]}</span>
                          <span className="mt-1 block text-xs text-p-light">{timeLabel(r.recordedAt)}</span>
                        </span>
                        {ok && r.result.metric ? (
                          <span className="text-[17px] font-bold text-p-title tabular-nums">
                            {r.result.metric.value}{unitOf(r.result.metric.unit)}
                          </span>
                        ) : retaken ? (
                          <span className="flex h-[34px] items-center rounded-full bg-p-card px-3.5 text-sm font-bold text-p-light">다시 찍었어요</span>
                        ) : (
                          <span className="flex h-[34px] items-center rounded-full bg-warn-bg px-3.5 text-sm font-bold text-warn-text">재촬영 필요</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
      <ParentNav />
    </div>
  );
}
