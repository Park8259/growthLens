import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { mockDoctor } from "../../../data/mockDoctor";
import { BackIcon, CalendarIcon, CheckIcon, InfoIcon, QrIcon } from "../../../components/icons";

// Figma 의사 버전 "연결코드" — 탭: 보호자 공유 코드 / 보호자에게 초대
type Tab = "code" | "invite";

export default function DoctorInviteScreen() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [tab, setTab] = useState<Tab>("code");
  const [done, setDone] = useState<string | null>(null);

  if (done) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center max-w-sm mx-auto px-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white">
          <CheckIcon size={30} />
        </span>
        <h2 className="mt-5 text-xl font-bold text-p-title">{done}</h2>
        <button type="button" onClick={() => navigate("/doctor/patients")} className="mt-8 h-[54px] w-full rounded-[14px] bg-brand text-base font-bold text-white">
          환자 목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      <div className="flex items-center gap-2 px-4 pt-[64px]">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로 가기" className="text-p-title">
          <BackIcon size={24} />
        </button>
        <h1 className="text-lg font-bold text-p-title">환자 연결하기</h1>
      </div>

      <div className="mx-5 mt-5 flex rounded-xl bg-p-card p-1">
        {([["code", "보호자 공유 코드"], ["invite", "보호자에게 초대"]] as const).map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`h-9 flex-1 rounded-[10px] text-sm ${tab === k ? "bg-white font-bold text-p-title shadow-sm" : "text-p-gray"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "code" ? (
        <CodeTab initial={params.get("code") ?? ""} onDone={() => setDone("환자와 연결됐어요")} />
      ) : (
        <InviteTab onDone={(name) => setDone(`${name} 보호자에게 초대를 보냈어요`)} />
      )}
    </div>
  );
}

function CodeTab({ initial, onDone }: { initial: string; onDone: () => void }) {
  const [code, setCode] = useState(initial.toUpperCase().slice(0, 6));
  const [birth, setBirth] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const valid = code.length === 6 && birth !== "";

  return (
    <>
      <div className="flex-1 px-5">
        <h2 className="mt-8 text-[22px] leading-[30px] font-bold text-p-title">
          보호자가 보여준
          <br />
          6자리 코드를 입력해 주세요
        </h2>
        <p className="mt-2 text-[13px] text-p-gray">베베뷰 앱 &gt; 진료 요약 &gt; 의사에게 공유에서 볼 수 있어요</p>

        {/* 6칸 코드 입력: 보이지 않는 input 하나에 입력하고 칸에 나눠 보여줌 */}
        <div className="relative mt-5 flex gap-2" onClick={() => inputRef.current?.focus()}>
          {Array.from({ length: 6 }, (_, i) => {
            const active = i === Math.min(code.length, 5);
            return (
              <span
                key={i}
                className={`flex h-[52px] flex-1 items-center justify-center rounded-xl border text-xl font-bold text-p-title ${
                  active ? "border-brand" : "border-p-line"
                }`}
              >
                {code[i] ?? ""}
              </span>
            );
          })}
          <input
            ref={inputRef}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
            aria-label="연결 코드 6자리"
            autoCapitalize="characters"
            className="absolute inset-0 opacity-0"
          />
        </div>

        <p className="mt-6 text-sm font-bold text-p-title">아이 생년월일</p>
        <button
          type="button"
          onClick={() => dateRef.current?.showPicker?.()}
          className="relative mt-2.5 flex h-[51px] w-full items-center justify-between rounded-xl border border-p-line px-4 text-left text-base"
        >
          <span className={birth ? "text-p-title" : "text-p-light"}>{birth ? birth.replace(/-/g, ".") : "생년월일을 선택해주세요"}</span>
          <CalendarIcon size={20} className="text-p-gray" />
          <input ref={dateRef} type="date" value={birth} onChange={(e) => setBirth(e.target.value)} tabIndex={-1} aria-hidden className="pointer-events-none absolute inset-0 opacity-0" />
        </button>

        <button type="button" onClick={() => setCode("K7Q29M")} className="mt-5 flex h-[51px] w-full items-center justify-center gap-2 rounded-xl bg-p-card text-base font-bold text-p-title">
          <QrIcon size={20} />
          QR 코드로 연결
        </button>

        <p className="mt-5 flex gap-1.5 text-xs leading-5 text-p-gray">
          <InfoIcon size={16} className="mt-0.5 flex-shrink-0 text-p-light" />
          연결하면 보호자가 허락한 기록만 볼 수 있어요. 보호자가 언제든 연결을 끊을 수 있어요.
        </p>
      </div>
      <div className="sticky bottom-0 bg-white px-5 pt-3 pb-8">
        <button
          type="button"
          disabled={!valid}
          onClick={onDone}
          className="h-[54px] w-full rounded-[14px] bg-brand text-base font-bold text-white disabled:bg-p-card disabled:text-p-light"
        >
          연결하기
        </button>
      </div>
    </>
  );
}

function InviteTab({ onDone }: { onDone: (name: string) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const valid = name.trim() !== "" && phone.replace(/\D/g, "").length === 11;

  function formatPhone(raw: string) {
    const d = raw.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  }

  const box = "mt-2.5 h-[51px] w-full rounded-xl border border-p-line px-4 text-base text-p-title placeholder:text-p-light focus:border-brand focus:outline-none";

  return (
    <>
      <div className="flex-1 px-5">
        <h2 className="mt-8 text-[22px] leading-[30px] font-bold text-p-title">
          보호자에게
          <br />
          앱 설치 초대를 보내요
        </h2>
        <p className="mt-6 text-sm font-bold text-p-title">아이 이름</p>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="김하은" className={box} />
        <p className="mt-5 text-sm font-bold text-p-title">보호자 전화번호</p>
        <input type="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="010-0000-0000" className={box} />
        {name.trim() && (
          <>
            <p className="mt-5 text-sm font-bold text-p-title">보낼 메시지</p>
            <p className="mt-2.5 rounded-xl bg-p-card px-4 py-3.5 text-sm leading-6 text-p-body">
              [{mockDoctor.hospital}] {mockDoctor.name} 선생님이 베베뷰에 초대했어요. {name.trim()}의 발달을 집에서 함께 기록해요.
            </p>
          </>
        )}
      </div>
      <div className="sticky bottom-0 bg-white px-5 pt-3 pb-8">
        <button
          type="button"
          disabled={!valid}
          onClick={() => onDone(name.trim())}
          className="h-[54px] w-full rounded-[14px] bg-brand text-base font-bold text-white disabled:bg-p-card disabled:text-p-light"
        >
          초대 보내기
        </button>
      </div>
    </>
  );
}
