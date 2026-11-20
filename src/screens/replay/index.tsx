// 기록 탭에서 지난 기록을 눌렀을 때 — 촬영 직후 결과 화면과 같은 모양으로 그 기록을 보여줘요.
// (영상 위 관절 표시 "측정 과정 다시 보기"는 영상 저장이 붙으면 다시 넣을 자리)

import { useNavigate, useParams } from "react-router-dom";
import { useRecordsStore } from "../../store/records";
import { BackIcon } from "../../components/icons";
import RecordDetail from "../result/RecordDetail";

const fmtDay = (ts: number) => {
  const d = new Date(ts);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};

export default function ReplayScreen() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const records = useRecordsStore((s) => s.records);
  const record = records.find((r) => r.id === sessionId);

  if (!record) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 px-6 max-w-sm mx-auto">
        <p className="text-[15px] text-p-gray">기록을 찾을 수 없어요</p>
        <button onClick={() => navigate("/timeline")} className="h-[54px] px-8 rounded-[14px] bg-p-card text-base font-bold text-p-body">
          기록으로 돌아가기
        </button>
      </div>
    );
  }

  const task = record.taskType;
  // 이 기록보다 앞선 같은 과제의 성공 기록, 최근 것부터
  const earlier = records
    .filter((r) => r.taskType === task && r.result.status === "success" && r.recordedAt < record.recordedAt)
    .sort((a, b) => b.recordedAt - a.recordedAt);

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      {/* 상단: 뒤로 */}
      <div className="flex h-[100px] items-end px-4 pb-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로 가기" className="text-p-title">
          <BackIcon size={24} />
        </button>
      </div>

      <div className="flex-1 px-5 pb-6">
        <RecordDetail
          task={task}
          title={`${fmtDay(record.recordedAt)} 기록이에요`}
          result={record.result}
          recordedAt={record.recordedAt}
          earlier={earlier}
          currentLabel={fmtDay(record.recordedAt)}
        />
      </div>

      <div className="sticky bottom-0 flex gap-2.5 bg-white px-5 pt-3 pb-8">
        <button type="button" onClick={() => navigate("/timeline")} className="h-[54px] w-[132px] rounded-[14px] bg-p-card text-base font-bold text-p-body">
          기록 목록
        </button>
        <button type="button" onClick={() => navigate(`/task-guide/${task}`)} className="h-[54px] flex-1 rounded-[14px] bg-brand text-base font-bold text-white">
          이 과제 다시 하기
        </button>
      </div>
    </div>
  );
}
