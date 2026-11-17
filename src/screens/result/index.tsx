import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useRecordsStore, type SessionRecord } from "../../store/records";
import { Pill } from "../../components/ParentNav";
import { ChevronRightIcon, ImagePlaceholderIcon, QuestionIcon } from "../../components/icons";
import { TASK_LABEL, TASK_RETRY_TIPS, unitOf } from "../../data/tasks";
import type { TaskType, AnalysisResult } from "../../types/analysis";

// Figma 부모 버전: "기록 저장"(성공), "재촬영"(retry_needed)

const fmtDateTime = (ts: number) => {
  const d = new Date(ts);
  const h = d.getHours();
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${h < 12 ? "오전" : "오후"} ${h % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const fmtDay = (ts: number) => {
  const d = new Date(ts);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};
const ratio = (a: NonNullable<AnalysisResult["ambient"]>, key: "caregiverOrientSec" | "activitySec") =>
  a.bothInFrameSec > 0 ? Math.round((a[key] / a.bothInFrameSec) * 100) : 0;

export default function ResultScreen() {
  const { taskType } = useParams<{ taskType: TaskType }>();
  const location = useLocation();
  const navigate = useNavigate();
  const records = useRecordsStore((s) => s.records);

  const task = taskType as TaskType;
  const result: AnalysisResult | undefined = location.state?.result;

  if (!result) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 px-6 max-w-sm mx-auto">
        <p className="text-[15px] text-p-gray">결과를 불러올 수 없어요</p>
        <button onClick={() => navigate("/tasks")} className="h-[54px] px-8 rounded-[14px] bg-p-card text-base font-bold text-p-body">
          과제로 돌아가기
        </button>
      </div>
    );
  }

  if (result.status === "retry_needed") return <RetryView task={task} reason={result.retryReason} />;

  // 방금 저장된 기록(가장 최근) + 그 전 성공 기록
  const mine = records
    .filter((r) => r.taskType === task && r.result.status === "success")
    .sort((a, b) => b.recordedAt - a.recordedAt);
  const current = mine[0];
  const prev = mine[1];
  const metric = result.metric;
  const unit = metric ? unitOf(metric.unit) : "";

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      <div className="flex-1 px-5 pt-14 pb-6">
        <Pill className="h-7 px-4 text-[13px]">{TASK_LABEL[task]}</Pill>
        <h1 className="mt-[15px] text-2xl font-bold text-p-title">기록이 저장됐어요</h1>

        {/* 이번 기록 */}
        <div className="mt-[34px] flex h-[115px] items-center justify-between rounded-[18px] bg-brand px-[22px]">
          <div className="text-white">
            {current && <p className="text-[13px] font-bold">{fmtDateTime(current.recordedAt)}</p>}
            <p className="mt-3 text-sm leading-[22px] whitespace-pre-line">{metric?.label ?? ""}</p>
          </div>
          <p className="flex items-baseline gap-2 text-white">
            <span className="text-[52px] leading-[62px] font-semibold tabular-nums">{metric?.value ?? "—"}</span>
            <span className="text-lg font-bold">{unit}</span>
          </p>
        </div>

        {/* 지난 기록과 비교 */}
        {prev?.result.metric && metric && (
          <section className="mt-[34px]">
            <h2 className="text-base font-bold text-p-title">지난 기록과 비교</h2>
            <p className="mt-2 text-sm font-bold text-brand-deep">{compareText(prev.result.metric.value, metric.value, metric.unit)}</p>
            <div className="mt-3.5 flex items-center gap-2.5">
              <div className="flex-1 rounded-2xl bg-p-card px-3.5 py-4">
                <p className="text-xs text-p-gray">{fmtDay(prev.recordedAt)}</p>
                <p className="mt-2 text-xl font-bold text-p-gray">{prev.result.metric.value}{unit}</p>
              </div>
              <ChevronRightIcon size={20} className="text-brand-icon" />
              <div className="flex-1 rounded-2xl border border-brand px-3.5 py-4">
                <p className="text-xs font-bold text-brand-deep">오늘</p>
                <p className="mt-2 text-xl font-bold text-p-title">{metric.value}{unit}</p>
              </div>
            </div>
          </section>
        )}

        {/* 공통 지표 */}
        {result.ambient && (
          <section className="mt-9">
            <h2 className="text-base font-bold text-p-title">함께 기록된 공통 지표</h2>
            <p className="mt-1.5 text-[13px] text-p-gray">모든 과제에서 측정</p>
            <div className="mt-3.5 flex gap-3">
              <AmbientBox label="보호자 지향 비율" now={ratio(result.ambient, "caregiverOrientSec")} prev={prevAmbient(mine, "caregiverOrientSec")} />
              <AmbientBox label="활동량 비율" now={ratio(result.ambient, "activitySec")} prev={prevAmbient(mine, "activitySec")} />
            </div>
          </section>
        )}

        <p className="mt-6 flex gap-2 text-[13px] leading-4 text-p-gray">
          <QuestionIcon size={16} className="mt-px flex-shrink-0 text-p-light" />
          진단이 아닌 관찰 기록이에요. 궁금한 점은 진료 때 기록을 보여주며 상담해 보세요.
        </p>
      </div>

      <div className="sticky bottom-0 flex gap-2.5 bg-white px-5 pt-3 pb-8">
        <button type="button" onClick={() => navigate("/timeline")} className="h-[54px] w-[132px] rounded-[14px] bg-p-card text-base font-bold text-p-body">
          기록 보기
        </button>
        <button type="button" onClick={() => navigate("/tasks")} className="h-[54px] flex-1 rounded-[14px] bg-brand text-base font-bold text-white">
          다음 과제 하기
        </button>
      </div>
    </div>
  );
}

