# CONTRIBUTING

GrowthLens 팀 협업 규칙.

## 브랜치 전략 — GitHub Flow

- `main`: 항상 작동하는 상태로 유지. 직접 push 금지.
- 모든 작업은 브랜치를 따로 만들어서 진행:
  ```
  feature/기능이름     # 새 기능
  fix/버그이름          # 버그 수정
  docs/문서이름         # 문서 작업
  ```
- 가능하면 이슈 번호를 포함: `feature/12-standing-duration`

## 작업 흐름

1. 작업 시작 전 GitHub Issues에 작업 내용 등록
2. `main`에서 새 브랜치 생성
   ```bash
   git checkout main
   git pull
   git checkout -b feature/기능이름
   ```
3. 작업 후 커밋 (아래 커밋 규칙 참고)
4. 브랜치 push
   ```bash
   git push -u origin feature/기능이름
   ```
5. GitHub에서 Pull Request(PR) 생성 → 팀원 1명 이상 리뷰 요청
6. 리뷰 승인 후 `main`에 merge
7. 로컬 `main` 최신화
   ```bash
   git checkout main
   git pull
   ```

## 커밋 메시지 규칙 (Conventional Commits)

```
<타입>: <내용>
```

| 타입 | 의미 |
|---|---|
| `feat` | 새 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 변경 |
| `refactor` | 동작은 그대로, 구조만 개선 |
| `style` | 포맷팅, 세미콜론 등 (코드 동작과 무관) |
| `test` | 테스트 추가/수정 |
| `chore` | 빌드 설정, 패키지 설치 등 잡일 |

예시:
```
feat: 대근육 지표 — 독립 서기 유지 시간 판정 로직 추가
fix: 호명 반응 지연 계산 시 음수값 버그 수정
docs: 인터페이스 계약 문서 추가
```

## PR 규칙

- 작은 단위로 자주 PR을 올리는 걸 선호 (한 PR = 한 가지 작업)
- PR 템플릿(`.github/PULL_REQUEST_TEMPLATE.md`)의 체크리스트를 채울 것
- 리뷰어는 로직이 맞는지보다, **"내가 이 코드를 보고 이해할 수 있는가"**를 기준으로 봐도 충분함 (팀 전체가 아직 저학년 포함이라 과도하게 엄격할 필요 없음)
- 머지 방식: Squash and merge 권장 (커밋 이력을 깔끔하게 유지)

## 이슈 라벨

작업 등록 시 아래 라벨 중 하나 이상 지정:

- `frontend` — 화면/UI 작업
- `engine` — 영상 분석·지표 판정 로직
- `design` — 디자인팀과 연결된 작업
- `docs` — 문서 작업
- `bug` — 버그 수정

## 커밋/PR 전 체크리스트

- [ ] 로컬에서 `npm run dev`로 정상 동작 확인
- [ ] 콘솔에 불필요한 `console.log` 제거
- [ ] 관련 이슈 번호를 PR 본문에 연결 (`closes #이슈번호`)