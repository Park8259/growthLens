import { useNavigate } from "react-router-dom";
import { mockDoctor, mockPatients, mockAppointments } from "../../../data/mockDoctor";
import BottomNav from "../../../components/BottomNav";
import { doctorNavItems } from "../_nav";

function daysAgo(dateStr: string): string {
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "오늘";
  if (diff === 1) return "어제";
  return `${diff}일 전`;
}

function nextAppointmentLabel(patientId: string): string | null {
  const today = new Date().toISOString().split("T")[0];
  const upcoming = mockAppointments
    .filter((a) => a.patientId === patientId && a.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  if (!upcoming) return null;
  const d = new Date(upcoming.date);
  return `${d.getMonth() + 1}/${d.getDate()} 예약`;
}

export default function DoctorPatientsScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-sm mx-auto">
      {/* 헤더 */}
      <div className="bg-white px-6 pt-14 pb-5 border-b border-gray-100">
        <p className="text-xs text-gray-400 mb-0.5">{mockDoctor.specialty} · {mockDoctor.hospital}</p>
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold text-gray-900">
            {mockDoctor.name} 선생님
          </h1>
          <button
            onClick={() => navigate("/doctor/invite")}
            className="flex items-center gap-1.5 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-full"
          >
            <span className="text-base leading-none">+</span>
            환자 초대
          </button>
        </div>

        {/* 요약 통계 */}
        <div className="flex gap-4 mt-4">
          <Stat label="환자" value={`${mockPatients.length}명`} />
          <div className="w-px bg-gray-100" />
          <Stat label="이번 주 측정" value="5건" />
          <div className="w-px bg-gray-100" />
          <Stat label="예정 예약" value="2건" />
        </div>
      </div>

      {/* 환자 목록 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {mockPatients.map((p) => {
          const upcoming = nextAppointmentLabel(p.id);
          return (
            <button
              key={p.id}
              onClick={() => navigate(`/doctor/patients/${p.id}`)}
              className="w-full bg-white rounded-2xl p-4 text-left flex items-center gap-4 shadow-sm active:bg-gray-50 transition-colors"
            >
              {/* 아바타 */}
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-gray-500">
                  {p.name[1]}
                </span>
              </div>

              {/* 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{p.name}</span>
                  <span className="text-xs text-gray-400">
                    {p.ageMonths}개월 · {p.gender === "male" ? "남" : "여"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {p.lastRecordedAt ? `마지막 측정 ${daysAgo(p.lastRecordedAt)}` : "측정 기록 없음"}
                  {" · "}총 {p.recordCount}회
                </p>
                {upcoming && (
                  <span className="inline-block mt-1.5 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {upcoming}
                  </span>
                )}
              </div>

              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round">
                <path d="M6 4l4 4-4 4" />
              </svg>
            </button>
          );
        })}
      </div>

      <BottomNav items={doctorNavItems} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
