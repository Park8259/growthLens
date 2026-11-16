import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockPatients, nextAppointment, isoDay } from "../../../data/mockDoctor";
import { Pill } from "../../../components/ParentNav";
import { Chevron20Icon, PlusIcon, SearchIcon } from "../../../components/icons";
import DoctorNav, { Avatar } from "../_nav";
import { ago, genderShort, slash } from "../format";

// Figma 의사 버전 "환자목록"
type Filter = "all" | "new" | "week" | "pending";

export default function DoctorPatientsScreen() {
  const navigate = useNavigate();
  const [now] = useState(() => Date.now());
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const weekEnd = isoDay(7);
  const rows = mockPatients.map((p) => {
    const last = [...p.records].sort((a, b) => b.recordedAt - a.recordedAt)[0];
    const next = nextAppointment(p.id);
    const retake = last?.result.status === "retry_needed";
    return { p, last, next, retake };
  });

  const counts = {
    new: rows.filter((r) => r.p.newRecords > 0).length,
    week: rows.filter((r) => r.next && r.next.date <= weekEnd).length,
    pending: rows.filter((r) => r.p.pending).length,
  };

  const shown = rows
    .filter(({ p }) => !query.trim() || p.name.includes(query.trim()) || p.parentName.includes(query.trim()))
    .filter((r) =>
      filter === "all" ? true
        : filter === "new" ? r.p.newRecords > 0
          : filter === "week" ? Boolean(r.next && r.next.date <= weekEnd)
            : Boolean(r.p.pending),
    );

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "new", label: `새 기록 ${counts.new}` },
    { key: "week", label: "이번 주 진료" },
    { key: "pending", label: "연결 대기" },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      <div className="flex-1 px-5 pt-16 pb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-p-title">
            환자 <span className="text-brand">{mockPatients.length}</span>
          </h1>
          <button type="button" onClick={() => navigate("/doctor/invite")} className="flex h-[38px] items-center gap-1.5 rounded-full bg-brand px-4 text-sm font-bold text-white">
            <PlusIcon size={18} />
            환자 연결
          </button>
        </div>

        <label className="mt-2.5 flex h-[46px] items-center gap-2.5 rounded-xl bg-p-card px-3.5">
          <SearchIcon size={20} className="text-p-light" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="아이 이름, 보호자 이름 검색"
            className="flex-1 bg-transparent text-[15px] text-p-title placeholder:text-p-light focus:outline-none"
          />
        </label>

        <div className="mt-3.5 flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`h-[38px] flex-shrink-0 rounded-xl px-3.5 text-sm ${
                filter === key ? "bg-brand font-bold text-white" : "border border-p-line bg-white text-p-body"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <ul className="mt-5 space-y-3">
          {shown.map(({ p, last, next, retake }) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => !p.pending && navigate(`/doctor/patients/${p.id}`)}
                className="flex w-full items-center rounded-2xl border border-p-line px-4 py-4 text-left"
              >
                <Avatar name={p.name} muted={Boolean(p.pending)} />
                <span className="ml-3.5 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className={`text-[17px] font-bold ${p.pending ? "text-p-light" : "text-p-title"}`}>{p.name}</span>
                    <span className="text-[13px] text-p-light">{p.ageMonths}개월 · {genderShort(p.gender)}</span>
                  </span>
                  <span className="mt-1.5 block text-[13px] text-p-gray">
                    {p.pending
                      ? "보호자 수락을 기다리고 있어요"
                      : `마지막 기록 ${last ? ago(last.recordedAt, now) : "없음"} · 총 ${p.records.length}회`}
                  </span>
                  <span className="mt-2 flex gap-1.5">
                    {p.pending ? (
                      <Pill tone="gray">초대 보냄 · {p.pending.invitedDaysAgo}일 전</Pill>
                    ) : (
                      <>
                        {retake ? <Pill tone="warn">재촬영 대기</Pill> : p.newRecords > 0 && <Pill>새 기록 {p.newRecords}</Pill>}
                        {next && <Pill tone="gray">{slash(next.date)} 진료</Pill>}
                      </>
                    )}
                  </span>
                </span>
                <Chevron20Icon size={20} className="text-p-light" />
              </button>
            </li>
          ))}
          {shown.length === 0 && <li className="py-10 text-center text-sm text-p-gray">찾는 환자가 없어요</li>}
        </ul>
      </div>
      <DoctorNav />
    </div>
  );
}
