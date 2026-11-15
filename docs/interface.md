# 인터페이스 계약 — 엔진 ↔ 프론트엔드

엔진(팀원 2)이 프론트엔드(팀원 1)에 제공하는 함수의 입출력 스펙입니다.
이 계약만 지키면, 엔진이 완성되기 전에도 프론트는 더미 함수로 화면을 먼저 만들 수 있습니다.

지표 정의와 측정 방법은 [`engine.md`](engine.md)를, 화면 구성은 [`screens.md`](screens.md)를 보세요.

## 타입 정의

```typescript
// 과제 타입
type TaskType = "name_response" | "imitation" | "ball_play";
// name_response = 호명반응     (반응 지연)
// imitation     = 동작 모방     (모방까지의 지연)
// ball_play     = 공 주고받기   (전달 성공 · 전달 시간)

// 엔진 입력
interface AnalysisInput {
  videoBlob: Blob;
  taskType: TaskType;
  stimulusTimestamp?: number;   // 자극 시점(ms, 녹화 시작 기준)
}

// 엔진 출력
interface AnalysisResult {
  status: "success" | "retry_needed";
  retryReason?: string;         // retry_needed일 때 사용자에게 보여줄 안내 문구

  // 대표 측정값 — 결과 화면에 크게 띄울 값 하나
  metric?: {
    value: number;
    unit: "seconds" | "count";
    label: string;              // 예: "호명 후 반응 지연"
  };

  // 공통 지표(1군) — 과제와 무관하게 모든 영상에서 계산
  ambient?: {
    bothInFrameSec: number;     // 두 사람 모두 검출된 구간 (아래 비율의 분모)
    caregiverOrientSec: number; // 아이가 보호자를 향한 누적
    activitySec: number;        // 움직임 누적
    contactSec: number;         // 신체 접촉 누적 (참고값)
  };

  // 과제별 원시값 — 세션 상세 화면에서 표시
  detail?: Record<string, number | boolean | string>;
}
```

## 함수 시그니처

```typescript
function analyzeVideo(input: AnalysisInput): Promise<AnalysisResult>;
```

- 과제별 분기는 함수 내부에서 처리 — 프론트는 `taskType`만 넘기면 됩니다
- MediaPipe 호출, 랜드마크 추출, 이벤트 감지, 지표 계산은 전부 이 함수 안에 캡슐화

## `stimulusTimestamp` — 앱이 만드는 값입니다

**보호자가 버튼을 누르는 방식이 아닙니다.** 촬영 중에는 폰을 세워 두고 보호자가 2~3m 떨어져 아이와 상호작용하므로 버튼을 누를 수 없습니다.

**앱이 신호음("삐")을 재생하고, 그 재생 시각을 `stimulusTimestamp`로 넘깁니다.** 보호자는 소리를 듣고 바로 행동합니다.

| `taskType` | `stimulusTimestamp` | 의미 |
|---|---|---|
| `name_response` | **필수** | 앱이 호명 신호음을 낸 시각 |
| `imitation` | **필수** | 앱이 시범 안내 신호음을 낸 시각 |
| `ball_play` | 불필요 | 소유권 전환으로 판정 |

없으면 엔진이 `throw`합니다. 프론트는 신호음 재생 시점을 `performance.now()` 기준 상대값(ms)으로 기록해 넘기세요.

선행 연구는 음성 인식으로 이 시점을 잡으려 했고 보호자 발화의 변이 때문에 오차가 생겼다고 한계로 밝혔습니다. 앱이 자기가 만든 시점을 쓰면 오차가 없습니다. **오디오 처리는 구현하지 않습니다.**

## `ambient`가 비어 있는 경우

`ambient`는 **보호자와 아이가 함께 프레임에 들어온 구간**에서만 계산됩니다.

**`name_response`는 보호자가 아이 시야 밖에 있어야 하므로 `ambient`가 `undefined`인 것이 정상입니다.** 프론트는 이를 오류로 처리하지 말고 해당 영역을 숨기면 됩니다.

`imitation`과 `ball_play`는 보호자가 프레임에 있으므로 보통 채워집니다. `bothInFrameSec`가 너무 작으면(전체의 70% 미만) 엔진이 `ambient`를 생략합니다.

