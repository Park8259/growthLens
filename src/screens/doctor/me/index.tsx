import { useNavigate } from "react-router-dom";
import { mockDoctor, mockPatients } from "../../../data/mockDoctor";
import { Chevron20Icon } from "../../../components/icons";
import DoctorNav from "../_nav";

// 내 정보 — Figma에 아직 화면이 없어서 다른 화면과 같은 스타일로 간단히 만듦
export default function DoctorMeScreen() {
  const navigate = useNavigate();
  const rows = [
    { label: "연결된 환자", value: `${mockPatients.filter((p) => !p.pending).length}명` },
    { label: "연결 대기", value: `${mockPatients.filter((p) => p.pending).length}명` },
  ];
  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      <div className="flex-1 px-5 pt-16">
        <p className="text-[13px] text-p-gray">{mockDoctor.hospital} · {mockDoctor.specialty}</p>
        <h1 className="mt-2.5 text-[26px] font-bold text-p-title">{mockDoctor.name} 선생님</h1>

        <ul className="mt-8 divide-y divide-p-line rounded-2xl border border-p-line">
          {rows.map((r) => (
            <li key={r.label} className="flex h-14 items-center justify-between px-4 text-[15px]">
              <span className="text-p-body">{r.label}</span>
              <b className="text-p-title">{r.value}</b>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-4 flex h-14 w-full items-center justify-between rounded-2xl bg-p-card px-4 text-[15px] text-p-body"
        >
          역할 다시 고르기
          <Chevron20Icon size={20} className="text-p-light" />
        </button>
      </div>
      <DoctorNav />
    </div>
  );
}
