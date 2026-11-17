import { useNavigate } from "react-router-dom";
import { useChildStore } from "../store/child";

/**
 * 베베뷰 로고. 누르면 아이 정보를 지우고 역할 선택 화면으로 돌아가요.
 * (데모 때 정보입력부터 다시 보여주기 위한 숨은 기능. 기록은 지우지 않아요)
 */
export default function LogoReset({ mark = 31, word = 36 }: { mark?: number; word?: number }) {
  const navigate = useNavigate();
  const profile = useChildStore((s) => s.profile);
  const clearProfile = useChildStore((s) => s.clearProfile);

  function reset() {
    if (profile && !window.confirm("아이 정보를 지우고 처음부터 다시 입력할까요?")) return;
    clearProfile();
    navigate("/", { replace: true });
  }

  return (
    <button type="button" onClick={reset} aria-label="베베뷰 처음으로" className="flex items-center gap-0.5">
      <img src="/images/logo-mark.png" alt="" style={{ height: mark }} className="w-auto" />
      <img src="/images/logo-wordmark.png" alt="베베뷰" style={{ height: word }} className="w-auto" />
    </button>
  );
}
