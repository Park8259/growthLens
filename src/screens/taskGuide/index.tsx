import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../../components/NavBar";
import type { TaskType } from "../../types/analysis";

const TASK_LABEL: Record<TaskType, string> = {
  name_response: "호명반응",
  imitation: "동작 모방",
  ball_play: "공 주고받기",
};
const TASK_DESC: Record<TaskType, string> = {
  name_response: "이름을 부르면 얼마나 빨리 돌아보는지 봅니다",
  imitation: "보호자 동작을 아이가 따라 하는지 봅니다",
  ball_play: "공을 보호자와 주고받는지 봅니다",
};
const TASK_NOTE: Record<TaskType, string> = {
  name_response: "아이 시야 밖에서 이름을 불러 주세요. 소리가 나면 바로 부르세요.",
  imitation: "소리가 나면 손 들기 또는 박수를 아이가 보는 앞에서 해 주세요.",
  ball_play: "밝은 단색 공(지름 10~20cm)을 아이와 보호자 사이에 두세요. 공이 화면에 계속 보여야 합니다.",
};
const CHECKLIST = [
  "폰을 세워 두세요",
  "아이 전신이 보이도록 2~3m 떨어뜨려 주세요",
  "밝은 곳에서 찍어 주세요",
  "매번 같은 장소에서 찍으면 변화를 더 정확히 볼 수 있습니다",
];

export default function TaskGuideScreen() {
  const { taskType } = useParams<{ taskType: TaskType }>();
  const navigate = useNavigate();

  if (!taskType || !(taskType in TASK_LABEL)) return null;

  const task = taskType as TaskType;

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      <NavBar title={TASK_LABEL[task]} />

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        <p className="text-sm text-gray-600">{TASK_DESC[task]}</p>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">준비 체크</p>
          <div className="space-y-3">
            {CHECKLIST.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 flex items-center justify-center">
                  <span className="text-[10px] text-gray-400">{i + 1}</span>
                </span>
                <p className="text-sm text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-500 mb-1.5">과제 안내</p>
          <p className="text-sm text-gray-700">{TASK_NOTE[task]}</p>
        </div>
      </div>

      <div className="px-5 pb-10 pt-4 bg-white border-t border-gray-50">
        <button
          onClick={() => navigate(`/recording/${task}`)}
          className="w-full py-4 rounded-2xl bg-gray-900 text-white font-semibold text-base"
        >
          촬영 시작
        </button>
      </div>
    </div>
  );
}