## 사용 예시 (프론트 쪽 더미 구현)

엔진이 완성되기 전, 프론트는 아래처럼 가짜 함수로 화면을 먼저 완성하면 됩니다.

```typescript
async function analyzeVideo(input: AnalysisInput): Promise<AnalysisResult> {
  await new Promise((r) => setTimeout(r, 1500)); // 분석 중 로딩 흉내

  switch (input.taskType) {
    case "name_response":
      return {
        status: "success",
        metric: { value: 2.4, unit: "seconds", label: "호명 후 반응 지연" },
        detail: { responded: true, attempts: 1, yawDeltaDeg: 38 },
        // ambient 없음 — 보호자가 시야 밖
      };

    case "imitation":
      return {
        status: "success",
        metric: { value: 3.1, unit: "seconds", label: "모방까지의 지연" },
        ambient: {
          bothInFrameSec: 48.2,
          caregiverOrientSec: 31.5,
          activitySec: 22.8,
          contactSec: 4.1,
        },
        detail: { imitated: true, attempts: 2, actionType: "arm_raise" },
      };

    case "ball_play":
      return {
        status: "success",
        metric: { value: 4, unit: "count", label: "주고받은 횟수" },
        ambient: {
          bothInFrameSec: 55.0,
          caregiverOrientSec: 39.2,
          activitySec: 30.1,
          contactSec: 2.3,
        },
        detail: { transferred: true, transferTimeSec: 2.7, ballDetectedRatio: 0.88 },
      };
  }
}
```

엔진이 완성되면 이 더미를 실제 구현으로 교체만 하면 됩니다. 함수 이름과 타입이 같으므로 호출부는 수정할 필요가 없습니다.

## `status`별 프론트 처리

| status | 프론트가 보여줄 화면 |
|---|---|
| `success` | 결과 화면 — `metric.label`, `metric.value`, `metric.unit`. `ambient`가 있으면 공통 지표 영역도 표시 |
| `retry_needed` | 재촬영 안내 — `retryReason`을 그대로 보여주고 촬영 화면으로 돌아가는 버튼 |

`retryReason` 예시 — 엔진이 이 문구를 그대로 넘깁니다.

- `아이 얼굴이 충분히 보이지 않았습니다` (`name_response`)
- `아이 몸이 충분히 보이지 않았습니다` (`imitation`)
- `공이 화면에 충분히 보이지 않았습니다` (`ball_play`)

**재촬영은 아이의 문제가 아니라 촬영의 문제입니다.** 문구와 색에서 그게 드러나야 합니다. 경고색은 여기서만 씁니다.

## 과제별 요약

| | `name_response` | `imitation` | `ball_play` |
|---|---|---|---|
| 필요 모델 | Pose + Face | Pose | Pose + ObjectDetector |
| `stimulusTimestamp` | 필수 | 필수 | 불필요 |
| `ambient` | 없음(정상) | 있음 | 있음 |
| `metric.unit` | `seconds` | `seconds` | `count` |
| 구현 난도 | 중 | 중 | **높음** |

`ball_play`는 사물 검출이 필요한 유일한 과제입니다. 일정이 밀리면 이것만 빼도 데모는 성립합니다.

## 변경 이력

### 2026-11-15 — 과제 구성 교체

`TaskType` 값이 바뀌었습니다. 과제 구성을 국내 선행 연구([npj Digital Medicine 8:607, 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12514021/))에 맞추기 위한 변경입니다.

```
gross_motor  →  imitation      (독립 서기 → 동작 모방)
fine_motor   →  ball_play      (블록 쌓기 → 공 주고받기)
social       →  name_response  (이름만 변경, 과제는 동일)
```

함께 바뀐 것:

- `AnalysisResult`에 `ambient`(1군 공통 지표)와 `detail`(과제별 원시값) 추가
- `stimulusTimestamp`의 의미 변경 — 보호자 버튼 탭 → **앱의 신호음 재생 시각**
- `imitation`도 `stimulusTimestamp`가 필요해짐

`analyzeVideo` 시그니처는 바뀌지 않았습니다.
