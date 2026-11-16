import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mockPatients } from "../../../data/mockDoctor";
import { BackIcon, InfoIcon, PlayFillIcon } from "../../../components/icons";
import { TASK_LABEL } from "../../../data/tasks";
import type { TaskType } from "../../../types/analysis";
import { SCENE_IMAGES } from "../format";

// Figma 의사 버전 "영상확인 " — AI가 고른 장면을 선생님이 확인
// 영상은 아직 저장하지 않아서, Figma 이미지와 데모 타임라인을 보여줘요.

interface Moment { sec: number; text: string; key?: boolean }
const MOMENTS: Record<TaskType, Moment[]> = {
  name_response: [
    { sec: 3, text: "이름을 불렀어요" },
    { sec: 7, text: "주변을 잠시 둘러봐요" },
    { sec: 15, text: "이름을 듣고 고개를 돌려요", key: true },
    { sec: 21, text: "보호자를 바라봐요" },
  ],
  imitation: [
    { sec: 5, text: "보호자가 박수를 보여줘요" },
    { sec: 9, text: "아이가 보호자를 봐요" },
    { sec: 12, text: "아이가 박수를 따라 해요", key: true },
    { sec: 20, text: "다시 놀이로 돌아가요" },
  ],
  ball_play: [
    { sec: 4, text: "보호자가 공을 굴려요" },
    { sec: 8, text: "아이가 공을 잡아요" },
    { sec: 11, text: "아이가 공을 다시 던져요", key: true },
    { sec: 25, text: "두 번째로 주고받아요" },
  ],
};
const LENGTH = 30;
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function DoctorSceneScreen() {
  const { id, recordId } = useParams<{ id: string; recordId: string }>();
  const navigate = useNavigate();
  const patient = mockPatients.find((p) => p.id === id);
  const record = patient?.records.find((r) => r.id === recordId);
  const moments = record ? MOMENTS[record.taskType] : [];
  const [cur, setCur] = useState(() => moments.find((m) => m.key)?.sec ?? 0);
  const [answer, setAnswer] = useState<"agree" | "differ" | null>(null);

  if (!patient || !record) return null;
  const d = new Date(record.recordedAt);
  const imgIndex = patient.records.indexOf(record) % SCENE_IMAGES.length;

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      <div className="flex items-start gap-3 px-4 pt-[60px]">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로 가기" className="text-p-title">
          <BackIcon size={24} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-p-title">{TASK_LABEL[record.taskType]}</h1>
          <p className="mt-1 text-[13px] text-p-gray">{patient.name} · {d.getMonth() + 1}월 {d.getDate()}일 촬영</p>
        </div>
      </div>

      <div className="flex-1 px-5 pb-6">
        {/* 영상 자리 */}
        <div className="relative mt-4 h-[230px] overflow-hidden rounded-2xl">
          <img src={SCENE_IMAGES[imgIndex]} alt="" className="h-full w-full object-cover" />
          <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-brand">
            <PlayFillIcon size={18} />
          </span>
          <div className="absolute inset-x-3 bottom-8">
            <div className="relative h-1 rounded-full bg-white/40">
              <div className="absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: `${(cur / LENGTH) * 100}%` }} />
              {moments.map((m) => (
                <span key={m.sec} className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" style={{ left: `${(m.sec / LENGTH) * 100}%` }} />
              ))}
            </div>
          </div>
          <div className="absolute inset-x-3 bottom-2 flex justify-between text-[11px] font-bold text-white tabular-nums">
            <span>{mmss(cur)}</span>
            <span>{mmss(LENGTH)}</span>
          </div>
        </div>

        <div className="mt-6 flex items-baseline justify-between">
          <h2 className="text-base font-bold text-p-title">AI가 관찰한 장면</h2>
          <span className="text-[13px] text-p-gray">누르면 그 장면으로 이동</span>
        </div>
        <ul className="mt-3 space-y-1">
          {moments.map((m) => {
            const on = cur === m.sec;
            return (
              <li key={m.sec}>
                <button
                  type="button"
                  onClick={() => setCur(m.sec)}
                  className={`flex h-[44px] w-full items-center gap-4 rounded-xl px-3 text-left text-[15px] ${on ? "bg-brand text-white" : "text-p-title"}`}
                >
                  <b className={`w-9 tabular-nums ${on ? "text-white" : "text-brand-icon"}`}>{mmss(m.sec)}</b>
                  <span className="flex-1">{m.text}</span>
                  {m.key && <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${on ? "bg-white text-brand-icon" : "bg-brand-chip text-brand-icon"}`}>다시 볼 장면</span>}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-p-gray">
          <InfoIcon size={16} className="text-p-light" />
          AI 관찰은 참고용이에요. 판단은 선생님이 직접 해주세요.
        </p>
      </div>

      <div className="sticky bottom-0 bg-white px-5 pt-3 pb-8">
        <p className="text-[15px] font-bold text-p-title">
          {answer === null ? "AI 관찰이 맞나요?" : answer === "agree" ? "확인했어요. 고마워요!" : "의견을 남겼어요. 메모로 자세히 적을 수 있어요."}
        </p>
        <div className="mt-3 flex gap-2.5">
          <button
            type="button"
            onClick={() => setAnswer("differ")}
            className={`h-[54px] flex-1 rounded-[14px] border text-base font-bold ${answer === "differ" ? "border-brand bg-brand-light text-brand-deep" : "border-p-line text-p-title"}`}
          >
            다르게 봤어요
          </button>
          <button
            type="button"
            onClick={() => setAnswer("agree")}
            className={`h-[54px] flex-1 rounded-[14px] text-base font-bold text-white ${answer === "agree" ? "bg-brand-icon" : "bg-brand"}`}
          >
            맞아요
          </button>
        </div>
      </div>
    </div>
  );
}
