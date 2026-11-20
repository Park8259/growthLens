import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useChildStore } from "../../store/child";
import { BottomButton, Field, PageHeader, StepBar, TextBox } from "../../components/FormField";

// Figma 와이어프레임 > 정보입력: 01 시작 · 02/03 회원가입 계정 · 04 아이 정보 입력 안내 · 07 이용약관 · 08 로그인
// 서버는 아직 없어요. 입력값은 화면 안에서만 쓰고 어디에도 저장하지 않아요.
// 서버를 붙일 자리는 "서버 연결:" 주석으로 표시했어요.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/; // 영문, 숫자 포함 8자 이상
const CODE_SEC = 5 * 60;

/** 01 시작 */
export function StartScreen() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white max-w-sm mx-auto flex flex-col px-6">
      <div className="flex-1 pt-[162px]">
        <h1 className="text-[28px] leading-[41px] font-bold text-[#1A2230]">
          아이의 일상을 기록하고
          <br />
          진료에 연결해요
        </h1>
        <p className="mt-2.5 text-[15px] text-[#6B7280]">이메일로 간편하게 가입하고 시작해보세요</p>
      </div>
      <div className="space-y-3 pb-[38px]">
        <button type="button" onClick={() => navigate("/signup")} className="h-14 w-full rounded-[14px] bg-brand text-base font-bold text-white">
          회원가입
        </button>
        <button type="button" onClick={() => navigate("/login")} className="h-14 w-full rounded-[14px] bg-[#EDEDED] text-base font-bold text-[#1A2230]">
          로그인
        </button>
      </div>
    </div>
  );
}

