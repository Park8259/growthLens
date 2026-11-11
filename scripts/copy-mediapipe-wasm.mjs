// npm install 후 자동 실행: MediaPipe WASM 파일을 public/mediapipe/wasm 으로 복사
// WASM(약 29MB)은 node_modules에 이미 있으므로 저장소에는 올리지 않습니다.
import { cpSync, existsSync } from "node:fs";

const from = "node_modules/@mediapipe/tasks-vision/wasm";
const to = "public/mediapipe/wasm";

if (existsSync(from)) {
  cpSync(from, to, { recursive: true });
} else {
  console.warn(`[copy-mediapipe-wasm] ${from} 없음 — npm install을 먼저 실행하세요`);
}
