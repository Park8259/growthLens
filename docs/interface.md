# 인터페이스 계약 — 엔진 ↔ 프론트엔드

엔진(팀원 2)이 프론트엔드(팀원 1)에 제공하는 함수의 입출력 스펙입니다.
이 계약만 지키면, 엔진이 완성되기 전에도 프론트는 더미 함수로 화면을 먼저 만들 수 있습니다.

## 타입 정의

```typescript
// 과제 타입
type TaskType = "gross_motor" | "fine_motor" | "social";
// gross_motor = 대근육운동 (독립 서기 유지 시간)
// fine_motor  = 소근육운동 (블록 쌓기 / 핀치 그립)
// social      = 사회성 (호명 후 반응 지연)

// 엔진 입력
interface AnalysisInput {
  videoBlob: Blob;              // 녹화된 영상
  taskType: TaskType;
  stimulusTimestamp?: number;   // social 과제일 때만 필수: 호명 버튼 탭 시점(ms)
}

// 엔진 출력
interface AnalysisResult {
  status: "success" | "retry_needed";
  retryReason?: string;         // status가 retry_needed일 때 사용자에게 보여줄 안내 문구
  metric?: {
    value: number;              // 지표값 (예: 12.3)
    unit: "seconds" | "count";
    label: string;               // 화면에 보여줄 텍스트 (예: "독립 서기 유지 시간")
  };
}
```

## 함수 시그니처

```typescript
function analyzeVideo(input: AnalysisInput): Promise<AnalysisResult>;
```

- 영역별 분기(대근육/소근육/사회성)는 함수 내부에서 처리 — 프론트는 `taskType`만 넘기면 됨
- MediaPipe 호출, 랜드마크 추출, 이벤트 감지, 지표 계산 로직은 전부 이 함수 안에 캡슐화

## 사용 예시 (프론트 쪽 더미 구현)

엔진이 완성되기 전, 프론트는 아래처럼 가짜 함수로 화면을 먼저 완성하면 됩니다:

```typescript
async function analyzeVideo(input: AnalysisInput): Promise<AnalysisResult> {
  await new Promise((r) => setTimeout(r, 1500)); // 분석 중 로딩 흉내
  return {
    status: "success",
    metric: { value: 12.3, unit: "seconds", label: "독립 서기 유지 시간" },
  };
}
```

엔진이 완성되면, 이 더미 함수를 실제 구현으로 교체만 하면 됩니다. (함수 이름과 타입이 동일하므로 호출부 코드는 수정할 필요 없음)

## status별 프론트 처리 방식

| status | 프론트가 보여줄 화면 |
|---|---|
| `success` | 측정 완료 요약 화면 — `metric.label`, `metric.value`, `metric.unit` 표시 |
| `retry_needed` | 재촬영 필요 화면 — `retryReason` 안내 문구 표시 후 촬영 화면으로 돌아가기 |

## 과제별 비고

- **gross_motor, fine_motor**: `stimulusTimestamp` 불필요
- **social**: 보호자가 호명 직후 화면의 탭 버튼을 누른 시점을 `stimulusTimestamp`로 전달 (ms 단위, 영상 녹화 시작 시점 기준 상대값)