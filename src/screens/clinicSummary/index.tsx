import { useEffect, useState } from "react";
import { useChildStore } from "../../store/child";
import { useRecordsStore, type SessionRecord } from "../../store/records";
import { useQuestionsStore } from "../../store/questions";
import { correctedAgeMonths } from "../../utils/ageCalc";
import ParentNav from "../../components/ParentNav";
import BottomSheet from "../../components/BottomSheet";
import { CheckIcon, ChevronRightIcon, PdfIcon, PlayIcon, QuestionIcon } from "../../components/icons";
import { TASK_LABEL, TASK_ORDER, unitOf } from "../../data/tasks";
import TaskIcon from "../../components/TaskIcon";
import type { TaskType } from "../../types/analysis";

// Figma 부모 버전 "진료요약" + "진료코드"(공유 시트)

const fmtYmd = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`;
};
const fmtMd = (ts: number) => {
  const d = new Date(ts);
  return `${d.getMonth() + 1}. ${d.getDate()}`;
};
const fmtSlash = (ts: number) => {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};
const dayKey = (ts: number) => new Date(ts).toDateString();

/** 시간은 줄면 좋아짐, 횟수는 늘면 좋아짐 */
function trendWord(first: number, last: number, unit: "seconds" | "count") {
  if (first === last) return "같음";
  if (unit === "seconds") return last < first ? "빨라짐" : "느려짐";
  return last > first ? "늘어남" : "줄어듦";
}

function ambientPct(r: SessionRecord, key: "caregiverOrientSec" | "activitySec") {
  const a = r.result.ambient!;
  return a.bothInFrameSec > 0 ? Math.round((a[key] / a.bothInFrameSec) * 100) : 0;
}

export default function ClinicSummaryScreen() {
  const profile = useChildStore((s) => s.profile);
  const records = useRecordsStore((s) => s.records);
  const { questions, add, remove } = useQuestionsStore();
  const [shareOpen, setShareOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const sorted = [...records].sort((a, b) => a.recordedAt - b.recordedAt);
  const successes = sorted.filter((r) => r.result.status === "success" && r.result.metric);
  const scenes = [...successes].reverse().slice(0, 3);
  const [picked, setPicked] = useState<string[]>(() => scenes.slice(0, 2).map((r) => r.id));

  if (!profile) return null;

  const age = correctedAgeMonths(profile.birthDate, profile.gestationalWeeks);
  const [by, bm, bd] = profile.birthDate.split("-").map(Number);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const weeks = first && last ? Math.max(1, Math.round((last.recordedAt - first.recordedAt) / (7 * 864e5))) : 0;

  const taskRows = TASK_ORDER.map((task: TaskType) => {
    const recs = successes.filter((r) => r.taskType === task);
    return { task, first: recs[0]?.result.metric, last: recs[recs.length - 1]?.result.metric };
  }).filter((r) => r.first && r.last);

  const ambient = sorted.filter((r) => r.result.ambient);
  const a0 = ambient[0];
  const a1 = ambient[ambient.length - 1];

  const doneCount = successes.length;
  const dayCount = new Set(sorted.map((r) => dayKey(r.recordedAt))).size;
  const retryCount = sorted.filter((r) => r.result.status === "retry_needed").length;

  function togglePick(id: string) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      <div className="flex-1 px-5 pt-[69px] pb-6">
        <h1 className="text-2xl font-bold text-p-title">진료 요약이 도착했어요</h1>

        {/* 아이 정보 */}
        <div className="mt-10 flex items-center gap-[26px] px-[18px]">
          <img src="/images/child-photo.png" alt="" className="h-[110px] w-[110px] rounded-full object-cover" />
          <div className="text-ink-sub">
            <p className="text-base font-bold">{profile.name} ({age}개월)</p>
            <p className="mt-3 text-sm">{by}년 {bm}월 {bd}일생</p>
            {first && last && (
              <p className="mt-2 text-[13px] leading-[19px] text-[#777777]">
                기록 기간
                <br />
                {fmtYmd(first.recordedAt)} ~ {fmtMd(last.recordedAt)} ({weeks}주)
              </p>
            )}
          </div>
        </div>
        <p className="mt-5 flex gap-1.5 text-xs leading-4 text-p-gray">
          <QuestionIcon size={14} className="mt-px flex-shrink-0 text-p-light" />
          보호자가 집에서 찍은 영상을 바탕으로 한 관찰 기록이에요. 진단이나 발달 판정이 아니에요.
        </p>

        {/* 과제 지표 */}
        <Card>
          <p className="flex items-baseline gap-2">
            <span className="text-base font-bold text-p-title">과제 지표</span>
            <span className="text-xs text-p-gray">첫 기록 → 최근</span>
          </p>
          <ul className="mt-4 divide-y divide-p-line">
            {taskRows.length === 0 && <li className="py-3 text-sm text-p-gray">아직 기록이 없어요</li>}
            {taskRows.map(({ task, first: f, last: l }) => (
              <li key={task} className="flex items-center py-3 first:pt-0 last:pb-0">
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-brand-soft text-brand-icon">
                  <TaskIcon task={task} size={18} />
                </span>
                <span className="ml-2.5 flex-1 text-sm font-bold text-p-title">{TASK_LABEL[task]}</span>
                <span className="text-sm text-p-gray tabular-nums">{f!.value}{unitOf(f!.unit)} →&nbsp;</span>
                <span className="w-12 text-sm font-bold text-p-title tabular-nums">{l!.value}{unitOf(l!.unit)}</span>
                <span className="w-12 text-right text-xs font-bold text-brand-deep">{trendWord(f!.value, l!.value, l!.unit)}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* 공통 지표 */}
        {a0 && a1 && (
          <Card>
            <p className="text-base font-bold text-p-title">공통 지표</p>
            <div className="mt-4 grid grid-cols-2 px-[18px]">
              {(["caregiverOrientSec", "activitySec"] as const).map((k) => (
                <div key={k}>
                  <p className="text-[13px] text-p-gray">{k === "caregiverOrientSec" ? "보호자 지향 비율" : "활동량 비율"}</p>
                  <p className="mt-1.5 text-[15px] text-p-title">
                    {ambientPct(a0, k)}% → <b>{ambientPct(a1, k)}%</b>
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 수행 이력 */}
        <Card>
          <p className="text-base font-bold text-p-title">수행 이력</p>
          <div className="mt-5 grid grid-cols-3 gap-6 px-2.5">
            {[
              { v: `${doneCount}회`, l: "완료한 과제" },
              { v: `${dayCount}일`, l: "기록한 날" },
              { v: `${retryCount}회`, l: "재촬영" },
            ].map(({ v, l }) => (
              <div key={l} className="text-center">
                <p className="flex h-9 items-center justify-center rounded-full border border-[#E6E6E6] text-xl font-bold text-p-title">{v}</p>
                <p className="mt-2.5 text-xs text-p-gray">{l}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* 선생님께 물어볼 것 */}
        <section className="mt-8 px-[18px]">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-p-title">선생님께 물어볼 것</h2>
            <button type="button" onClick={() => setAdding(true)} className="text-[13px] font-bold text-brand-deep">+ 추가</button>
          </div>
          <ul className="mt-4 space-y-2">
            {questions.map((q, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl bg-p-card px-[25px] py-3.5">
                <QuestionIcon size={18} className="mt-0.5 flex-shrink-0 text-p-light" />
                <p className="flex-1 text-sm leading-[17px] text-p-body whitespace-pre-line">{q}</p>
                <button type="button" onClick={() => remove(i)} aria-label="질문 지우기" className="text-p-light">×</button>
              </li>
            ))}
            {adding && (
              <li className="rounded-xl bg-p-card p-3">
                <textarea
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="진료 때 물어볼 것을 적어주세요"
                  rows={2}
                  className="w-full resize-none bg-transparent text-sm text-p-body placeholder:text-p-light focus:outline-none"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => { setAdding(false); setDraft(""); }} className="h-8 rounded-lg px-3 text-[13px] text-p-gray">취소</button>
                  <button
                    type="button"
                    disabled={!draft.trim()}
                    onClick={() => { add(draft.trim()); setDraft(""); setAdding(false); }}
                    className="h-8 rounded-lg bg-brand px-3 text-[13px] font-bold text-white disabled:opacity-50"
                  >
                    저장
                  </button>
                </div>
              </li>
            )}
          </ul>
        </section>

        {/* 함께 보낼 장면 */}
        {scenes.length > 0 && (
          <section className="mt-12 px-[18px]">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-p-title">함께 보낼 장면</h2>
              <span className="text-[13px] text-p-gray">{picked.length}개 선택</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {scenes.map((r) => {
                const on = picked.includes(r.id);
                return (
                  <button key={r.id} type="button" onClick={() => togglePick(r.id)} aria-pressed={on} className="text-left">
                    <span className="relative flex h-[92px] items-center justify-center rounded-xl bg-brand-photo text-brand-icon">
                      <PlayIcon size={22} />
                      <span className={`absolute right-1.5 top-1.5 flex h-[22px] w-[22px] items-center justify-center rounded-full text-white ${on ? "bg-brand" : "border border-white bg-black/10"}`}>
                        {on && <CheckIcon size={14} />}
                      </span>
                    </span>
                    <span className="mt-2 block text-xs text-p-body">
                      {TASK_LABEL[r.taskType]} · {fmtSlash(r.recordedAt)}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-p-gray">영상은 공유할 때 직접 고른 장면만 보내져요</p>
          </section>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="flex items-center gap-2.5 border-t border-p-line bg-white px-5 py-3">
        <button type="button" onClick={() => window.print()} className="flex h-[54px] w-[132px] items-center justify-center gap-1.5 text-base font-bold text-p-title">
          <PdfIcon size={18} />
          PDF 저장
        </button>
        <button type="button" onClick={() => setShareOpen(true)} className="h-[54px] flex-1 rounded-[14px] bg-brand text-base font-bold text-white">
          의사에게 공유하기
        </button>
      </div>
      <ParentNav />

      {shareOpen && (
        <ShareSheet sceneCount={picked.length} hasQuestions={questions.length > 0} onClose={() => setShareOpen(false)} />
      )}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <section className="mt-4 rounded-2xl border border-p-line px-[17px] py-[18px]">{children}</section>;
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** "선생님께 보여주세요" — QR과 6자리 코드. 데모용 QR 이미지(Figma)를 써요. */
function ShareSheet({ sceneCount, hasQuestions, onClose }: { sceneCount: number; hasQuestions: boolean; onClose: () => void }) {
  const [code] = useState(() => Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join(""));
  const [expiresAt] = useState(() => Date.now() + 60 * 60 * 1000);
  const [now, setNow] = useState(() => Date.now());
  const [toast, setToast] = useState("");

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  const minutes = Math.max(0, Math.ceil((expiresAt - now) / 60000));
  const contents = ["지표", hasQuestions && "질문", sceneCount > 0 && `장면 ${sceneCount}개`].filter(Boolean).join(" · ");

  async function sendLink() {
    const url = `${location.origin}/doctor/invite?code=${code}`;
    try {
      if (navigator.share) await navigator.share({ title: "베베뷰 진료 요약", text: `연결 코드 ${code}`, url });
      else {
        await navigator.clipboard.writeText(url);
        setToast("링크를 복사했어요");
      }
    } catch { /* 사용자가 공유를 취소함 */ }
  }

  return (
    <BottomSheet open onClose={onClose} title="">
      <div className="text-center">
        <h2 className="text-[22px] font-bold text-p-title">선생님께 보여주세요</h2>
        <p className="mt-2 text-[13px] text-p-gray">QR을 찍거나 코드를 입력하면 진료 요약이 열려요</p>
        <div className="mx-auto mt-4 flex h-[152px] w-[152px] items-center justify-center rounded-2xl border border-p-line">
          <img src="/images/qr-sample.png" alt="연결 QR 코드" className="h-[128px] w-[128px]" />
        </div>
        <p className="mt-3 text-[26px] font-bold tracking-[0.04em] text-p-title">{code}</p>
        <p className="mt-1 text-[13px] text-p-gray">{minutes}분 뒤 만료돼요</p>
      </div>
      <div className="mt-5 flex items-center border-t border-p-line pt-4 text-sm">
        <span className="text-p-gray">보여줄 내용</span>
        <b className="ml-2 flex-1 text-p-title">{contents}</b>
        <ChevronRightIcon size={18} className="text-p-light" />
      </div>
      {toast && <p className="mt-3 text-center text-[13px] font-bold text-brand-deep">{toast}</p>}
      <div className="mt-5 flex gap-2.5">
        <button type="button" onClick={onClose} className="h-[54px] w-[128px] rounded-[14px] bg-p-card text-base font-bold text-p-body">
          공유 멈추기
        </button>
        <button type="button" onClick={sendLink} className="h-[54px] flex-1 rounded-[14px] bg-brand text-base font-bold text-white">
          링크 보내기
        </button>
      </div>
    </BottomSheet>
  );
}
