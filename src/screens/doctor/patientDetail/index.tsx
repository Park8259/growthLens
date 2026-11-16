import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mockPatients, nextAppointment, lastVisit, isoDay, type MockPatient } from "../../../data/mockDoctor";
import { PEER_BAND } from "../../../data/mockNorms";
import { useNotesStore } from "../../../store/notes";
import { Pill } from "../../../components/ParentNav";
import TaskIcon from "../../../components/TaskIcon";
import { ArrowDownIcon, ArrowUpIcon, BackIcon, MemoIcon, PencilIcon, PlayFillIcon } from "../../../components/icons";
import { TASK_LABEL, TASK_ORDER, unitOf } from "../../../data/tasks";
import type { TaskType } from "../../../types/analysis";
import MemoSheet from "./MemoSheet";
import { DAY, fromIso, genderLong, SCENE_IMAGES, WEEKDAY } from "../format";

// Figma 의사 버전 "진료요약"(요약 탭), "iPhone 16 - 4"(그래프 탭), "진료메모"(시트)
type Tab = "summary" | "records" | "graph" | "memo";
const TABS: { key: Tab; label: string }[] = [
  { key: "summary", label: "요약" },
  { key: "records", label: "기록" },
  { key: "graph", label: "그래프" },
  { key: "memo", label: "메모" },
];

const md = (ts: number) => {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

export default function PatientDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("summary");
  const [memoOpen, setMemoOpen] = useState(false);

  const patient = mockPatients.find((p) => p.id === id);
  if (!patient) return null;
  const next = nextAppointment(patient.id);
  const today = isoDay(0);

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white">
        <div className="flex items-start gap-3 px-4 pt-[60px]">
          <button type="button" onClick={() => navigate(-1)} aria-label="뒤로 가기" className="mt-0.5 text-p-title">
            <BackIcon size={24} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-p-title">{patient.name}</h1>
              {next && (
                <span className="flex h-7 items-center rounded-full bg-brand-chip px-2.5 text-xs font-bold text-[#37B4DE]">
                  {next.date === today ? "오늘" : `${Number(next.date.slice(5, 7))}/${Number(next.date.slice(8))}`} {next.time} 진료
                </span>
              )}
            </div>
            <p className="mt-1.5 text-[13px] text-p-gray">
              {patient.ageMonths}개월 · {genderLong(patient.gender)} · 보호자 {patient.parentName}
            </p>
          </div>
        </div>
        <div className="mt-5 flex border-b border-p-line">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex-1 pb-3 text-[15px] ${tab === key ? "border-b-2 border-brand font-bold text-p-title" : "text-p-light"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 pb-6">
        {tab === "summary" && <SummaryTab patient={patient} />}
        {tab === "records" && <RecordsTab patient={patient} />}
        {tab === "graph" && <GraphTab patient={patient} />}
        {tab === "memo" && <MemoTab patientId={patient.id} />}
      </div>

      {(tab === "summary" || tab === "memo") && (
        <div className="sticky bottom-0 bg-white px-5 pt-3 pb-8">
          <button
            type="button"
            onClick={() => setMemoOpen(true)}
            className="flex h-[54px] w-full items-center justify-center gap-2 rounded-[14px] bg-brand text-base font-bold text-white"
          >
            <PencilIcon size={20} />
            진료 메모 쓰기
          </button>
        </div>
      )}

      {memoOpen && <MemoSheet patientId={patient.id} onClose={() => setMemoOpen(false)} />}
    </div>
  );
}

/* ── 요약 탭 ── */

