import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChildStore } from "../../store/child";
import { useRecordsStore, type SessionRecord } from "../../store/records";
import { useNotesStore } from "../../store/notes";
import { correctedAgeMonths } from "../../utils/ageCalc";
import { mockDoctor } from "../../data/mockDoctor";
import ParentNav, { Pill } from "../../components/ParentNav";
import BottomSheet from "../../components/BottomSheet";
import LogoReset from "../../components/LogoReset";
import { BellIcon, ChevronRightIcon, MemoIcon } from "../../components/icons";
import {
  TASK_LABEL, TASK_META, TASK_ORDER, TASK_SHORT, nameWithI, unitOf,
} from "../../data/tasks";
import TaskIllust from "../../components/TaskIllust";
import type { TaskType } from "../../types/analysis";

type TaskState = "todo" | "done" | "retry";

const isSameDay = (a: number, b: Date) => {
  const d = new Date(a);
  return d.getFullYear() === b.getFullYear() && d.getMonth() === b.getMonth() && d.getDate() === b.getDate();
};

/** 오늘 이 과제의 마지막 기록 */
function lastToday(records: SessionRecord[], task: TaskType, now: Date) {
  return records
    .filter((r) => r.taskType === task && isSameDay(r.recordedAt, now))
    .sort((a, b) => b.recordedAt - a.recordedAt)[0];
}

// Figma 부모 버전: "오늘의과제 4"(시작 전), "오늘의과제 3"(1개 완료 + 1개 다시 찍기)
export default function TodayTasksScreen() {
  const navigate = useNavigate();
  const profile = useChildStore((s) => s.profile);
  const records = useRecordsStore((s) => s.records);
  const notes = useNotesStore((s) => s.notes);
  const [memoOpen, setMemoOpen] = useState(false);
  const [now] = useState(() => new Date());

  useEffect(() => {
    if (!profile) navigate("/");
  }, [profile, navigate]);

  if (!profile) return null;

  const chronological = correctedAgeMonths(profile.birthDate);
  const corrected = correctedAgeMonths(profile.birthDate, profile.gestationalWeeks);

  const tasks = TASK_ORDER.map((task) => {
    const last = lastToday(records, task, now);
    const state: TaskState = !last ? "todo" : last.result.status === "success" ? "done" : "retry";
    return { task, state, last };
  });
  const doneCount = tasks.filter((t) => t.state === "done").length;
  const next = tasks.find((t) => t.state !== "done");

  const memo = notes
    .filter((n) => n.isShared)
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      <div className="flex-1 px-5 pb-6">
        {/* 로고 + 알림 */}
        <div className="flex items-center justify-between pt-14">
          <LogoReset />
          <button type="button" aria-label="알림" className="relative text-p-title" onClick={() => memo && setMemoOpen(true)}>
            <BellIcon size={24} />
            {memo && <span className="absolute right-0 top-0 h-[7px] w-[7px] rounded-full bg-warn-dot" />}
          </button>
        </div>

        {/* 제목 */}
        <h1 className="mt-4 text-[26px] leading-[36px] font-bold text-p-title">
          {nameWithI(profile.name)}, 오늘은
          <br />
          {next ? `${TASK_LABEL[next.task]} 차례예요` : "과제를 모두 마쳤어요"}
        </h1>
        <div className="mt-3.5 flex gap-2.5">
          <Pill tone="gray">{chronological}개월</Pill>
          {corrected !== chronological && <Pill>교정 {corrected}개월</Pill>}
        </div>

        {/* 진행 상황 */}
        <div className="mt-5 rounded-2xl bg-p-card px-4 pt-4 pb-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-bold text-p-title">
              {TASK_ORDER.length}개 중 {doneCount}개 완료
            </span>
            <span className="text-[13px] text-p-gray">전부 해도 2분이면 끝나요</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-white overflow-hidden">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${Math.max(doneCount / TASK_ORDER.length, doneCount ? 0 : 0.04) * 100}%` }}
            />
          </div>
        </div>

        {/* 과제 카드 */}
        <div className="mt-[17px] space-y-[13px]">
          {tasks.map(({ task, state, last }) => (
            <TaskCard
              key={task}
              task={task}
              state={state}
              sub={
                state === "done" && last?.result.metric
                  ? `오늘 기록 ${last.result.metric.value}${unitOf(last.result.metric.unit)}`
                  : state === "retry"
                    ? `${TASK_META[task].split(" · ")[0]} · ${shortReason(last?.result.retryReason)}`
                    : TASK_META[task]
              }
              onStart={() => navigate(`/task-guide/${task}`)}
            />
          ))}
        </div>

        {/* 선생님 메모 */}
        {memo && (
          <button
            type="button"
            onClick={() => setMemoOpen(true)}
            className="mt-[17px] flex h-[70px] w-full items-center gap-3 rounded-2xl bg-brand-soft px-4 text-left"
          >
            <MemoIcon size={22} className="text-brand-deep flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-p-title">{mockDoctor.name} 선생님 메모가 도착했어요</p>
              <p className="mt-1.5 truncate text-[13px] text-p-body">{memo.text}</p>
            </div>
            <ChevronRightIcon size={18} className="text-brand-deep flex-shrink-0" />
          </button>
        )}
      </div>

      <ParentNav />

      {memoOpen && memo && (
        <BottomSheet open onClose={() => setMemoOpen(false)} title={`${mockDoctor.name} 선생님 메모`} subtitle={memo.date.replace(/-/g, ". ")}>
          <p className="text-[15px] leading-6 text-p-body whitespace-pre-line">{memo.text}</p>
          <button
            type="button"
            onClick={() => setMemoOpen(false)}
            className="mt-6 h-[54px] w-full rounded-[14px] bg-brand text-base font-bold text-white"
          >
            확인
          </button>
        </BottomSheet>
      )}
    </div>
  );
}

