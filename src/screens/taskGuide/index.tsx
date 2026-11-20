import { useNavigate, useParams } from "react-router-dom";
import { useRecordsStore } from "../../store/records";
import { Pill } from "../../components/ParentNav";
import {
  BackIcon, BallIcon, ImagePlaceholderIcon, PhoneIcon, PinIcon, RulerIcon, SunIcon, VideoIcon,
} from "../../components/icons";
import { TASK_GUIDE, TASK_LABEL } from "../../data/tasks";
import type { TaskType } from "../../types/analysis";
import guideNameResponse from "../../assets/guide-name-response.jpg";

const GUIDE_IMAGE: Partial<Record<TaskType, string>> = {
  name_response: guideNameResponse,
};

const CHECKLIST = [
  { Icon: PhoneIcon, text: "폰을 세워 두세요" },
  { Icon: RulerIcon, text: "아이 전신이 보이도록 2~3m 떨어뜨려 주세요" },
  { Icon: SunIcon, text: "밝은 곳에서 찍어 주세요" },
  { Icon: PinIcon, text: "매번 같은 장소에서 찍으면 더 정확해요" },
];

// Figma 부모 버전 "공 주고받기" — 상단 제목줄과 하단 버튼은 프레임 밖 부품을 조립함
export default function TaskGuideScreen() {
  const { taskType } = useParams<{ taskType: TaskType }>();
  const navigate = useNavigate();
  const records = useRecordsStore((s) => s.records);

  if (!taskType || !(taskType in TASK_LABEL)) return null;
  const task = taskType as TaskType;
  const count = records.filter((r) => r.taskType === task).length;

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      {/* 상단: 뒤로 + 제목 */}
      <div className="flex h-[100px] items-end gap-2.5 px-4 pb-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로 가기" className="text-p-title">
          <BackIcon size={24} />
        </button>
        <h1 className="text-lg font-bold text-p-title">{TASK_LABEL[task]}</h1>
      </div>

      <div className="flex-1 px-5 pb-8">
        {/* 촬영 예시 이미지. 아직 그림이 없는 과제는 자리만 보여줘요 */}
        {GUIDE_IMAGE[task] ? (
          <img
            src={GUIDE_IMAGE[task]}
            alt="아이와 2~3m 떨어져서 휴대폰으로 찍는 모습"
            className="mx-1 block w-[calc(100%-8px)] rounded-[24px]"
          />
        ) : (
          <div className="mx-1 flex h-[147px] flex-col items-center justify-center gap-2.5 rounded-[24px] bg-brand-photo text-brand-icon">
            <ImagePlaceholderIcon size={20} />
            <span className="text-[11px]">촬영 예시 이미지</span>
          </div>
        )}

        {/* 진료일 칩은 뺐어요: 보호자가 실제로 잡은 진료가 아니라 데모 데이터라서 */}
        {count > 0 && (
          <div className="mt-3.5 flex gap-2 px-2.5">
            <Pill>기록 {count}회</Pill>
          </div>
        )}

        <h2 className="mt-3 px-2.5 text-[26px] leading-[31px] font-bold text-p-title">{TASK_LABEL[task]}</h2>
        <p className="mt-3 px-2.5 text-base leading-6 text-p-body whitespace-pre-line">{TASK_GUIDE[task]}</p>

        {task === "ball_play" && (
          <div className="mt-5 flex h-[70px] items-center gap-4 rounded-2xl bg-brand-soft px-[19px]">
            <BallIcon size={20} className="text-brand-icon" />
            <div>
              <p className="text-[13px] font-bold text-brand-deep">준비물</p>
              <p className="mt-1 text-[15px] font-bold text-p-title">밝은 단색 공 (지름 10~20cm)</p>
            </div>
          </div>
        )}

        <h3 className="mt-8 px-2.5 text-lg font-bold text-p-title">찍기 전에 확인해요</h3>
        <ul className="mt-4 space-y-[26px] px-2.5">
          {CHECKLIST.map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-[15px] text-p-title">
              <Icon size={20} className="text-p-gray flex-shrink-0" />
              {text}
            </li>
          ))}
        </ul>
      </div>

      {/* 하단 버튼 */}
      <div className="sticky bottom-0 border-t border-p-line bg-white px-5 pt-3 pb-8">
        <button
          type="button"
          onClick={() => navigate(`/recording/${task}`)}
          className="flex h-[54px] w-full items-center justify-center gap-1.5 rounded-[14px] bg-brand text-base font-bold text-white"
        >
          <VideoIcon size={18} />
          촬영 시작
        </button>
      </div>
    </div>
  );
}