function SummaryTab({ patient }: { patient: MockPatient }) {
  const navigate = useNavigate();
  const visit = lastVisit(patient.id);
  const since = visit ? fromIso(visit.date) + DAY : 0;
  const sorted = [...patient.records].sort((a, b) => a.recordedAt - b.recordedAt);
  const after = sorted.filter((r) => r.recordedAt >= since);

  const rows = TASK_ORDER.map((task) => {
    const ok = sorted.filter((r) => r.taskType === task && r.result.status === "success" && r.result.metric);
    const before = ok.filter((r) => r.recordedAt < since).pop() ?? ok[0];
    const latest = ok[ok.length - 1];
    return { task, before, latest };
  }).filter((r) => r.before && r.latest && r.before !== r.latest);

  const scenes = [...sorted].reverse().filter((r) => r.result.status === "success").slice(0, 2);

  return (
    <>
      <div className="mt-6 flex items-baseline justify-between">
        <h2 className="text-base font-bold text-p-title">{visit ? "지난 진료 이후 변화" : "기록 변화"}</h2>
        {visit && (
          <span className="text-[13px] text-p-gray">
            {Number(visit.date.slice(5, 7))}/{Number(visit.date.slice(8))} 이후 기록 {after.length}회
          </span>
        )}
      </div>
      <ul className="mt-2 divide-y divide-p-line">
        {rows.length === 0 && <li className="py-4 text-sm text-p-gray">비교할 기록이 아직 없어요</li>}
        {rows.map(({ task, before, latest }) => {
          const a = before!.result.metric!;
          const b = latest!.result.metric!;
          const up = b.value > a.value;
          const same = b.value === a.value;
          return (
            <li key={task} className="flex h-[70px] items-center">
              <Pill className="h-7 w-[90px] justify-center text-[13px]">{TASK_LABEL[task]}</Pill>
              <span className="ml-2.5 flex-1 text-[13px] tabular-nums">
                <span className="text-p-gray">{a.value}{unitOf(a.unit)} → </span>
                <b className="text-p-title">{b.value}{unitOf(b.unit)}</b>
              </span>
              {!same && (
                <span className={`flex items-center gap-0.5 text-[13px] font-bold ${up ? "text-brand" : "text-p-light"}`}>
                  {up ? <ArrowUpIcon size={16} /> : <ArrowDownIcon size={16} />}
                  {up ? "늘었어요" : "줄었어요"}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {patient.question && (
        <>
          <div className="mt-7 flex items-baseline justify-between">
            <h2 className="text-base font-bold text-p-title">보호자가 남긴 질문</h2>
            <span className="text-[13px] text-p-gray">
              {Number(patient.question.date.slice(5, 7))}월 {Number(patient.question.date.slice(8))}일
            </span>
          </div>
          <div className="mt-3 flex gap-3 rounded-xl bg-p-card px-4 py-4">
            <MemoIcon size={20} className="mt-0.5 flex-shrink-0 text-p-gray" />
            <p className="text-[15px] leading-[21px] text-p-body whitespace-pre-line">{patient.question.text}</p>
          </div>
        </>
      )}

      {scenes.length > 0 && (
        <>
          <div className="mt-7 flex items-baseline justify-between">
            <h2 className="text-base font-bold text-p-title">확인할 장면</h2>
            <span className="text-[13px] text-p-gray">AI가 고른 장면</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {scenes.map((r, i) => (
              <button key={r.id} type="button" onClick={() => navigate(`/doctor/patients/${patient.id}/scene/${r.id}`)} className="text-left">
                <span className="relative block h-[91px] overflow-hidden rounded-xl">
                  <img src={SCENE_IMAGES[i % SCENE_IMAGES.length]} alt="" className="h-full w-full object-cover" />
                  <span className="absolute left-1/2 top-1/2 flex h-[31px] w-[31px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand">
                    <PlayFillIcon size={12} />
                  </span>
                  <span className="absolute bottom-1.5 right-1.5 rounded bg-black/45 px-1.5 text-[11px] font-bold leading-5 text-white">
                    0:{String(24 - i * 6).padStart(2, "0")}
                  </span>
                </span>
                <span className="mt-2 block text-[13px] text-p-body">
                  {TASK_LABEL[r.taskType]} · {md(r.recordedAt)}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}

/* ── 기록 탭 ── */

function RecordsTab({ patient }: { patient: MockPatient }) {
  const navigate = useNavigate();
  const sorted = [...patient.records].sort((a, b) => b.recordedAt - a.recordedAt);
  const groups: { label: string; items: typeof sorted }[] = [];
  for (const r of sorted) {
    const d = new Date(r.recordedAt);
    const label = `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAY[d.getDay()]})`;
    const g = groups.find((x) => x.label === label);
    if (g) g.items.push(r);
    else groups.push({ label, items: [r] });
  }
  if (groups.length === 0) return <p className="py-16 text-center text-sm text-p-gray">아직 기록이 없어요</p>;
  return (
    <>
      {groups.map((g) => (
        <section key={g.label} className="mt-5">
          <h2 className="text-[13px] font-bold text-p-gray">{g.label}</h2>
          <ul className="mt-3 space-y-4">
            {g.items.map((r) => {
              const ok = r.result.status === "success";
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    disabled={!ok}
                    onClick={() => navigate(`/doctor/patients/${patient.id}/scene/${r.id}`)}
                    className="flex w-full items-center text-left"
                  >
                    <span className={`flex h-[38px] w-[38px] items-center justify-center rounded-[10px] ${ok ? "bg-brand-soft text-brand-icon" : "bg-p-card text-p-light"}`}>
                      <TaskIcon task={r.taskType} size={19} />
                    </span>
                    <span className="ml-3 flex-1 text-[15px] font-bold text-p-title">{TASK_LABEL[r.taskType]}</span>
                    {ok && r.result.metric ? (
                      <span className="text-[17px] font-bold text-p-title tabular-nums">
                        {r.result.metric.value}{unitOf(r.result.metric.unit)}
                      </span>
                    ) : (
                      <Pill tone="warn" className="h-[30px] px-3 text-[13px]">재촬영 필요</Pill>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </>
  );
}

/* ── 그래프 탭 ── */

const RANGES = [
  { key: "1m", label: "1개월", days: 31 },
  { key: "3m", label: "3개월", days: 92 },
  { key: "all", label: "전체", days: Infinity },
] as const;
const CATEGORY: Record<TaskType, string> = { name_response: "사회성", imitation: "모방", ball_play: "상호작용" };

function GraphTab({ patient }: { patient: MockPatient }) {
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("1m");
  const [now] = useState(() => Date.now());
  const days = RANGES.find((r) => r.key === range)!.days;

  return (
    <>
      <div className="mt-4 flex rounded-xl bg-p-card p-1">
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setRange(r.key)}
            className={`h-9 flex-1 rounded-[10px] text-sm ${range === r.key ? "bg-white font-bold text-p-title shadow-sm" : "text-p-gray"}`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-p-gray">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-brand-icon" />{patient.name}</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-3 bg-brand-soft" />또래 범위</span>
      </div>

      <div className="mt-3 space-y-3">
        {TASK_ORDER.map((task) => {
          const data = patient.records
            .filter((r) => r.taskType === task && r.result.status === "success" && r.result.metric && now - r.recordedAt <= days * DAY)
            .sort((a, b) => a.recordedAt - b.recordedAt);
          if (data.length === 0) return null;
          const unit = data[0].result.metric!.unit;
          const values = data.map((r) => r.result.metric!.value);
          const band = PEER_BAND[task];
          const last = values[values.length - 1];
          const prev = values[values.length - 2];
          const badge = band
            ? last > band.hi ? { text: "범위보다 길어요", warn: false } : last < band.lo ? { text: "범위보다 짧아요", warn: false } : { text: "범위 안이에요", warn: false }
            : prev !== undefined && prev !== last
              ? { text: `최근 2회 ${last > prev ? "늘었어요" : "줄었어요"}`, warn: true }
              : null;
          return (
            <div key={task} className="rounded-2xl border border-p-line px-4 pt-4 pb-3.5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-p-gray">{CATEGORY[task]}</p>
                  <p className="mt-1 text-base font-bold text-p-title">{TASK_LABEL[task]}</p>
                </div>
                {badge && <Pill tone={badge.warn ? "warn" : "blue"}>{badge.text}</Pill>}
              </div>
              <Chart values={values} labels={data.map((r) => md(r.recordedAt))} unit={unitOf(unit)} band={band} />
              <div className="mt-2 flex justify-between border-t border-p-line pt-3 text-[13px]">
                <span className="text-p-gray">최근 <b className="text-p-title">{last}{unitOf(unit)}</b></span>
                <span className="text-p-gray">{band ? `또래 범위 ${band.lo}~${band.hi}${unitOf(unit)} (${band.note})` : "또래 자료 없음"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Chart({ values, labels, unit, band }: { values: number[]; labels: string[]; unit: string; band?: { lo: number; hi: number } }) {
  const W = 320, H = 150, L = 22, R = 10, T = 10, B = 26;
  const top = Math.ceil(Math.max(...values, band?.hi ?? 0) / 2) * 2 || 2;
  const ticks = [0, 1, 2, 3, 4, 5, 6].map((i) => (top / 6) * i).filter((_, i) => i > 0 && (top <= 12 ? true : i % 2 === 0));
  const x = (i: number) => (values.length === 1 ? (L + W - R) / 2 : L + 6 + (i / (values.length - 1)) * (W - L - R - 12));
  const y = (v: number) => T + (1 - v / top) * (H - T - B);
  const d = values.map((v, i) => `${i ? "L" : "M"}${x(i)} ${y(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" style={{ height: H }}>
      {band && <rect x={L} y={y(Math.min(band.hi, top))} width={W - L - R} height={y(band.lo) - y(Math.min(band.hi, top))} fill="#E6F8FF" />}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#E3E5E8" strokeWidth={1} />
          <text x={L - 6} y={y(t) + 3} fontSize={9} fill="#A8A8A8" textAnchor="end">{Math.round(t * 10) / 10}</text>
        </g>
      ))}
      <text x={L - 6} y={H - B + 12} fontSize={9} fill="#A8A8A8" textAnchor="end">({unit})</text>
      <path d={d} stroke="#009ED3" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={4} fill="#009ED3" />)}
      {labels.map((l, i) => (
        <text key={i} x={x(i)} y={H - 6} fontSize={9} fill="#767676" textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}

/* ── 메모 탭 ── */

function MemoTab({ patientId }: { patientId: string }) {
  const allNotes = useNotesStore((s) => s.notes);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const toggleShare = useNotesStore((s) => s.toggleShare);
  const notes = allNotes.filter((n) => n.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date));

  if (notes.length === 0) return <p className="py-16 text-center text-sm text-p-gray">아직 메모가 없어요</p>;
  return (
    <ul className="mt-5 space-y-3">
      {notes.map((n) => {
        const [, m, d] = n.date.split("-").map(Number);
        return (
          <li key={n.id} className="rounded-2xl border border-p-line px-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-p-gray">{m}월 {d}일</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => toggleShare(n.id)}>
                  <Pill tone={n.isShared ? "blue" : "gray"}>{n.isShared ? "보호자 공개" : "나만 보기"}</Pill>
                </button>
                <button type="button" onClick={() => deleteNote(n.id)} aria-label="메모 지우기" className="px-1 text-lg leading-none text-p-light">×</button>
              </div>
            </div>
            <p className="mt-2.5 text-[15px] leading-6 text-p-body whitespace-pre-line">{n.text}</p>
            {n.nextTasks && n.nextTasks.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {n.nextTasks.map((t) => <Pill key={t} tone="gray">{t}</Pill>)}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
