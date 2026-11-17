import { useState } from "react";
import BottomSheet from "../../../components/BottomSheet";
import { useNotesStore } from "../../../store/notes";
import { CheckIcon } from "../../../components/icons";

// Figma 의사 버전 "진료메모" 시트
const DEFAULT_TASKS = ["블록 쌓기", "컵에 블록 넣기", "손가락으로 가리키기"];

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function MemoSheet({ patientId, onClose }: { patientId: string; onClose: () => void }) {
  const addNote = useNotesStore((s) => s.addNote);
  const [text, setText] = useState("");
  const [shared, setShared] = useState(true);
  const [options, setOptions] = useState(DEFAULT_TASKS);
  const [picked, setPicked] = useState<string[]>([]);
  const [custom, setCustom] = useState<string | null>(null);
  const [date] = useState(todayIso);
  const [, m, d] = date.split("-").map(Number);

  const toggle = (t: string) => setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  function save() {
    if (!text.trim()) return;
    addNote({ patientId, date, text: text.trim(), isShared: shared, nextTasks: picked });
    onClose();
  }

  return (
    <BottomSheet open onClose={onClose} title="">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-bold text-p-title">진료 메모</h2>
        <span className="text-[13px] text-p-gray">{m}월 {d}일</span>
      </div>
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="진료 내용을 적어주세요"
        rows={4}
        className="mt-4 w-full resize-none rounded-xl border border-brand px-4 py-3.5 text-[15px] leading-6 text-p-title placeholder:text-p-light focus:outline-none"
      />

      <div className="mt-5 flex items-center justify-between">
        <div>
          <p className="text-[15px] font-bold text-p-title">보호자에게도 보여주기</p>
          <p className="mt-1 text-xs text-p-gray">끄면 선생님만 볼 수 있어요</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={shared}
          onClick={() => setShared((v) => !v)}
          className={`relative h-[31px] w-[51px] rounded-full transition-colors ${shared ? "bg-brand" : "bg-[#DADDE1]"}`}
        >
          <span className={`absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow transition-all ${shared ? "left-[22px]" : "left-[2px]"}`} />
        </button>
      </div>

      <div className="mt-6 flex items-baseline justify-between">
        <p className="text-[15px] font-bold text-p-title">다음 관찰 과제 보내기</p>
        <span className="text-xs text-p-gray">다음 진료 전까지</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((t) => {
          const on = picked.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggle(t)}
              aria-pressed={on}
              className={`flex h-9 items-center gap-1 rounded-lg px-3 text-[13px] ${
                on ? "border border-brand bg-brand-light font-bold text-brand-deep" : "border border-p-line text-p-body"
              }`}
            >
              {on && <CheckIcon size={14} />}
              {t}
            </button>
          );
        })}
        {custom === null ? (
          <button type="button" onClick={() => setCustom("")} className="h-9 rounded-lg border border-p-line px-3 text-[13px] text-p-body">
            + 직접 추가
          </button>
        ) : (
          <input
            autoFocus
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && custom.trim()) {
                setOptions((o) => [...o, custom.trim()]);
                setPicked((p) => [...p, custom.trim()]);
                setCustom(null);
              }
            }}
            onBlur={() => setCustom(null)}
            placeholder="과제 이름 입력 후 Enter"
            className="h-9 w-40 rounded-lg border border-brand px-3 text-[13px] focus:outline-none"
          />
        )}
      </div>

      <div className="mt-7 flex gap-2.5">
        <button type="button" onClick={onClose} className="h-[54px] w-[94px] rounded-[14px] bg-p-card text-base font-bold text-p-body">
          취소
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!text.trim()}
          className="h-[54px] flex-1 rounded-[14px] bg-brand text-base font-bold text-white disabled:opacity-50"
        >
          {shared ? "저장하고 보내기" : "저장하기"}
        </button>
      </div>
    </BottomSheet>
  );
}
