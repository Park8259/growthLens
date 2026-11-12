// 개발용 엔진 테스트 페이지 진입점 — npm run dev 후 /dev.html 로 접속
// 배포 빌드(index.html)에는 포함되지 않습니다.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import EngineTest from "./EngineTest";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <EngineTest />
  </StrictMode>
);
