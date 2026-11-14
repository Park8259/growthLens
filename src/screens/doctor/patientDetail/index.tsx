import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mockPatients, mockAppointments } from "../../../data/mockDoctor";
import { getPeerNorm, compareToNorm, HIGHER_IS_BETTER } from "../../../data/mockNorms";
import { useNotesStore } from "../../../store/notes";
import type { TaskType } from "../../../types/analysis";

const TASK_LABEL: Record<TaskType, string> = {
  gross_motor: "대근육",
  fine_motor:  "소근육",
  social:      "사회성",
};

const MS_PER_MONTH = (365.25 / 12) * 24 * 60 * 60 * 1000;

type Tab = "records" | "graphs" | "appointments" | "memo";

export default function PatientDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("records");

  const patient = mockPatients.find((p) => p.id === id);
  if (!patient) return null;

  const TAB_LABELS: { key: Tab; label: string }[] = [
    { key: "records",      label: "기록"  },
    { key: "graphs",       label: "그래프" },
    { key: "appointments", label: "예약"  },
    { key: "memo",         label: "메모"  },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      {/* 헤더 */}
      <div className="px-4 pt-14 pb-0 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-gray-500">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M14 5l-6 6 6 6" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{patient.name}</h1>
            <p className="text-xs text-gray-400">
              {patient.ageMonths}개월 · {patient.gender === "male" ? "남아" : "여아"} · {patient.parentName} 보호자
            </p>
          </div>
        </div>

        <div className="flex">
          {TAB_LABELS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === key
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "records"      && <RecordsTab      patient={patient} />}
        {tab === "graphs"       && <GraphsTab        patient={patient} />}
        {tab === "appointments" && <AppointmentsTab  patient={patient} />}
        {tab === "memo"         && <MemoTab          patientId={patient.id} patientName={patient.name} />}
      </div>
    </div>
  );
}

/* ── 기록 탭 ───────────────────────────────────────────────── */