/** "아이 얼굴이 충분히 보이지 않았습니다" → "화면 밖으로 나갔어요" 같은 짧은 말 */
function shortReason(reason?: string) {
  if (!reason) return "다시 찍어주세요";
  if (reason.includes("공")) return "공이 잘 안 보였어요";
  return "화면 밖으로 나갔어요";
}

function TaskCard({
  task,
  state,
  sub,
  onStart,
}: {
  task: TaskType;
  state: TaskState;
  sub: string;
  onStart: () => void;
}) {
  // Figma "오늘의과제 4/5": 할 과제는 파란 카드, 끝낸·다시 찍을 과제는 흰 카드. 과제 이름만 크게
  const filled = state === "todo";
  return (
    <div
      className={`flex h-[102px] items-center rounded-2xl pl-4 pr-4 ${
        filled ? "bg-brand" : "bg-white border border-p-line"
      }`}
    >
      <TaskIllust task={task} size={70} />
      <div className="ml-[26px] min-w-0 flex-1">
        <p className={`text-xl leading-6 font-bold ${filled ? "text-white" : "text-[#494949]"}`}>{TASK_LABEL[task]}</p>
        {/* 화면에는 숨기고 읽어 주기에만 남겨요 */}
        <p className="sr-only">{TASK_SHORT[task]} · {sub}</p>
      </div>
      {state === "done" ? (
        <span className="flex h-[35px] items-center rounded-full bg-p-card px-3 text-[13px] font-bold text-[#494949]">완료</span>
      ) : (
        <button
          type="button"
          onClick={onStart}
          className={`h-[35px] rounded-full px-3.5 text-[13px] font-bold ${
            state === "retry" ? "bg-warn-bg text-warn-text" : "bg-white text-brand-icon"
          }`}
        >
          {state === "retry" ? "다시 찍기" : "시작하기"}
        </button>
      )}
    </div>
  );
}
