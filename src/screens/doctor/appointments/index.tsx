import { useNavigate } from "react-router-dom";
import { mockAppointments, mockPatients } from "../../../data/mockDoctor";
import BottomNav from "../../../components/BottomNav";
import { doctorNavItems } from "../_nav";

function formatAppt(date: string, time: string): string {
  const d = new Date(date);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const [h, m] = time.split(":").map(Number);
  const ampm = h < 12 ? "오전" : "오후";
  const hour = h <= 12 ? h : h - 12;
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]} · ${ampm} ${hour}:${String(m).padStart(2, "0")}`;
}

export default function DoctorAppointmentsScreen() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const all = [...mockAppointments].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = all.filter((a) => a.date >= today);
  const past     = all.filter((a) => a.date <  today).reverse();

  function ageMonths(patientId: string): number {
    return mockPatients.find((p) => p.id === patientId)?.ageMonths ?? 0;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-sm mx-auto">
      {/* 헤더 */}
      <div className="bg-white px-6 pt-14 pb-5 border-b border-gray-100">
        <h1 className="text-[22px] font-bold text-gray-900">예약 관리</h1>
        <p className="text-sm text-gray-500 mt-0.5">예정된 예약 {upcoming.length}건</p>
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {upcoming.length > 0 && (
          <Section title="예정된 예약">
            {upcoming.map((a) => (
              <ApptCard
                key={a.id}
                label={formatAppt(a.date, a.time)}
                patientName={a.patientName}
                ageMonths={ageMonths(a.patientId)}
                upcoming
                onClick={() => navigate(`/doctor/patients/${a.patientId}`)}
              />
            ))}
          </Section>
        )}

        {past.length > 0 && (
          <Section title="지난 예약">
            {past.map((a) => (
              <ApptCard
                key={a.id}
                label={formatAppt(a.date, a.time)}
                patientName={a.patientName}
                ageMonths={ageMonths(a.patientId)}
                upcoming={false}
                onClick={() => navigate(`/doctor/patients/${a.patientId}`)}
              />
            ))}
          </Section>
        )}
      </div>

      <BottomNav items={doctorNavItems} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 px-1 mb-2">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ApptCard({ label, patientName, ageMonths, upcoming, onClick }: {
  label: string;
  patientName: string;
  ageMonths: number;
  upcoming: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-4 text-left flex items-center gap-4 shadow-sm active:bg-gray-50 transition-colors"
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${upcoming ? "bg-gray-900" : "bg-gray-300"}`} />
      <div className="flex-1">
        <p className={`text-sm font-medium ${upcoming ? "text-gray-900" : "text-gray-400"}`}>{label}</p>
        <p className={`text-xs mt-0.5 ${upcoming ? "text-gray-500" : "text-gray-400"}`}>
          {patientName} · {ageMonths}개월
        </p>
      </div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round">
        <path d="M6 4l4 4-4 4" />
      </svg>
    </button>
  );
}
