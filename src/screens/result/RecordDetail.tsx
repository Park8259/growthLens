import type { SessionRecord } from "../../store/records";
import { Pill } from "../../components/ParentNav";
import { ChevronRightIcon, QuestionIcon } from "../../components/icons";
import { TASK_LABEL, unitOf } from "../../data/tasks";
import type { AnalysisResult, TaskType } from "../../types/analysis";

// 기록 한 건의 결과 본문. 촬영 직후 결과 화면과 기록 탭의 지난 기록 화면이 함께 써요.

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

type Props = {
  task: TaskType;
  title: string;
  result: AnalysisResult;
  /** 이 기록의 시각 (없으면 날짜 줄을 숨김) */
  recordedAt?: number;
  /** 이 기록보다 앞선 성공 기록, 최근 것부터 */
  earlier: SessionRecord[];
  /** 비교 상자에서 이 기록을 부르는 이름 ("오늘", "11월 18일") */
  currentLabel: string;
};

export default function RecordDetail({ task, title, result, recordedAt, earlier, currentLabel }: Props) {
  const prev = earlier[0];
  const metric = result.metric;
  const unit = metric ? unitOf(metric.unit) : "";
  const prevAmbient = earlier.find((r) => r.result.ambient)?.result.ambient;

  return (
    <>
      <Pill className="h-7 px-4 text-[13px]">{TASK_LABEL[task]}</Pill>
      <h1 className="mt-[15px] text-2xl font-bold text-p-title">{title}</h1>

      {/* 이번 기록 */}
      <div className="mt-[34px] flex h-[115px] items-center justify-between rounded-[18px] bg-brand px-[22px]">
        <div className="text-white">
          {recordedAt !== undefined && <p className="text-[13px] font-bold">{fmtDateTime(recordedAt)}</p>}
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
              <p className="text-xs font-bold text-brand-deep">{currentLabel}</p>
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
            <AmbientBox label="보호자 지향 비율" now={ratio(result.ambient, "caregiverOrientSec")} prev={prevAmbient ? ratio(prevAmbient, "caregiverOrientSec") : null} />
            <AmbientBox label="활동량 비율" now={ratio(result.ambient, "activitySec")} prev={prevAmbient ? ratio(prevAmbient, "activitySec") : null} />
          </div>
        </section>
      )}

      <p className="mt-6 flex gap-2 text-[13px] leading-4 text-p-gray">
        <QuestionIcon size={16} className="mt-px flex-shrink-0 text-p-light" />
        <span>
          진단이 아닌 관찰 기록이에요.
          <br />
          궁금한 점은 진료 때 기록을 보여주며 상담해 보세요.
        </span>
      </p>
    </>
  );
}

/** 지난번 대비 문구. 시간은 짧을수록, 횟수는 많을수록 좋은 방향 */
function compareText(prev: number, now: number, unit: "seconds" | "count") {
  const diff = Math.round(Math.abs(now - prev) * 10) / 10;
  if (diff === 0) return "지난번과 같아요";
  if (unit === "seconds") return `지난번보다 ${diff}초 ${now < prev ? "짧아졌어요" : "길어졌어요"}`;
  return `지난번보다 ${diff}회 ${now > prev ? "늘었어요" : "줄었어요"}`;
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
