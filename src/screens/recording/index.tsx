import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRecordsStore } from "../../store/records";
import { analyzeVideo } from "../../engine/analyzeVideo";
import { BackIcon, CheckIcon, LockIcon } from "../../components/icons";
import {
  TASK_ANALYZE_STEP, TASK_DURATION, TASK_LABEL, TASK_PREP_TITLE,
} from "../../data/tasks";
import TaskIcon from "../../components/TaskIcon";
import type { TaskType } from "../../types/analysis";

// Figma 부모 버전: "촬영"(준비) → "촬영 다음"(녹화 중) → "영상 분석"
// 준비 화면의 점검 목록·하단 안내·버튼은 프레임 밖 부품을 조립함

type Phase = "init" | "prep" | "countdown" | "recording" | "analyzing" | "error";

const COUNTDOWN_SEC = 5;
const BEEP_AT = [5, 10, 15]; // 녹화 시작 후 신호음 시각(초)

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    osc.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch { /* 소리를 못 내도 녹화는 계속 */ }
}

const mmss = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

export default function RecordingScreen() {
  const { taskType } = useParams<{ taskType: TaskType }>();
  const navigate = useNavigate();
  const addRecord = useRecordsStore((s) => s.addRecord);
  const task = (taskType ?? "name_response") as TaskType;
  const duration = TASK_DURATION[task];
  const needsStimulus = task === "name_response" || task === "imitation";

  const [phase, setPhase] = useState<Phase>("init");
  const [countdown, setCountdown] = useState(COUNTDOWN_SEC);
  const [elapsed, setElapsed] = useState(0);
  const [beeps, setBeeps] = useState(0);
  const [flash, setFlash] = useState(false);
  const [bright, setBright] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingStartRef = useRef(0);
  const stimulusTimestampRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 카메라 켜기
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setPhase("prep");
      } catch {
        if (!cancelled) {
          setErrorMsg("카메라를 쓸 수 없어요. 브라우저 설정에서 카메라를 허용해 주세요.");
          setPhase("error");
        }
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // 준비 화면: 1초마다 화면 밝기 확인 (평균 밝기 60/255 이상이면 충분)
  useEffect(() => {
    if (phase !== "prep" && phase !== "countdown") return;
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 18;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const t = window.setInterval(() => {
      const v = videoRef.current;
      if (!ctx || !v || v.readyState < 2) return;
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let sum = 0;
      for (let i = 0; i < data.length; i += 4) sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      setBright(sum / (data.length / 4) >= 60);
    }, 1000);
    return () => window.clearInterval(t);
  }, [phase]);

  const startRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;
    chunksRef.current = [];
    stimulusTimestampRef.current = null;
    const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"]
      .find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.start(500);
    recorderRef.current = recorder;
    recordingStartRef.current = performance.now();
    setElapsed(0);
    setBeeps(0);
    setPhase("recording");
  }, []);

  const stopAndAnalyze = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    setPhase("analyzing");
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" });
      // 원인 확인용: 녹화 결과 크기·형식
      const info = `${chunksRef.current.length}조각, ${(blob.size / 1024 / 1024).toFixed(1)}MB, ${blob.type || "형식 없음"}`;
      console.info("[recording]", info);
      try {
        const result = await analyzeVideo({
          videoBlob: blob,
          taskType: task,
          stimulusTimestamp: stimulusTimestampRef.current ?? undefined,
        });
        addRecord({ taskType: task, recordedAt: Date.now(), result });
        navigate(`/result/${task}`, { state: { result }, replace: true });
      } catch (err) {
        setErrorMsg(`분석 중 문제가 생겼어요: ${err instanceof Error ? err.message : String(err)}\n[녹화: ${info}]`);
        setPhase("error");
      }
    };
    recorder.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, [task, addRecord, navigate]);

  // 카운트다운 (시작을 누른 뒤 5초)
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      startRecording();
      return;
    }
    const t = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, countdown, startRecording]);

  // 녹화 타이머: 1초마다 초를 올리고, 신호음 시각이면 소리, 끝나면 분석
  // (상태 업데이트 함수 안에서 부수 효과를 내지 않도록 초는 ref로 셈)
  useEffect(() => {
    if (phase !== "recording") return;
    let sec = 0;
    let flashTimer: number | undefined;
    const t = window.setInterval(() => {
      sec += 1;
      setElapsed(sec);
      if (needsStimulus && BEEP_AT.includes(sec)) {
        if (stimulusTimestampRef.current === null) {
          stimulusTimestampRef.current = performance.now() - recordingStartRef.current;
        }
        playBeep();
        setBeeps((b) => b + 1);
        setFlash(true);
        flashTimer = window.setTimeout(() => setFlash(false), 400);
      }
      if (sec >= duration) {
        window.clearInterval(t);
        playBeep(); // 끝났다는 소리
        stopAndAnalyze();
      }
    }, 1000);
    return () => {
      window.clearInterval(t);
      window.clearTimeout(flashTimer);
    };
  }, [phase, needsStimulus, duration, stopAndAnalyze]);

  /** 그만 찍기 / 닫기: 저장하지 않고 나감 */
  function handleQuit() {
    const r = recorderRef.current;
    if (r && r.state !== "inactive") { r.onstop = null; r.stop(); }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    navigate(-1);
  }

  /** 처음부터: 지금까지 찍은 것은 버리고 준비 화면으로 */
  function handleRestart() {
    const r = recorderRef.current;
    if (r && r.state !== "inactive") { r.onstop = null; r.stop(); }
    chunksRef.current = [];
    setElapsed(0);
    setBeeps(0);
    setCountdown(COUNTDOWN_SEC);
    setPhase("prep");
  }

  if (phase === "error") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 gap-6 max-w-sm mx-auto">
        <p className="text-[15px] text-p-body text-center whitespace-pre-line">{errorMsg}</p>
        <button onClick={() => navigate(-1)} className="h-[54px] px-8 rounded-[14px] bg-p-card text-base font-bold text-p-body">
          돌아가기
        </button>
      </div>
    );
  }

  if (phase === "analyzing") return <AnalyzingView task={task} />;

  const live = phase === "recording";

  return (
    <div className="relative min-h-screen max-w-sm mx-auto overflow-hidden bg-p-dark">
      {/* 카메라 화면 */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      />
      <div className={`absolute inset-0 transition-colors duration-200 ${flash ? "bg-brand/40" : "bg-p-dark/40"}`} />

      {/* 상단 */}
      {live ? (
        <div className="absolute inset-x-0 top-[57px] flex items-center justify-between px-[23px]">
          <button type="button" onClick={handleQuit} aria-label="닫기" className="flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white">
            <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.83" strokeLinecap="round"><path d="M1 1l10 10M11 1L1 11" /></svg>
          </button>
          <span className="flex h-9 items-center rounded-full bg-black/35 px-4 text-sm font-bold text-white">{TASK_LABEL[task]}</span>
          <span className="flex h-9 items-center gap-1.5 rounded-full bg-black/35 px-3 text-sm font-bold text-white tabular-nums">
            <span className="h-2 w-2 rounded-full bg-[#FF4D4D]" />
            {mmss(elapsed)}
          </span>
        </div>
      ) : (
        <>
          <div className="absolute inset-x-0 top-[58px] flex items-center justify-center">
            <button type="button" onClick={handleQuit} aria-label="뒤로 가기" className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white">
              <BackIcon size={22} />
            </button>
            <span className="text-base font-bold text-white">폰 세우기</span>
          </div>
          {/* 점검 목록 */}
          <div className="absolute inset-x-6 top-[116px] space-y-3 rounded-2xl bg-black/35 px-[18px] py-4">
            <CheckRow ok={bright === true} text={bright === false ? "조금 더 밝은 곳으로 옮겨주세요" : "밝기가 충분해요"} />
            <CheckRow ok={false} text="아이 전신이 보이게 해주세요" />
            {task === "ball_play" && <CheckRow ok={false} text="공이 화면에 보이게 해주세요" />}
          </div>
        </>
      )}

      {/* 가운데 점선 틀 */}
      <div className={`absolute left-1/2 -translate-x-1/2 ${live ? "top-[222px]" : "top-[339px]"}`}>
        <Brackets />
      </div>

      {live && (
        <div className="absolute inset-x-0 top-[426px] flex flex-col items-center">
          <span className="flex h-[53px] items-center gap-2.5 rounded-full bg-[#263035] px-6 text-xl font-bold text-white">
            <TaskIcon task={task} size={20} />
            {needsStimulus ? `신호 ${beeps}번` : `남은 시간 ${mmss(Math.max(0, duration - elapsed))}`}
          </span>
          <p className="mt-4 text-[13px] text-white">아이 전신이 점선 안에 들어오게 해주세요</p>
        </div>
      )}

      {/* 하단 시트 */}
      <div className="absolute inset-x-0 bottom-0 rounded-t-[24px] bg-white px-6 pt-7 pb-10">
        {live ? (
          <>
            <p className="text-center text-sm text-p-gray">
              {needsStimulus ? "소리가 나면 바로 시작해주세요" : "아이를 보며 편하게 놀아주세요"} · 끝나면 소리로 알려드려요
            </p>
            <div className="mt-5 flex justify-center gap-[25px]">
              <button type="button" onClick={handleQuit} className="h-[52px] w-[140px] rounded-full bg-brand text-base font-bold text-white">
                그만 찍기
              </button>
              <button type="button" onClick={handleRestart} className="h-[52px] w-[140px] rounded-full bg-brand text-base font-bold text-white">
                처음부터
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="px-2 text-xl font-bold text-p-title">{TASK_PREP_TITLE[task]}</p>
            <p className="mt-3 px-2 text-sm leading-6 text-p-gray">
              시작을 누르고 아이 앞에 앉으면 {COUNTDOWN_SEC}초 뒤 촬영이 시작되고, {duration === 60 ? "1분" : `${duration}초`} 뒤 소리로 알려드려요.
            </p>
            {phase === "countdown" ? (
              <div className="mt-5 flex h-[58px] items-center justify-center rounded-[14px] bg-p-card text-base font-bold text-p-body">
                {countdown}초 뒤 촬영 시작
              </div>
            ) : (
              <button
                type="button"
                disabled={phase !== "prep"}
                onClick={() => { setCountdown(COUNTDOWN_SEC); setPhase("countdown"); }}
                className="mt-5 h-[58px] w-full rounded-[14px] bg-brand text-base font-bold text-white disabled:bg-p-card disabled:text-p-light"
              >
                {phase === "init" ? "카메라 준비 중..." : "시작"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CheckRow({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`flex h-[22px] w-[22px] items-center justify-center rounded-full text-white ${ok ? "bg-brand" : "bg-p-light"}`}>
        <CheckIcon size={13} />
      </span>
      <span className="text-[15px] text-white">{text}</span>
    </div>
  );
}

/** 네 모서리 꺾쇠 (141×141) */
function Brackets() {
  const c = "absolute h-5 w-[21px] border-brand";
  return (
    <div className="relative h-[141px] w-[141px]">
      <span className={`${c} left-0 top-0 border-l-4 border-t-4 rounded-tl-md`} />
      <span className={`${c} right-0 top-0 border-r-4 border-t-4 rounded-tr-md`} />
      <span className={`${c} left-0 bottom-0 border-l-4 border-b-4 rounded-bl-md`} />
      <span className={`${c} right-0 bottom-0 border-r-4 border-b-4 rounded-br-md`} />
    </div>
  );
}

/** 영상 분석 화면. 단계 표시는 시간에 맞춰 넘어가고, 마지막 단계는 결과가 나올 때까지 진행 중으로 둬요. */
function AnalyzingView({ task }: { task: TaskType }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t1 = window.setTimeout(() => setStep(1), 2500);
    const t2 = window.setTimeout(() => setStep(2), 5500);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, []);
  const steps = ["아이 찾기", TASK_ANALYZE_STEP[task], "시간 계산하기"];

  return (
    <div className="relative min-h-screen bg-white max-w-sm mx-auto flex flex-col items-center">
      <h1 className="mt-[214px] text-2xl font-bold text-p-title">영상을 보고 있어요</h1>
      <p className="mt-2 text-base text-p-gray">10초 정도 걸려요</p>
      <svg width="96" height="96" viewBox="0 0 96 96" className="mt-[50px] animate-spin" style={{ animationDuration: "1.2s" }}>
        <circle cx="48" cy="48" r="40" fill="none" stroke="#E6F8FF" strokeWidth="8" />
        <path d="M48 8a40 40 0 0 1 38 28" fill="none" stroke="#74DCFF" strokeWidth="8" strokeLinecap="round" />
      </svg>
      <ul className="mt-[67px] space-y-4">
        {steps.map((label, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={label} className="flex items-center gap-[11px]">
              <span className={`flex h-[22px] w-[22px] items-center justify-center rounded-full text-white ${done ? "bg-brand" : current ? "bg-brand/60" : "bg-p-faint"}`}>
                <CheckIcon size={13} />
              </span>
              <span className={`text-base ${done || current ? "font-bold text-p-title" : "text-p-faint"}`}>{label}</span>
            </li>
          );
        })}
      </ul>
      <p className="absolute bottom-[45px] flex items-center gap-1.5 text-sm text-p-gray">
        <LockIcon size={16} className="text-p-light" />
        영상은 이 폰 안에서만 분석돼요
      </p>
    </div>
  );
}
