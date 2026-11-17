import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockAppointments, mockDoctor, mockPatients, isoDay } from "../../../data/mockDoctor";
import { Pill } from "../../../components/ParentNav";
import { BellIcon, Chevron20Icon } from "../../../components/icons";
import { TASK_LABEL } from "../../../data/tasks";
import DoctorNav, { Avatar } from "../_nav";
import { agoTime, fullDay, genderShort } from "../format";

// Figma 의사 버전 "오늘진료"
export default function DoctorTodayScreen() {
  const navigate = useNavigate();
  const [now] = useState(() => Date.now());
  const today = isoDay(0);

  const visits = mockAppointments
    .filter((a) => a.date === today)
    .sort((a, b) => a.time.localeCompare(b.time))
    .map((a) => ({ ...a, patient: mockPatients.find((p) => p.id === a.patientId)! }));

  const newTotal = mockPatients.reduce((n, p) => n + p.newRecords, 0);
  const questionTotal = mockPatients.filter((p) => p.question).length;

  // 새로 올라온 기록: 새 기록이 있는 환자마다 가장 최근 기록 하나 (최신순)
  const latest = mockPatients
    .filter((p) => p.newRecords > 0)
    .map((p) => ({ p, r: [...p.records].sort((a, b) => b.recordedAt - a.recordedAt)[0] }))
    .filter(({ r }) => r)
    .sort((a, b) => b.r.recordedAt - a.r.recordedAt);

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      <div className="flex-1 pb-6">
        <div className="px-5 pt-16">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] text-p-gray">{mockDoctor.hospital} · {mockDoctor.specialty}</p>
              <h1 className="mt-2.5 text-[26px] font-bold text-p-title">{mockDoctor.name} 선생님</h1>
            </div>
            <span className="relative mt-1.5 text-p-title">
              <BellIcon size={24} />
              <span className="absolute right-0 top-0 h-[7px] w-[7px] rounded-full bg-warn-dot" />
            </span>
          </div>

          {/* 오늘 요약 */}
          <div className="mt-3.5 h-[120px] rounded-[18px] bg-brand px-5 pt-[17px] text-white">
            <p className="text-sm font-bold">{fullDay(now)}</p>
            <div className="mt-4 grid grid-cols-3 text-center">
              {[
                { l: "오늘 진료", v: `${visits.length}명` },
                { l: "새 기록", v: `${newTotal}건` },
                { l: "보호자 질문", v: `${questionTotal}건` },
              ].map(({ l, v }) => (
                <div key={l}>
                  <p className="text-xs">{l}</p>
                  <p className="mt-1 text-[26px] leading-[31px] font-bold">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 오늘 진료 */}
          <div className="mt-[22px] flex items-baseline justify-between">
            <h2 className="text-base font-bold text-p-title">오늘 진료</h2>
            <span className="text-[13px] text-p-gray">진료 전에 요약을 확인하세요</span>
          </div>
          <ul className="mt-2 divide-y divide-p-line">
            {visits.length === 0 && <li className="py-6 text-center text-sm text-p-gray">오늘은 진료가 없어요</li>}
            {visits.map(({ id, time, status, patient: p }) => {
              const done = status === "done";
              return (
                <li key={id}>
                  <button type="button" onClick={() => navigate(`/doctor/patients/${p.id}`)} className="flex w-full items-start py-4 text-left">
                    <span className={`w-[60px] pt-0.5 text-[15px] font-bold tabular-nums ${done ? "text-p-light" : "text-brand"}`}>{time}</span>
                    <span className="flex-1">
                      <span className="flex items-baseline gap-2">
                        <span className={`text-base font-bold ${done ? "text-p-light" : "text-p-title"}`}>{p.name}</span>
                        <span className={`text-[13px] ${done ? "text-p-light" : "text-p-gray"}`}>{p.ageMonths}개월 · {genderShort(p.gender)}</span>
                      </span>
                      <span className="mt-2.5 flex gap-1.5">
                        {done ? (
                          <Pill tone="gray" className="text-[#4A4A4A]">확인 완료</Pill>
                        ) : (
                          <>
                            {p.newRecords > 0 && <Pill className="text-brand-icon">새 기록 {p.newRecords}</Pill>}
                            {status === "retake" ? (
                              <Pill tone="warn">재촬영 대기</Pill>
                            ) : (
                              p.question && <Pill tone="gray" className="text-[#4A4A4A]">보호자 질문 1</Pill>
                            )}
                          </>
                        )}
                      </span>
                    </span>
                    <Chevron20Icon size={20} className="mt-3 text-p-light" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-2 h-2 bg-p-card" />

        {/* 새로 올라온 기록 */}
        <div className="px-5 pt-[19px]">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-bold text-p-title">새로 올라온 기록</h2>
            <button type="button" onClick={() => navigate("/doctor/patients")} className="text-[13px] text-p-gray">전체 보기</button>
          </div>
          <ul className="mt-4 space-y-4">
            {latest.map(({ r, p }) => {
              const ok = r.result.status === "success";
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => navigate(ok ? `/doctor/patients/${p.id}/scene/${r.id}` : `/doctor/patients/${p.id}`)}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <Avatar name={p.name} size={40} />
                    <span className="flex-1">
                      <span className="block text-[15px]">
                        <b className="text-p-title">{p.name}</b>
                        <span className="text-p-gray"> · {TASK_LABEL[r.taskType]}</span>
                      </span>
                      <span className="mt-1 block text-xs text-p-light">{agoTime(r.recordedAt, now)}</span>
                    </span>
                    {ok ? <Pill className="text-brand-icon">확인</Pill> : <Pill tone="warn">재촬영</Pill>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <DoctorNav />
    </div>
  );
}
