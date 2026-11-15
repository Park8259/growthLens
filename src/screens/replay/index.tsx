// 측정 과정 다시 보기 — 영상 위에 포즈 랜드마크 오버레이
// 현재: 레이아웃 프로토타입 (실제 영상·랜드마크 미연동)
// 실제 구현 시: IndexedDB에서 videoBlob + 분석 당시 PoseTrack 불러와서 canvas에 렌더링

import { useNavigate, useParams } from "react-router-dom";
import { useRecordsStore } from "../../store/records";
import NavBar from "../../components/NavBar";
import type { TaskType } from "../../types/analysis";

const TASK_LABEL: Record<TaskType, string> = {
  name_response: "호명반응",
  imitation: "동작 모방",
  ball_play: "공 주고받기",
};

const METRIC_MOMENT: Record<TaskType, string> = {
  name_response: "고개를 돌리기 시작한 시점",
  imitation: "모방 동작이 감지된 시점",
  ball_play: "공 소유권이 전환된 시점",
};

export default function ReplayScreen() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const record = useRecordsStore((s) => s.records.find((r) => r.id === sessionId));

  if (!record) {
    return (
      <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
        <NavBar title="측정 과정" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">기록을 찾을 수 없습니다</p>
        </div>
      </div>
    );
  }

  const task = record.taskType;
  const metric = record.result.metric;
  const unitLabel = metric?.unit === "seconds" ? "초" : "회";

  return (
    <div className="min-h-screen bg-black flex flex-col max-w-sm mx-auto">
      <div className="bg-black pt-14 pb-2 px-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 text-white/60">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M14 5l-6 6 6 6" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-white">{TASK_LABEL[task]} 측정 과정</span>
      </div>

      {/* 영상 + 오버레이 영역 */}
      <div className="relative w-full bg-gray-900" style={{ aspectRatio: "9/16" }}>

        {/* 영상 플레이스홀더 — 실제 구현 시 <video> 태그로 교체 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center mx-auto mb-3">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
                <polygon points="10,8 22,14 10,20" fill="white" stroke="none" />
              </svg>
            </div>
            <p className="text-white/40 text-xs">영상 로딩 중</p>
          </div>
        </div>

        {/* 포즈 랜드마크 오버레이 플레이스홀더 */}
        {/* 실제 구현 시: <canvas> 절대 위치로 올리고 requestAnimationFrame으로 video.currentTime 추적 */}
        <svg className="absolute inset-0 w-full h-full opacity-70" viewBox="0 0 100 177" preserveAspectRatio="none">
          {/* 아이 스켈레톤 (예시 좌표) */}
          <g stroke="#4ade80" strokeWidth="0.8" strokeLinecap="round">
            {/* 머리 */}
            <circle cx="50" cy="30" r="4" fill="none" />
            {/* 몸통 */}
            <line x1="50" y1="34" x2="50" y2="65" />
            {/* 왼팔 */}
            <line x1="50" y1="40" x2="38" y2="52" />
            <line x1="38" y1="52" x2="30" y2="60" />
            {/* 오른팔 */}
            <line x1="50" y1="40" x2="62" y2="52" />
            <line x1="62" y1="52" x2="70" y2="60" />
            {/* 왼다리 */}
            <line x1="50" y1="65" x2="44" y2="85" />
            <line x1="44" y1="85" x2="42" y2="105" />
            {/* 오른다리 */}
            <line x1="50" y1="65" x2="56" y2="85" />
            <line x1="56" y1="85" x2="58" y2="105" />
          </g>
          {/* 관절 점 */}
          {[[50,30],[50,42],[50,65],[38,52],[30,60],[62,52],[70,60],[44,85],[42,105],[56,85],[58,105]].map(([cx,cy],i) => (
            <circle key={i} cx={cx} cy={cy} r="1.2" fill="#4ade80" />
          ))}

          {/* 보호자 스켈레톤 (예시) */}
          <g stroke="#60a5fa" strokeWidth="0.8" strokeLinecap="round" opacity="0.6">
            <circle cx="75" cy="55" r="4" fill="none" />
            <line x1="75" y1="59" x2="75" y2="90" />
            <line x1="75" y1="65" x2="63" y2="77" />
            <line x1="75" y1="65" x2="87" y2="77" />
            <line x1="75" y1="90" x2="70" y2="115" />
            <line x1="75" y1="90" x2="80" y2="115" />
          </g>
        </svg>

        {/* 반응 감지 시점 마커 */}
        {metric && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/70 rounded-xl px-3 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-white/60">{METRIC_MOMENT[task]}</p>
                <p className="text-sm font-semibold text-white tabular-nums">
                  {metric.value}{unitLabel}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 범례 */}
        <div className="absolute top-4 right-4 space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-green-400" />
            <p className="text-xs text-white/60">아이</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-blue-400" />
            <p className="text-xs text-white/60">보호자</p>
          </div>
        </div>
      </div>

      {/* 재생 컨트롤 */}
      <div className="bg-gray-900 px-5 py-4">
        {/* 타임라인 바 */}
        <div className="relative h-1 bg-white/20 rounded-full mb-3">
          <div className="absolute left-0 top-0 h-full bg-white rounded-full" style={{ width: "32%" }} />
          {/* 반응 감지 시점 마커 */}
          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-green-400 border-2 border-gray-900" style={{ left: "30%" }} />
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-white/40 tabular-nums">0:05</span>
          <span className="text-xs text-green-400 tabular-nums">반응 감지</span>
          <span className="text-xs text-white/40 tabular-nums">0:30</span>
        </div>

        <div className="flex items-center justify-center gap-8">
          {/* 처음으로 */}
          <button className="p-2 text-white/60">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="5" y1="4" x2="5" y2="18" />
              <polygon points="8,4 19,11 8,18" fill="currentColor" stroke="none" style={{ transform: "scaleX(-1)", transformOrigin: "13.5px 11px" }} />
            </svg>
          </button>
          {/* 재생/일시정지 */}
          <button className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <polygon points="8,5 18,11 8,17" fill="#111" />
            </svg>
          </button>
          {/* 하이라이트로 이동 */}
          <button className="p-2 text-green-400">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="3" /><line x1="11" y1="4" x2="11" y2="6" /><line x1="11" y1="16" x2="11" y2="18" /><line x1="4" y1="11" x2="6" y2="11" /><line x1="16" y1="11" x2="18" y2="11" />
            </svg>
          </button>
        </div>
      </div>

      {/* 하단 — 측정 요약 */}
      <div className="bg-white flex-1 px-5 py-5 space-y-3">
        <p className="text-xs font-semibold text-gray-400">이 영상의 측정값</p>
        {metric && (
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 tabular-nums">{metric.value}</span>
            <span className="text-lg text-gray-400">{unitLabel}</span>
            <span className="text-sm text-gray-400 ml-1">{metric.label}</span>
          </div>
        )}

        {record.result.ambient && (
          <div className="grid grid-cols-2 gap-2 pt-2">
            {[
              { label: "보호자 지향", val: record.result.ambient.caregiverOrientSec, total: record.result.ambient.bothInFrameSec },
              { label: "활동량", val: record.result.ambient.activitySec, total: record.result.ambient.bothInFrameSec },
            ].map(({ label, val, total }) => (
              <div key={label} className="bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-semibold text-gray-900 tabular-nums">
                  {total > 0 ? Math.round((val / total) * 100) : 0}%
                </p>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-300 pt-1">
          초록색 선: 아이 관절 · 파란색 선: 보호자 관절
        </p>
      </div>
    </div>
  );
}
