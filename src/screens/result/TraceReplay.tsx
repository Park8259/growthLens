import { useEffect, useRef, useState } from "react";
import type { FaceTrace } from "../../types/analysis";

// "AI가 본 장면": 방금 찍은 영상 위에 분석 때 뽑은 얼굴 윤곽과 고개 방향을 다시 그려요.
// 좌표는 분석 때 이미 뽑은 것을 그대로 쓰고, AI를 다시 돌리지 않아요.

const OUTLINE_POINTS = 36; // pts의 앞 36점이 얼굴 윤곽, 마지막 1점이 코끝
const EVENT_SEC = 1.5; // "이름을 불렀어요" 같은 알림을 띄워 두는 시간
const BRAND = "#14C4FF";
const DEEP = "#0E8DBA";

export default function TraceReplay({ video, trace }: { video: Blob; trace: FaceTrace }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 영상 주소는 효과 안에서 만들고 해제해요 (개발 모드에서 효과가 두 번 돌아도 안전)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const url = URL.createObjectURL(video);
    v.src = url;
    return () => {
      v.removeAttribute("src");
      v.load();
      URL.revokeObjectURL(url);
    };
  }, [video]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const { frames, stimulusSec, responseSec } = trace;
  const step = frames.length > 1 ? frames[1].t - frames[0].t : 1 / 15;

  // 영상 위에 매 화면마다 그리기
  useEffect(() => {
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const v = videoRef.current;
      const c = canvasRef.current;
      const box = boxRef.current;
      if (!v || !c || !box || !v.videoWidth) return;

      const dpr = window.devicePixelRatio || 1;
      const cw = box.clientWidth;
      const ch = box.clientHeight;
      if (c.width !== Math.round(cw * dpr) || c.height !== Math.round(ch * dpr)) {
        c.width = Math.round(cw * dpr);
        c.height = Math.round(ch * dpr);
      }
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);

      // object-contain 으로 놓인 영상의 실제 위치
      const scale = Math.min(cw / v.videoWidth, ch / v.videoHeight);
      const w = v.videoWidth * scale;
      const h = v.videoHeight * scale;
      const ox = (cw - w) / 2;
      const oy = (ch - h) / 2;

      const t = v.currentTime;
      const i = Math.min(frames.length - 1, Math.max(0, Math.round((t - frames[0].t) / step)));
      const f = frames[i];
      if (!f?.pts) return;

      const px = (k: number) => ox + f.pts![k * 2] * w;
      const py = (k: number) => oy + f.pts![k * 2 + 1] * h;
      const responding = responseSec !== null && t >= responseSec && t < responseSec + EVENT_SEC;
      const color = responding ? DEEP : BRAND;

      // 얼굴 윤곽
      ctx.beginPath();
      for (let k = 0; k < OUTLINE_POINTS; k++) {
        if (k === 0) ctx.moveTo(px(k), py(k));
        else ctx.lineTo(px(k), py(k));
      }
      ctx.closePath();
      ctx.lineWidth = responding ? 4 : 2.5;
      ctx.strokeStyle = color;
      ctx.stroke();

      // 고개 방향: 얼굴 가운데 → 코끝 방향으로 화살표
      let cx = 0;
      let cy = 0;
      for (let k = 0; k < OUTLINE_POINTS; k++) { cx += px(k); cy += py(k); }
      cx /= OUTLINE_POINTS;
      cy /= OUTLINE_POINTS;
      const nx = px(OUTLINE_POINTS);
      const ny = py(OUTLINE_POINTS);
      const dx = nx - cx;
      const dy = ny - cy;
      const len = Math.hypot(dx, dy);
      if (len > 1) {
        const reach = Math.max(28, len * 3);
        const ex = nx + (dx / len) * reach;
        const ey = ny + (dy / len) * reach;
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(ex, ey);
        ctx.lineWidth = 3;
        ctx.strokeStyle = color;
        ctx.stroke();
        const a = Math.atan2(ey - ny, ex - nx);
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - 11 * Math.cos(a - 0.5), ey - 11 * Math.sin(a - 0.5));
        ctx.lineTo(ex - 11 * Math.cos(a + 0.5), ey - 11 * Math.sin(a + 0.5));
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(nx, ny, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [frames, step, responseSec]);

  const frameAt = frames[Math.min(frames.length - 1, Math.max(0, Math.round((time - (frames[0]?.t ?? 0)) / step)))];
  const event =
    responseSec !== null && time >= responseSec && time < responseSec + EVENT_SEC
      ? `고개를 돌렸어요 · ${Math.round((responseSec - stimulusSec) * 10) / 10}초`
      : time >= stimulusSec && time < stimulusSec + EVENT_SEC
        ? "이름을 불렀어요"
        : null;

  function toggle() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  }

  function seek(sec: number, play = false) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(sec, (v.duration || sec) - 0.05));
    setTime(v.currentTime);
    if (play) void v.play();
  }

  const pct = (sec: number) => `${duration > 0 ? Math.min(100, (sec / duration) * 100) : 0}%`;

  return (
    <section className="mt-[34px]">
      <h2 className="text-base font-bold text-p-title">AI가 본 장면</h2>
      <p className="mt-1.5 text-[13px] text-p-gray">얼굴 윤곽과 고개 방향을 영상 위에 표시했어요. 영상은 이 휴대폰에만 있어요.</p>

      <div ref={boxRef} className="relative mt-3.5 h-[420px] overflow-hidden rounded-2xl bg-p-dark">
        <video
          ref={videoRef}
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-contain"
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onClick={toggle}
        />
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

        {/* 위: 지금 고개 각도 */}
        <p className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-bold text-white tabular-nums">
          {frameAt?.yaw != null ? `고개 각도 ${Math.round(Math.abs(frameAt.yaw))}°` : "얼굴을 찾는 중"}
        </p>
        {/* 아래: 이름 부름 / 돌아봄 알림 */}
        {event && (
          <p className="pointer-events-none absolute inset-x-0 bottom-4 mx-auto w-fit rounded-full bg-white px-4 py-2 text-sm font-bold text-brand-deep shadow">
            {event}
          </p>
        )}
        {!playing && (
          <button
            type="button"
            onClick={toggle}
            aria-label="재생"
            className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90"
          >
            <svg width="22" height="22" viewBox="0 0 22 22"><polygon points="8,5 18,11 8,17" fill="#111" /></svg>
          </button>
        )}
      </div>

      {/* 시간 막대: 이름 부름·반응 시점 표시, 누르면 그 위치로 */}
      <div
        className="relative mt-4 h-1.5 cursor-pointer rounded-full bg-p-line"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          seek(((e.clientX - r.left) / r.width) * duration);
        }}
      >
        <div className="absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: pct(time) }} />
        <span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-p-gray" style={{ left: pct(stimulusSec) }} />
        {responseSec !== null && (
          <span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand-deep" style={{ left: pct(responseSec) }} />
        )}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-p-gray">
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-p-gray" />이름 부름</span>
          {responseSec !== null && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-brand-deep" />돌아봄</span>}
        </span>
        <span className="tabular-nums">{fmt(time)} / {fmt(duration)}</span>
      </div>

      <button
        type="button"
        onClick={() => seek(stimulusSec - 0.5, true)}
        className="mt-3.5 h-11 w-full rounded-xl bg-brand-soft text-sm font-bold text-brand-deep"
      >
        이름 부른 순간부터 보기
      </button>
    </section>
  );
}

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
