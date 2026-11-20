import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useRecordsStore } from "../../store/records";
import { Pill } from "../../components/ParentNav";
import { ImagePlaceholderIcon, QuestionIcon } from "../../components/icons";
import { TASK_LABEL, TASK_RETRY_TIPS } from "../../data/tasks";
import RecordDetail from "./RecordDetail";
import TraceReplay from "./TraceReplay";
import { getLastReplay } from "../../store/lastReplay";
import type { TaskType, AnalysisResult } from "../../types/analysis";

// Figma 부모 버전: "기록 저장"(성공), "재촬영"(retry_needed)

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
  // 방금 분석한 영상과 좌표 (메모리에만 있음, 새로고침하면 없음)
  const replay = getLastReplay(task);

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      <div className="flex-1 px-5 pt-14 pb-6">
        <RecordDetail
          task={task}
          title="기록이 저장됐어요"
          result={result}
          recordedAt={mine[0]?.recordedAt}
          earlier={mine.slice(1)}
          currentLabel="오늘"
          extra={replay && <TraceReplay video={replay.video} trace={replay.trace} />}
        />
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
