import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockAppointments, mockPatients, isoDay, type MockAppointment } from "../../../data/mockDoctor";
import { CalendarIcon, CheckIcon, Chevron20Icon, InfoIcon, PlusIcon } from "../../../components/icons";
import DoctorNav from "../_nav";
import { DAY, WEEKDAY } from "../format";

// Figma 의사 버전 진료일정 — 프레임 없이 흩어진 부품을 조립함
const toIso = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function statusText(a: MockAppointment, newRecords: number) {
  if (a.status === "done") return "진료 완료 · 메모 저장됨";
  if (a.status === "retake") return "재촬영 요청 보냄";
  if (a.status === "unread") return `요약 미확인${newRecords ? ` · 새 기록 ${newRecords}` : ""}`;
  return "예정";
}

export default function DoctorAppointmentsScreen() {
  const navigate = useNavigate();
  const today = isoDay(0);
  const [selected, setSelected] = useState(today);

  // 이번 주 (월요일 시작)
  const [week] = useState(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    const monday = d.getTime() - ((d.getDay() + 6) % 7) * DAY;
    return Array.from({ length: 7 }, (_, i) => monday + i * DAY);
  });
  const month = new Date(week[3]).getMonth() + 1;
  const hasAppt = (iso: string) => mockAppointments.some((a) => a.date === iso);

  const list = mockAppointments
    .filter((a) => a.date === selected)
    .sort((a, b) => a.time.localeCompare(b.time))
    .map((a) => ({ a, p: mockPatients.find((p) => p.id === a.patientId)! }));
  const sel = new Date(`${selected}T12:00:00`);

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      <div className="flex-1 pb-6">
        <div className="flex items-center justify-between px-5 pt-16">
          <h1 className="text-2xl font-bold text-p-title">{month}월</h1>
          <span className="flex items-center gap-1 text-sm font-bold text-brand-icon">
            <CalendarIcon size={16} />
            월 보기
          </span>
        </div>

        {/* 주간 달력 */}
        <div className="mt-5 grid grid-cols-7 px-3 text-center">
          {week.map((ts) => {
            const iso = toIso(ts);
            const d = new Date(ts);
            const on = iso === selected;
            return (
              <button key={iso} type="button" onClick={() => setSelected(iso)} className="flex flex-col items-center">
                <span className="text-[11px] text-p-gray">{WEEKDAY[d.getDay()]}</span>
                <span className={`mt-2.5 flex h-[38px] w-[38px] items-center justify-center rounded-full text-base ${
                  on ? "bg-brand font-bold text-white" : iso === today ? "font-bold text-brand-icon" : "text-p-title"
                }`}>
                  {d.getDate()}
                </span>
                <span className={`mt-1.5 h-[5px] w-[5px] rounded-full ${hasAppt(iso) ? "bg-brand" : ""}`} />
              </button>
            );
          })}
        </div>
        <div className="mt-4 h-px bg-p-line" />

        <div className="flex items-center justify-between px-5 pt-6">
          <h2 className="text-base font-bold text-p-title">
            {sel.getDate()}일 {WEEKDAY[sel.getDay()]}요일 · {list.length}건
          </h2>
          <span className="flex items-center gap-1 text-[13px] font-bold text-brand-icon">
            <PlusIcon size={12} />
            일정 추가
          </span>
        </div>

        <ul className="mt-5 space-y-3 px-5">
          {list.length === 0 && <li className="py-8 text-center text-sm text-p-gray">이날은 진료가 없어요</li>}
          {list.map(({ a, p }) => {
            const done = a.status === "done";
            return (
              <li key={a.id} className="flex items-start gap-4">
                <span className="w-[42px] pt-3 text-sm font-bold text-p-title tabular-nums">{a.time}</span>
                <button
                  type="button"
                  onClick={() => navigate(`/doctor/patients/${p.id}`)}
                  className={`flex min-h-[75px] flex-1 items-center rounded-xl px-4 text-left ${
                    done ? "bg-p-card" : "border border-brand bg-white"
                  }`}
                >
                  <span className="flex-1">
                    <span className="flex items-baseline gap-1.5">
                      <span className={`text-base font-bold ${done ? "text-p-light" : "text-p-title"}`}>{p.name}</span>
                      <span className={`text-xs ${done ? "text-p-light" : "text-p-gray"}`}>{p.ageMonths}개월</span>
                    </span>
                    <span className={`mt-1.5 block text-xs ${done ? "text-p-light" : "text-p-gray"}`}>{statusText(a, p.newRecords)}</span>
                  </span>
                  {done ? <CheckIcon size={16} className="text-p-light" /> : <Chevron20Icon size={20} className="text-p-light" />}
                </button>
              </li>
            );
          })}
        </ul>

        {list.length > 0 && (
          <p className="mx-5 mt-4 ml-[78px] flex items-center gap-2 rounded-xl bg-brand-soft px-3.5 py-3 text-xs text-p-body">
            <InfoIcon size={14} className="text-brand-icon" />
            진료 하루 전 보호자에게 촬영 알림이 가요
          </p>
        )}
      </div>
      <DoctorNav />
    </div>
  );
}
