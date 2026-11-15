import { useLocation, useNavigate, useParams } from "react-router-dom";
import NavBar from "../../components/NavBar";
import { useRecordsStore } from "../../store/records";
import type { TaskType, AnalysisResult } from "../../types/analysis";

function AmbientItem({ label, value, total, unit, note }: {
  label: string; value: number; total: number; unit: string; note?: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="bg-gray-50 rounded-xl px-3 py-2.5">
      <p className="text-xs text-gray-400 mb-0.5">{label}{note && <span className="ml-1 text-gray-300">({note})</span>}</p>
      <p className="text-sm font-semibold text-gray-900 tabular-nums">{value.toFixed(1)}{unit}</p>
      <p className="text-xs text-gray-400">{pct}%</p>
    </div>
  );
}

const TASK_LABEL: Record<TaskType, string> = {
  name_response: "호명반응",
  imitation: "동작 모방",
  ball_play: "공 주고받기",
};

export default function ResultScreen() {
  const { taskType } = useParams<{ taskType: TaskType }>();
  const location = useLocation();
  const navigate = useNavigate();
  const records = useRecordsStore((s) => s.records);

  const task = taskType as TaskType;
  const result: AnalysisResult | undefined = location.state?.result;

  if (!result) {
    return (
      <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
        <NavBar title="결과" />
        <div className="flex-1 flex flex-col items-center justify-center px-5 gap-4">
          <p className="text-sm text-gray-500">결과를 불러올 수 없습니다</p>
          <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-2xl border border-gray-200 text-sm text-gray-700">
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (result.status === "retry_needed") {
    return (
      <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
        <NavBar title={TASK_LABEL[task]} />
        <div className="flex-1 flex flex-col items-center justify-center px-5 gap-6 text-center">
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="16" r="0.5" fill="#f97316" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-1">촬영을 다시 해주세요</p>
            <p className="text-sm text-gray-500">{result.retryReason}</p>
          </div>
          <button
            onClick={() => navigate(`/recording/${task}`)}
            className="w-full py-4 rounded-2xl bg-gray-900 text-white font-semibold"
          >
            다시 촬영하기
          </button>
        </div>
      </div>
    );
  }

  const { metric } = result;
  const unitLabel = metric?.unit === "seconds" ? "초" : "회";

  const taskRecords = records
    .filter((r) => r.taskType === task && r.result.status === "success")
    .sort((a, b) => b.recordedAt - a.recordedAt);

  const latestRecord = taskRecords[0];
  const prevValue = taskRecords[1]?.result.metric?.value;

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      <NavBar title={TASK_LABEL[task]} back={false} />
      <div className="flex-1 flex flex-col px-5 py-8 gap-8">
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-2">{metric?.label}</p>
          <p className="text-6xl font-bold text-gray-900 tabular-nums">
            {metric?.value ?? "—"}
          </p>
          <p className="text-xl text-gray-500 mt-1">{unitLabel}</p>
        </div>

        {prevValue !== undefined && metric && (
          <div className="bg-gray-50 rounded-2xl px-4 py-3 text-center">
            <p className="text-xs text-gray-400 mb-1">이전 기록과 비교</p>
            <p className="text-sm text-gray-700 tabular-nums">
              {prevValue}{unitLabel} → {metric.value}{unitLabel}
            </p>
          </div>
        )}

        {task === "name_response" && (
          <p className="text-xs text-gray-400 text-center">
            참고: 일반 발달 아동 평균 3.62초 (전근아·김휘영, 2025, 18~48개월)
          </p>
        )}

        {result.ambient && (
          <div className="border border-gray-100 rounded-2xl p-4 space-y-3">
            <p className="text-xs font-medium text-gray-400">이번 영상 공통 지표</p>
            <div className="grid grid-cols-2 gap-3">
              <AmbientItem label="보호자 지향" value={result.ambient.caregiverOrientSec} total={result.ambient.bothInFrameSec} unit="초" />
              <AmbientItem label="활동량" value={result.ambient.activitySec} total={result.ambient.bothInFrameSec} unit="초" />
              <AmbientItem label="신체 접촉" value={result.ambient.contactSec} total={result.ambient.bothInFrameSec} unit="초" note="참고값" />
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-10 space-y-2">
        <button onClick={() => navigate("/tasks")} className="w-full py-4 rounded-2xl bg-gray-900 text-white font-semibold">
          다른 과제 하기
        </button>
        {latestRecord && (
          <button
            onClick={() => navigate(`/replay/${latestRecord.id}`)}
            className="w-full py-3 rounded-2xl border border-gray-200 text-sm text-gray-700"
          >
            측정 과정 보기
          </button>
        )}
        <button onClick={() => navigate("/timeline")} className="w-full py-3 rounded-2xl border border-gray-200 text-sm text-gray-700">
          기록 보기
        </button>
      </div>
    </div>
  );
}
