import { useChildStore } from "../../store/child";
import { useRecordsStore } from "../../store/records";
import { correctedAgeMonths } from "../../utils/ageCalc";
import NavBar from "../../components/NavBar";
import type { TaskType } from "../../types/analysis";

const TASK_LABEL: Record<TaskType, string> = {
  name_response: "호명반응",
  imitation: "동작 모방",
  ball_play: "공 주고받기",
};
const TASK_MEANING: Record<TaskType, string> = {
  name_response: "호명 후 고개를 돌리기까지의 시간",
  imitation: "보호자 동작 시작 후 아이가 따라 하기까지의 시간",
  ball_play: "공을 보호자와 주고받은 횟수",
};
const TASKS: TaskType[] = ["name_response", "imitation", "ball_play"];

function fmtDate(ts: number) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function ClinicSummaryScreen() {
  const profile = useChildStore((s) => s.profile);
  const records = useRecordsStore((s) => s.records);

  if (!profile) return null;

  const ageMonths = correctedAgeMonths(profile.birthDate, profile.gestationalWeeks);
  const sorted = [...records].sort((a, b) => a.recordedAt - b.recordedAt);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const countByTask = TASKS.map((t) => ({
    taskType: t,
    count: records.filter((r) => r.taskType === t).length,
  }));

  const tableRows = [...records]
    .sort((a, b) => b.recordedAt - a.recordedAt)
    .filter((r) => r.result.status === "success" && r.result.metric);

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      <NavBar title="진료 요약" />

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">
        <div>
          <p className="text-lg font-bold text-gray-900">{profile.name}</p>
          <p className="text-sm text-gray-500">교정월령 {ageMonths}개월</p>
          {first && last && (
            <p className="text-xs text-gray-400 mt-0.5">
              기록 기간 {fmtDate(first.recordedAt)} ~ {fmtDate(last.recordedAt)} · 총 {records.length}회
            </p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 mb-2">과제별 기록 수</p>
          <div className="space-y-2">
            {countByTask.map(({ taskType, count }) => (
              <div key={taskType} className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-700">{TASK_LABEL[taskType]}</span>
                <span className="text-sm font-semibold text-gray-900">{count}회</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 mb-2">측정 기록</p>
          {tableRows.length === 0 ? (
            <p className="text-sm text-gray-400">기록이 없습니다</p>
          ) : (
            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              {tableRows.map((r) => (
                <div key={r.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-400 w-10 flex-shrink-0">{fmtDate(r.recordedAt)}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex-shrink-0">
                    {TASK_LABEL[r.taskType]}
                  </span>
                  <span className="text-sm text-gray-800 tabular-nums">
                    {r.result.metric!.value}{r.result.metric!.unit === "seconds" ? "초" : "회"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 mb-2">측정 방법</p>
          <div className="space-y-1">
            {TASKS.map((t) => (
              <p key={t} className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">{TASK_LABEL[t]}</span> — {TASK_MEANING[t]}
              </p>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl px-4 py-3">
          <p className="text-xs text-gray-500">판정 없음 — 측정값과 변화만 기록합니다</p>
        </div>
      </div>
    </div>
  );
}
