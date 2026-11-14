import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockDoctor } from "../../../data/mockDoctor";

export default function DoctorInviteScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);

  const isValid = name.trim() !== "" && phone.replace(/\D/g, "").length === 11;

  function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center max-w-sm mx-auto px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-5">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 14l6 6L23 8" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">초대를 보냈어요!</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          <span className="font-medium text-gray-700">{name}</span>님의 보호자에게<br />
          카카오톡으로 초대 메시지가 전송됐어요.<br />
          앱 설치 후 환자 목록에 자동으로 추가돼요.
        </p>
        <button
          onClick={() => navigate("/doctor/patients")}
          className="mt-8 w-full py-4 bg-gray-900 text-white font-semibold rounded-2xl"
        >
          환자 목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* 헤더 */}
        <div className="pt-14 pb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 mb-6 -ml-1">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M14 5l-6 6 6 6" />
            </svg>
            <span className="text-sm">돌아가기</span>
          </button>
          <h1 className="text-[22px] font-bold text-gray-900">환자 초대하기</h1>
          <p className="text-sm text-gray-500 mt-1">
            보호자 번호로 앱 설치 초대 메시지를 보내요
          </p>
        </div>

        <div className="space-y-5">
          {/* 아이 이름 */}
          <div>
            <label className="block text-sm text-gray-700 mb-1.5">아이 이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="김하은"
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 bg-white"
            />
          </div>

          {/* 보호자 전화번호 */}
          <div>
            <label className="block text-sm text-gray-700 mb-1.5">보호자 전화번호</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="010-0000-0000"
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 bg-white"
            />
          </div>

          {/* 메시지 미리보기 */}
          {name && (
            <div>
              <label className="block text-sm text-gray-700 mb-1.5">전송될 메시지</label>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-sm text-gray-700 leading-relaxed">
                  [{mockDoctor.hospital}] {mockDoctor.name} 선생님이 GrowthLens에 초대했어요.
                  {" "}<span className="font-medium">{name}</span>의 발달을 함께 기록하고 추적해요.
                  {"\n\n"}앱 설치하기: growthlens.app/join/abc123
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="px-6 pb-10 pt-4 bg-white border-t border-gray-50">
        <button
          onClick={() => { if (isValid) setSent(true); }}
          disabled={!isValid}
          className={`w-full py-4 rounded-2xl text-white font-semibold text-base transition-colors ${
            isValid ? "bg-gray-900" : "bg-gray-300"
          }`}
        >
          초대 보내기
        </button>
      </div>
    </div>
  );
}