/** 02·03 회원가입 ① 계정 (이메일 인증) */
export function SignupScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sentAt, setSentAt] = useState<number | null>(null);
  const [verified, setVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [now, setNow] = useState(() => Date.now());

  // 인증번호 남은 시간
  useEffect(() => {
    if (sentAt === null || verified) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [sentAt, verified]);
  const left = sentAt === null ? 0 : Math.max(0, CODE_SEC - Math.floor((now - sentAt) / 1000));

  const emailOk = EMAIL_RE.test(email.trim());
  const passwordOk = PASSWORD_RE.test(password);
  const match = confirm !== "" && confirm === password;
  const canNext = name.trim() !== "" && verified && passwordOk && match;

  function sendCode() {
    // 서버 연결: 이 이메일로 인증번호 보내기
    setSentAt(Date.now());
    setNow(Date.now());
    setCode("");
  }
  function checkCode() {
    // 서버 연결: 인증번호 확인. 지금은 6자리 숫자면 통과
    if (/^\d{6}$/.test(code) && left > 0) setVerified(true);
  }
  function next() {
    // 서버 연결: 계정 만들기 (보호자 이름, 이메일, 비밀번호)
    navigate("/signup/done");
  }

  return (
    <div className="min-h-screen bg-white max-w-sm mx-auto flex flex-col">
      <PageHeader title="회원가입" onBack={() => navigate(-1)} />
      <StepBar step={1} />

      <div className="flex-1 space-y-[13px] px-6 pt-[19px]">
        <Field label="보호자 이름">
          <TextBox value={name} onChange={(e) => setName(e.target.value)} placeholder="이름을 입력해주세요" autoComplete="name" />
        </Field>

        <Field label="이메일">
          <div className="flex gap-[11px]">
            <div className="min-w-0 flex-1">
              <TextBox
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                autoComplete="email"
                disabled={verified}
              />
            </div>
            <SideButton
              tone={sentAt === null ? "brand" : "gray"}
              disabled={!emailOk || verified}
              onClick={sendCode}
            >
              {sentAt === null ? "인증번호 받기" : "재전송"}
            </SideButton>
          </div>
        </Field>

        <div>
          <Field label="인증번호">
            <div className="flex gap-[11px]">
              <div className="relative min-w-0 flex-1">
                <TextBox
                  inputMode="numeric"
                  maxLength={6}
                  value={verified ? "●●●●●●" : code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="인증번호 6자리"
                  disabled={sentAt === null || verified}
                />
                {sentAt !== null && !verified && (
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-bold tabular-nums text-[#FF5A5F]">
                    {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
                  </span>
                )}
              </div>
              <SideButton tone={verified ? "done" : "gray"} disabled={verified || code.length !== 6 || left === 0} onClick={checkCode}>
                {verified ? "인증 완료" : "확인"}
              </SideButton>
            </div>
          </Field>
          <p className={`mt-2 text-[12.5px] ${verified ? "font-bold text-[#0A8FBF]" : left === 0 && sentAt !== null ? "text-[#FF5A5F]" : "text-[#9CA3AF]"}`}>
            {verified
              ? "✓ 이메일 인증이 완료됐어요"
              : sentAt !== null && left === 0
                ? "인증 시간이 지났어요. 재전송을 눌러주세요"
                : "입력한 이메일로 인증번호를 보내드려요"}
          </p>
        </div>

        <Field label="비밀번호">
          <PasswordBox value={password} onChange={setPassword} placeholder="영문, 숫자 포함 8자 이상" autoComplete="new-password" />
        </Field>
        {password !== "" && !passwordOk && <p className="-mt-1 text-[12.5px] text-[#FF5A5F]">영문과 숫자를 섞어 8자 이상 입력해주세요</p>}

        <div>
          <Field label="비밀번호 확인">
            <PasswordBox value={confirm} onChange={setConfirm} placeholder="비밀번호를 한 번 더 입력해주세요" autoComplete="new-password" highlight={match} />
          </Field>
          {confirm !== "" && (
            <p className={`mt-2 text-[12.5px] font-bold ${match ? "text-[#0A8FBF]" : "text-[#FF5A5F]"}`}>
              {match ? "✓ 비밀번호가 일치해요" : "비밀번호가 일치하지 않아요"}
            </p>
          )}
        </div>
      </div>

      <BottomButton label="다음" disabled={!canNext} onClick={next} />
    </div>
  );
}

/** 04 회원가입 · 아이 정보 입력 안내 */
export function SignupDoneScreen() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white max-w-sm mx-auto flex flex-col">
      <div className="flex flex-1 flex-col items-center justify-center pb-16 text-center">
        <span className="flex h-[71px] w-[71px] items-center justify-center rounded-full bg-brand">
          <svg width="30" height="22" viewBox="0 0 30 22" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11l8 8L27 3" />
          </svg>
        </span>
        <p className="mt-6 text-[15px] font-bold text-[#0A8FBF]">계정이 만들어졌어요</p>
        <h1 className="mt-4 text-[26px] leading-[31px] font-bold text-[#1A2230]">
          이제 우리 아이에 대해
          <br />
          알려주세요
        </h1>
      </div>
      <BottomButton label="아이 정보 입력하기" onClick={() => navigate("/onboarding", { replace: true })} />
    </div>
  );
}

/** 07 회원가입 ④ 이용약관 (마지막) */
const TERMS: { title: string; items: string[] }[] = [
  {
    title: "1. 서비스 개요 및 목적",
    items: [
      "'베베뷰'는 보호자가 영유아 자녀의 일상 행동을 영상으로 기록하고, 진료에 활용할 수 있는 관찰 자료로 확인·공유할 수 있도록 지원하는 모바일 앱입니다.",
      "관찰 과제 안내, 영상 기반 기록, 시점별 변화 확인, 진료 요약 공유 기능을 제공합니다.",
      "의료 진단이나 전문 치료 목적이 아닌, 관찰 기록 및 참고용 서비스입니다.",
    ],
  },
  {
    title: "2. 회원가입 및 이용 조건",
    items: [
      "만 14세 이상만 회원가입이 가능하며, 부모나 보호자만 자녀 정보를 입력할 수 있습니다.",
      "이메일 인증을 완료해야 가입할 수 있으며, 본인 인증 및 계정 보안을 책임져야 합니다.",
      "아이 1명당 1개의 관찰 기록을 생성할 수 있습니다.",
      "부정행위(타인 정보 도용, 다중 계정 생성 등)가 확인되면 계정이 제한될 수 있습니다.",
    ],
  },
  {
    title: "3. 주요 기능 및 제공 범위",
    items: [
      "관찰 과제 안내: 공 주고받기, 호명 반응, 동작 모방 등 촬영 방법을 안내합니다.",
      "영상 기록: 촬영한 영상은 이 기기 안에서만 분석되며, 기록과 변화를 확인할 수 있습니다.",
      // Figma 원문은 "보호자가 직접 고른 장면과 기록만" — 영상(장면)은 보내지 않기로 해서 바꿨어요
      "진료 요약 공유: 보호자가 허용한 기록만 의사에게 공유되며, 영상은 공유되지 않습니다.",
      "제공되는 수치는 진단이 아닌 관찰 기록이며, 판단은 의료진 상담을 통해 이루어집니다.",
    ],
  },
];

export function TermsScreen() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  function finish() {
    // 서버 연결: 약관 동의 기록 저장, 가입 마무리
    navigate("/tasks", { replace: true });
  }

  return (
    <div className="h-screen bg-white max-w-sm mx-auto flex flex-col">
      <PageHeader title="베베뷰 이용약관" onBack={() => navigate(-1)} />
      <StepBar step={4} />

      <div className="flex-1 overflow-y-auto px-6 pt-[26px] pb-6 text-sm leading-[22px] font-bold text-[#1A2230]">
        <p>
          '베베뷰' 앱을 이용하시기 전, 아래 약관 내용을 꼭 확인해주세요. 본 요약은 전체 이용약관의 주요 내용을 담고 있으며, 전체 약관은 앱 내의
          [이용약관]에서 다시 확인하실 수 있습니다.
        </p>
        {TERMS.map((sec) => (
          <section key={sec.title} className="mt-8">
            <h2 className="text-[17px] leading-5">{sec.title}</h2>
            <ul className="mt-4 space-y-3.5">
              {sec.items.map((t) => (
                <li key={t} className="flex gap-2.5">
                  <span className="flex-shrink-0">-</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="border-t border-line-divider px-6 pt-[22px] pb-[38px]">
        <label className="flex cursor-pointer items-center gap-3">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="peer sr-only" />
          <span
            className={`flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-md border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 ${
              agreed ? "border-brand bg-brand" : "border-[#C4C4C4] bg-white"
            }`}
          >
            {agreed && (
              <svg width="14" height="11" viewBox="0 0 14 11" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1.5 5.5l3.5 3.5 7.5-7.5" />
              </svg>
            )}
          </span>
          <span className="text-[15px] font-bold text-[#1A2230]">(필수) 베베뷰 이용약관에 동의합니다.</span>
        </label>
        <button
          type="button"
          disabled={!agreed}
          onClick={finish}
          className={`mt-[18px] h-14 w-full rounded-[14px] text-base font-bold ${agreed ? "bg-brand text-white" : "bg-fill-disabled text-ink-hint"}`}
        >
          가입 완료
        </button>
      </div>
    </div>
  );
}

/** 08 로그인 */
export function LoginScreen() {
  const navigate = useNavigate();
  const profile = useChildStore((s) => s.profile);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const canLogin = EMAIL_RE.test(email.trim()) && password !== "";

  function login() {
    // 서버 연결: 로그인 확인 후 계정의 아이 정보 불러오기. 지금은 이 기기에 아이 정보가 있으면 과제로, 없으면 정보 입력으로
    navigate(profile ? "/tasks" : "/onboarding", { replace: true });
  }

  return (
    <div className="min-h-screen bg-white max-w-sm mx-auto flex flex-col">
      <PageHeader title="로그인" onBack={() => navigate(-1)} />
      <div className="px-6 pt-[65px]">
        <div className="flex items-center gap-0.5">
          <img src="/images/logo-mark.png" alt="" className="h-[31px] w-auto" />
          <img src="/images/logo-wordmark.png" alt="베베뷰" className="h-9 w-auto" />
        </div>
        <h1 className="mt-3 text-[26px] leading-[31px] font-bold text-[#1A2230]">다시 만나서 반가워요</h1>
        <p className="mt-4 text-[15px] text-[#6B7280]">가입한 이메일로 로그인해주세요</p>

        <form
          className="mt-[42px] space-y-[13px]"
          onSubmit={(e) => {
            e.preventDefault();
            if (canLogin) login();
          }}
        >
          <Field label="이메일">
            <TextBox type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" autoComplete="email" />
          </Field>
          <Field label="비밀번호">
            <PasswordBox value={password} onChange={setPassword} placeholder="비밀번호를 입력해주세요" autoComplete="current-password" />
          </Field>
          <button
            type="submit"
            disabled={!canLogin}
            className={`!mt-[44px] h-14 w-full rounded-[14px] text-base font-bold ${canLogin ? "bg-brand text-white" : "bg-fill-disabled text-ink-hint"}`}
          >
            로그인
          </button>
        </form>

        <div className="mt-[30px] flex items-center justify-center gap-[38px] text-[13.5px]">
          {/* 서버 연결: 비밀번호 찾기 화면 */}
          <button type="button" className="text-[#6B7280]">비밀번호 찾기</button>
          <span className="h-4 w-px bg-[#D1D5DB]" />
          <button type="button" onClick={() => navigate("/signup")} className="font-bold text-[#0A8FBF]">
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}

/** 입력칸 오른쪽 작은 버튼 (인증번호 받기 / 재전송 / 확인 / 인증 완료) */
function SideButton({
  children,
  tone,
  disabled,
  onClick,
}: {
  children: ReactNode;
  tone: "brand" | "gray" | "done";
  disabled?: boolean;
  onClick: () => void;
}) {
  const tones = {
    brand: "bg-brand text-white disabled:bg-fill-disabled disabled:text-ink-hint",
    gray: "bg-[#EDEDED] text-[#1A2230] disabled:text-ink-hint",
    done: "bg-[#E3F6FF] text-[#0A8FBF]",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-[51px] w-[100px] flex-shrink-0 rounded-[10px] text-[13px] font-bold ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

/** 비밀번호 칸 + 보기/숨기기 눈 아이콘 */
function PasswordBox({
  value,
  onChange,
  placeholder,
  autoComplete,
  highlight = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
  highlight?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className={`relative rounded-[10px] ${highlight ? "ring-2 ring-brand" : ""}`}>
      <TextBox
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      {value !== "" && (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9CA3AF]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
            {show && <path d="M4 4l16 16" />}
          </svg>
        </button>
      )}
    </div>
  );
}