function RecordsTab({ patient }: { patient: typeof mockPatients[0] }) {
  const groups = patient.records
    .slice()
    .sort((a, b) => b.recordedAt - a.recordedAt)
    .reduce<Record<string, typeof patient.records>>((acc, r) => {
      const key = new Date(r.recordedAt).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
      (acc[key] ??= []).push(r);
      return acc;
    }, {});

  return (
    <div className="px-5 py-4 space-y-5">
      {Object.entries(groups).map(([date, records]) => (
        <div key={date}>
          <p className="text-xs font-medium text-gray-400 mb-2">{date}</p>
          <div className="space-y-0">
            {records.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {TASK_LABEL[r.taskType]}
                  </span>
                  <span className="text-sm text-gray-800">
                    {r.result.status === "success" ? r.result.metric?.label : "재촬영 필요"}
                  </span>
                </div>
                {r.result.status === "success" && r.result.metric ? (
                  <span className="text-sm font-semibold text-gray-900">
                    {r.result.metric.value}{r.result.metric.unit === "seconds" ? "초" : "회"}
                  </span>
                ) : (
                  <span className="text-xs text-orange-500">재촬영</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── 그래프 탭 ─────────────────────────────────────────────── */

function GraphsTab({ patient }: { patient: typeof mockPatients[0] }) {
  const tasks: TaskType[] = ["gross_motor", "fine_motor", "social"];

  return (
    <div className="px-5 py-5 space-y-7">
      {/* 범례 */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-5 h-0.5 bg-gray-900 rounded" />
          {patient.name}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-5 border-t-2 border-dashed border-gray-400" />
          또래 평균
        </span>
      </div>

      {tasks.map((taskType) => {
        const data = patient.records
          .filter((r) => r.taskType === taskType && r.result.status === "success" && r.result.metric)
          .sort((a, b) => a.recordedAt - b.recordedAt);

        if (data.length === 0) return null;

        const values    = data.map((r) => r.result.metric!.value);
        const normValues = data.map((r) => {
          const ageAtRecord = Math.floor(
            (r.recordedAt - new Date(patient.birthDate).getTime()) / MS_PER_MONTH
          );
          return getPeerNorm(taskType, ageAtRecord);
        });

        const latest   = values[values.length - 1];
        const latestNorm = normValues[normValues.length - 1];
        const unit     = data[0].result.metric!.unit;
        const unitLabel = unit === "seconds" ? "초" : "회";
        const status   = compareToNorm(latest, latestNorm, HIGHER_IS_BETTER[taskType]);

        const statusConfig = {
          good:      { text: "또래보다 양호해요",   color: "text-emerald-600" },
          average:   { text: "또래 평균 수준이에요", color: "text-gray-500"    },
          attention: { text: "주의 관찰이 필요해요", color: "text-orange-500"  },
        }[status];

        return (
          <div key={taskType}>
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="text-xs text-gray-400">{TASK_LABEL[taskType]}</span>
                <p className="text-sm font-medium text-gray-800">{data[0].result.metric!.label}</p>
              </div>
              <p className={`text-xs font-medium ${statusConfig.color}`}>
                {statusConfig.text}
              </p>
            </div>

            <LineChart values={values} normValues={normValues} />

            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>최신 측정 <strong className="text-gray-900">{latest}{unitLabel}</strong></span>
              <span>또래 평균 <strong className="text-gray-600">{latestNorm}{unitLabel}</strong></span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LineChart({ values, normValues }: { values: number[]; normValues: number[] }) {
  const W = 300;
  const H = 80;
  const pad = 12;

  if (values.length < 2) return null;

  const all = [...values, ...normValues];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;

  function toCoord(v: number, i: number, total: number) {
    return {
      x: pad + (i / (total - 1)) * (W - pad * 2),
      y: H - pad - ((v - min) / range) * (H - pad * 2),
    };
  }

  const patientPts  = values.map((v, i) => toCoord(v, i, values.length));
  const normPts     = normValues.map((v, i) => toCoord(v, i, normValues.length));

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="bg-gray-50 rounded-2xl p-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {/* 또래 평균 — 점선 회색 */}
        <path d={toPath(normPts)} stroke="#bbb" strokeWidth={1.5} fill="none"
          strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round" />

        {/* 환자 — 실선 검정 */}
        <path d={toPath(patientPts)} stroke="#111" strokeWidth={2} fill="none"
          strokeLinecap="round" strokeLinejoin="round" />
        {patientPts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#111" />
        ))}
      </svg>
    </div>
  );
}

/* ── 예약 탭 ───────────────────────────────────────────────── */

function AppointmentsTab({ patient }: { patient: typeof mockPatients[0] }) {
  const today = new Date().toISOString().split("T")[0];
  const all = mockAppointments
    .filter((a) => a.patientId === patient.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const upcoming = all.filter((a) => a.date >= today);
  const past     = all.filter((a) => a.date <  today);

  function fmt(date: string, time: string) {
    const d = new Date(date);
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const [h, m] = time.split(":").map(Number);
    const ampm = h < 12 ? "오전" : "오후";
    const hour = h <= 12 ? h : h - 12;
    return `${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]} · ${ampm} ${hour}:${String(m).padStart(2, "0")}`;
  }

  return (
    <div className="px-5 py-5 space-y-5">
      {upcoming.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 mb-3">예정된 예약</p>
          {upcoming.map((a) => (
            <div key={a.id} className="flex items-center gap-3 py-3 border-b border-gray-50">
              <div className="w-2 h-2 rounded-full bg-gray-900 flex-shrink-0" />
              <span className="text-sm text-gray-800">{fmt(a.date, a.time)}</span>
            </div>
          ))}
        </div>
      )}
      {past.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 mb-3">지난 예약</p>
          {past.map((a) => (
            <div key={a.id} className="flex items-center gap-3 py-3 border-b border-gray-50">
              <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
              <span className="text-sm text-gray-400">{fmt(a.date, a.time)}</span>
            </div>
          ))}
        </div>
      )}
      <button className="w-full py-3.5 rounded-2xl border border-gray-200 text-sm font-medium text-gray-700">
        + 예약 추가하기
      </button>
    </div>
  );
}

/* ── 메모 탭 ───────────────────────────────────────────────── */

function MemoTab({ patientId, patientName }: { patientId: string; patientName: string }) {
  const notes    = useNotesStore((s) => s.notes.filter((n) => n.patientId === patientId));
  const addNote  = useNotesStore((s) => s.addNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);

  const [isAdding, setIsAdding] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newText, setNewText] = useState("");

  const sorted = [...notes].sort((a, b) => b.date.localeCompare(a.date));

  function handleSave() {
    if (!newText.trim()) return;
    addNote({ patientId, date: newDate, text: newText.trim() });
    setNewText("");
    setNewDate(new Date().toISOString().split("T")[0]);
    setIsAdding(false);
  }

  function fmtDate(iso: string) {
    const d = new Date(iso);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  }

  return (
    <div className="px-5 py-5 space-y-4">
      {/* 추가 폼 */}
      {isAdding ? (
        <div className="border border-gray-200 rounded-2xl p-4 space-y-3">
          <input
            type="date"
            value={newDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setNewDate(e.target.value)}
            className="text-sm text-gray-700 bg-transparent outline-none"
          />
          <textarea
            autoFocus
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder={`${patientName}에 대한 진료 메모를 입력하세요`}
            rows={4}
            className="w-full text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none resize-none"
          />
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { setIsAdding(false); setNewText(""); }}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={!newText.trim()}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-colors ${
                newText.trim() ? "bg-gray-900" : "bg-gray-300"
              }`}
            >
              저장
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-3 rounded-2xl border border-dashed border-gray-300 text-sm text-gray-500 flex items-center justify-center gap-1.5"
        >
          <span className="text-lg leading-none">+</span> 메모 추가
        </button>
      )}

      {/* 메모 목록 */}
      {sorted.length === 0 && !isAdding ? (
        <p className="text-sm text-gray-400 text-center py-10">아직 메모가 없어요</p>
      ) : (
        sorted.map((note) => (
          <div key={note.id} className="border border-gray-100 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400">{fmtDate(note.date)}</span>
              <button
                onClick={() => deleteNote(note.id)}
                className="text-gray-300 hover:text-gray-500 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{note.text}</p>
          </div>
        ))
      )}
    </div>
  );
}
