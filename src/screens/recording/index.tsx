import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRecordsStore } from "../../store/records";
import type { TaskType, AnalysisResult } from "../../types/analysis";

const TASK_LABEL: Record<TaskType, string> = {
  name_response: "호명반응",
  imitation: "동작 모방",
  ball_play: "공 주고받기",
};

const DURATION: Record<TaskType, number> = {
  name_response: 30,
  imitation: 30,
  ball_play: 60,
};

function mockAmbient() {
  const both = 45 + Math.random() * 15;
  return {
    bothInFrameSec: both,
    caregiverOrientSec: both * (0.5 + Math.random() * 0.3),
    activitySec: both * (0.3 + Math.random() * 0.3),
    contactSec: both * (0.05 + Math.random() * 0.1),
  };
}

function mockResult(taskType: TaskType): AnalysisResult {
  if (taskType === "name_response")
    return { status: "success", metric: { value: +(2 + Math.random() * 3).toFixed(1), unit: "seconds", label: "호명 후 반응 지연" } };
  if (taskType === "imitation")
    return { status: "success", metric: { value: +(2 + Math.random() * 3).toFixed(1), unit: "seconds", label: "모방까지의 지연" }, ambient: mockAmbient() };
  return { status: "success", metric: { value: Math.floor(2 + Math.random() * 5), unit: "count", label: "주고받은 횟수" }, ambient: mockAmbient() };
}

type Phase = "ready" | "recording" | "analyzing";

export default function RecordingScreen() {
  const { taskType } = useParams<{ taskType: TaskType }>();
  const navigate = useNavigate();
  const addRecord = useRecordsStore((s) => s.addRecord);

  const [phase, setPhase] = useState<Phase>("ready");
  const [countdown, setCountdown] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [stimulusFlash, setStimulusFlash] = useState(false);
  const stimulusTimestampRef = useRef<number | null>(null);
  const task = (taskType ?? "name_response") as TaskType;
  const duration = DURATION[task];
  const needsStimulus = task === "name_response" || task === "imitation";

  // Countdown phase
  useEffect(() => {
    if (phase !== "ready") return;
    if (countdown <= 0) { setPhase("recording"); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Recording phase
  useEffect(() => {
    if (phase !== "recording") return;
    const t = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;

        // Stimulus at 5s, 10s, 15s...
        if (needsStimulus && next % 5 === 0) {
          if (stimulusTimestampRef.current === null) stimulusTimestampRef.current = performance.now();
          setStimulusFlash(true);
          setTimeout(() => setStimulusFlash(false), 400);
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            osc.connect(ctx.destination);
            osc.frequency.value = 880;
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
          } catch { /* ignore */ }
        }

        if (next >= duration) {
          clearInterval(t);
          setPhase("analyzing");
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, duration, needsStimulus]);

  // Analyzing phase
  useEffect(() => {
    if (phase !== "analyzing") return;
    const result = mockResult(task);
    addRecord({ taskType: task, recordedAt: Date.now(), result });
    const t = setTimeout(() => navigate(`/result/${task}`, { state: { result } }), 2000);
    return () => clearTimeout(t);
  }, [phase, task, addRecord, navigate]);

  const remaining = duration - elapsed;
  const bg = stimulusFlash ? "bg-blue-700" : phase === "recording" ? "bg-gray-900" : "bg-black";

  return (
    <div className={`min-h-screen ${bg} flex flex-col items-center justify-center transition-colors duration-200`}>
      {phase === "ready" && (
        <>
          <p className="text-gray-400 text-lg mb-6">{TASK_LABEL[task]}</p>
          <p className="text-white" style={{ fontSize: 120, fontWeight: 700, lineHeight: 1 }}>{countdown}</p>
          <p className="text-gray-400 mt-6 text-base">준비하세요</p>
        </>
      )}

      {phase === "recording" && (
        <>
          <p className="text-gray-400 text-base mb-4">녹화 중</p>
          <p className="text-white" style={{ fontSize: 96, fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{remaining}</p>
          <p className="text-gray-500 mt-4 text-sm">초 남음</p>
          {needsStimulus && (
            <p className="text-blue-400 mt-8 text-base">
              {stimulusFlash ? "● 신호 — 지금 행동하세요" : "신호음이 나면 행동하세요"}
            </p>
          )}
        </>
      )}

      {phase === "analyzing" && (
        <>
          <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mb-6" />
          <p className="text-white text-xl">분석 중...</p>
        </>
      )}

      {phase !== "analyzing" && (
        <button
          onClick={() => navigate(-1)}
          disabled={phase === "ready" || (phase === "recording" && elapsed < 5)}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl border border-gray-600 text-gray-400 disabled:opacity-20 text-base"
        >
          취소
        </button>
      )}
    </div>
  );
}