/** 지난번 대비 문구. 시간은 짧을수록, 횟수는 많을수록 좋은 방향 */
function compareText(prev: number, now: number, unit: "seconds" | "count") {
  const diff = Math.round(Math.abs(now - prev) * 10) / 10;
  if (diff === 0) return "지난번과 같아요";
  if (unit === "seconds") return `지난번보다 ${diff}초 ${now < prev ? "짧아졌어요" : "길어졌어요"}`;
  return `지난번보다 ${diff}회 ${now > prev ? "늘었어요" : "줄었어요"}`;
}

function prevAmbient(mine: SessionRecord[], key: "caregiverOrientSec" | "activitySec") {
  const a = mine.slice(1).find((r) => r.result.ambient)?.result.ambient;
  return a ? ratio(a, key) : null;
}

function AmbientBox({ label, now, prev }: { label: string; now: number; prev: number | null }) {
  return (
    <div className="flex-1 rounded-2xl border border-p-line px-3.5 pt-4 pb-3.5">
      <p className="text-[13px] text-p-gray">{label}</p>
      <p className="mt-2 text-[22px] font-bold text-p-title">{now}%</p>
      {prev !== null && <p className="mt-2 text-xs font-bold text-brand-deep">지난번 {prev}%</p>}
    </div>
  );
}

function RetryView({ task, reason }: { task: TaskType; reason?: string }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      <div className="flex-1 px-5 pt-14 pb-6">
        <Pill className="h-7 px-4 text-[13px]">{TASK_LABEL[task]}</Pill>
        <h1 className="mt-[15px] text-2xl font-bold text-p-title">다시 한번 찍어볼까요?</h1>
        <p className="mt-3 text-[15px] leading-[22px] text-p-gray">
          기록이 잘못된 게 아니라, 화면에서 아이{task === "ball_play" ? "나 공이" : "가"} 잘 안보여서 정확히 잴 수 없었어요.
        </p>

        <div className="mt-[22px] overflow-hidden rounded-2xl border border-p-line">
          <div className="flex h-[168px] items-center justify-center bg-brand-photo text-brand-icon">
            <ImagePlaceholderIcon size={22} />
          </div>
          <p className="flex items-center gap-2.5 px-4 py-4 text-sm font-bold text-p-title">
            <QuestionIcon size={18} className="text-brand-deep flex-shrink-0" />
            {reason ?? "아이가 화면에 충분히 보이지 않았어요"}
          </p>
        </div>

        <h2 className="mt-8 text-base font-bold text-p-title">이렇게 하면 잘 찍혀요</h2>
        <ol className="mt-4 space-y-5 text-[15px] text-p-body">
          {TASK_RETRY_TIPS[task].map((tip, i) => (
            <li key={tip}>{i + 1}. {tip}</li>
          ))}
        </ol>
      </div>

      <div className="sticky bottom-0 bg-white px-5 pt-3 pb-8">
        <button type="button" onClick={() => navigate(`/recording/${task}`, { replace: true })} className="h-[54px] w-full rounded-[14px] bg-brand text-base font-bold text-white">
          다시 찍기
        </button>
        <button type="button" onClick={() => navigate("/tasks")} className="mt-4 w-full text-sm text-p-gray">
          나중에 할게요
        </button>
      </div>
    </div>
  );
}
