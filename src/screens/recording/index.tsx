import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRecordsStore } from "../../store/records";
import { analyzeVideo } from "../../engine/analyzeVideo";
import type { TaskType } from "../../types/analysis";

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

type Phase = "init" | "ready" | "recording" | "analyzing" | "error";

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    osc.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch { /* ignore */ }
}

export default function RecordingScreen() {
  const { taskType } = useParams<{ taskType: TaskType }>();
  const navigate = useNavigate();
  const addRecord = useRecordsStore((s) => s.addRecord);
  const task = (taskType ?? "name_response") as TaskType;
  const duration = DURATION[task];
  const needsStimulus = task === "name_response" || task === "imitation";

  const [phase, setPhase] = useState<Phase>("init");
  const [countdown, setCountdown] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [stimulusFlash, setStimulusFlash] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingStartRef = useRef<number>(0);
  const stimulusTimestampRef = useRef<number | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  // 카메라 초기화
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
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
        }
        setPhase("ready");
      } catch {
        if (!cancelled) {
          setErrorMsg("카메라 접근이 거부됐습니다. 브라우저 설정에서 카메라를 허용해 주세요.");
          setPhase("error");
        }
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // 카운트다운
  useEffect(() => {
    if (phase !== "ready") return;
    if (countdown <= 0) {
      startRecording();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const startRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;

    chunksRef.current = [];
    const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"]
      .find((m) => MediaRecorder.isTypeSupported(m)) ?? "";

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.start(500); // 0.5초마다 chunk
    recorderRef.current = recorder;
    recordingStartRef.current = performance.now();
    setPhase("recording");
  }, []);

  // 녹화 타이머
  useEffect(() => {
    if (phase !== "recording") return;
    const t = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;

        // 자극 신호: 5초, 10초, 15초 (최대 3회)
        if (needsStimulus && next % 5 === 0 && next <= 15) {
          if (stimulusTimestampRef.current === null) {
            // 녹화 시작 기준 ms
            stimulusTimestampRef.current = performance.now() - recordingStartRef.current;
          }
          setStimulusFlash(true);
          setTimeout(() => setStimulusFlash(false), 400);
          playBeep();
        }

        if (next >= duration) {
          clearInterval(t);
          stopAndAnalyze();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, duration, needsStimulus]);

  const stopAndAnalyze = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder) return;

    setPhase("analyzing");
    setAnalyzeProgress("영상 처리 중...");

    recorder.onstop = async () => {
      const mimeType = recorder.mimeType || "video/webm";
      const blob = new Blob(chunksRef.current, { type: mimeType });

      try {
        setAnalyzeProgress("모델 로딩 중...");
        const result = await analyzeVideo({
          videoBlob: blob,
          taskType: task,
          stimulusTimestamp: stimulusTimestampRef.current ?? undefined,
        });

        addRecord({ taskType: task, recordedAt: Date.now(), result });
        navigate(`/result/${task}`, { state: { result } });
      } catch (err) {
        setErrorMsg(`분석 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`);
        setPhase("error");
      }
    };

    recorder.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, [task, addRecord, navigate]);

  const handleCancel = () => {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    navigate(-1);
  };

  const remaining = duration - elapsed;
  const bg = stimulusFlash
    ? "bg-blue-700"
    : phase === "recording"
    ? "bg-gray-900"
    : "bg-black";

  if (phase === "error") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 gap-6 max-w-sm mx-auto">
        <p className="text-sm text-gray-700 text-center">{errorMsg}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-2xl border border-gray-200 text-sm text-gray-700">
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} flex flex-col items-center justify-center transition-colors duration-200 relative`}>
      {/* 카메라 프리뷰 — 항상 렌더링, 준비/녹화 중에만 보임 */}
      <video
        ref={videoPreviewRef}
        autoPlay
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover opacity-30 ${
          phase === "analyzing" || phase === "init" ? "hidden" : ""
        }`}
        style={{ transform: "scaleX(-1)" }} // 전면 카메라 좌우 반전
      />

      <div className="relative z-10 flex flex-col items-center">
        {phase === "init" && (
          <p className="text-gray-400 text-base">카메라 준비 중...</p>
        )}

        {phase === "ready" && (
          <>
            <p className="text-gray-300 text-lg mb-6">{TASK_LABEL[task]}</p>
            <p className="text-white font-bold tabular-nums" style={{ fontSize: 120, lineHeight: 1 }}>
              {countdown || "시작"}
            </p>
            <p className="text-gray-400 mt-6 text-base">폰을 세워 두세요</p>
          </>
        )}

        {phase === "recording" && (
          <>
            <p className="text-gray-400 text-base mb-4">녹화 중</p>
            <p className="text-white font-bold tabular-nums" style={{ fontSize: 96, lineHeight: 1 }}>
              {remaining}
            </p>
            <p className="text-gray-500 mt-4 text-sm">초 남음</p>
            {needsStimulus && (
              <p className="text-blue-300 mt-8 text-base">
                {stimulusFlash ? "● 신호 — 지금 행동하세요" : "신호음이 나면 행동하세요"}
              </p>
            )}
          </>
        )}

        {phase === "analyzing" && (
          <>
            <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mb-6" />
            <p className="text-white text-xl mb-2">분석 중...</p>
            <p className="text-gray-400 text-sm">{analyzeProgress}</p>
          </>
        )}
      </div>

      {(phase === "ready" || phase === "recording") && (
        <button
          onClick={handleCancel}
          disabled={phase === "ready" || (phase === "recording" && elapsed < 5)}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl border border-gray-600 text-gray-400 disabled:opacity-20 text-base"
        >
          취소
        </button>
      )}
    </div>
  );
}
