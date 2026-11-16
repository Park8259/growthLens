import type { MeasurementRecord } from "../storage/records";
import type { AnalysisResult, TaskType } from "../types/analysis";

// 의사 앱 데모 데이터 (Figma 의사 버전 값 기준)
// 날짜는 "오늘" 기준으로 만들어서, 언제 데모를 찍어도 오늘 진료·새 기록이 보이게 해요.

export const mockDoctor = {
  name: "김민준",
  specialty: "소아청소년과",
  hospital: "서울어린이발달센터",
};

const DAY = 24 * 60 * 60 * 1000;

function at(daysFromToday: number, hh: number, mm = 0): number {
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d.getTime() + daysFromToday * DAY;
}
export function isoDay(daysFromToday: number): string {
  const d = new Date(at(daysFromToday, 12));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** 진료 상태: 확인 완료 / 요약 미확인 / 재촬영 요청 보냄 */
export type VisitStatus = "done" | "unread" | "retake";

export interface MockAppointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status?: VisitStatus;
}

export interface MockPatient {
  id: string;
  name: string;
  birthDate: string;
  gender: "male" | "female";
  ageMonths: number;
  parentName: string;
  parentPhone: string;
  /** 연결 대기(보호자가 아직 수락 안 함) */
  pending?: { invitedDaysAgo: number };
  newRecords: number;
  question?: { date: string; text: string };
  records: MeasurementRecord[];
}

let seq = 0;
function rec(childId: string, taskType: TaskType, recordedAt: number, value: number | null, retryReason?: string): MeasurementRecord {
  const unit = taskType === "ball_play" ? "count" : "seconds";
  const label = { name_response: "호명 후 반응 지연", imitation: "모방까지의 지연", ball_play: "주고받은 횟수" }[taskType];
  const result: AnalysisResult =
    value === null
      ? { status: "retry_needed", retryReason }
      : { status: "success", metric: { value, unit, label } };
  return { id: `r${++seq}`, childId, taskType, recordedAt, result };
}

export const mockAppointments: MockAppointment[] = [
  { id: "a1", patientId: "p3", patientName: "박서연", date: isoDay(0), time: "09:30", status: "done" },
  { id: "a2", patientId: "p1", patientName: "김하온", date: isoDay(0), time: "10:00", status: "unread" },
  { id: "a3", patientId: "p2", patientName: "이준서", date: isoDay(0), time: "14:30", status: "retake" },
  { id: "a4", patientId: "p1", patientName: "김하온", date: isoDay(-10), time: "11:00", status: "done" },
  { id: "a5", patientId: "p2", patientName: "이준서", date: isoDay(-4), time: "10:30", status: "done" },
  { id: "a6", patientId: "p3", patientName: "박서연", date: isoDay(-2), time: "15:00", status: "done" },
  { id: "a7", patientId: "p2", patientName: "이준서", date: isoDay(1), time: "11:00" },
  { id: "a8", patientId: "p3", patientName: "박서연", date: isoDay(7), time: "10:00" },
];

export const mockPatients: MockPatient[] = [
  {
    id: "p1",
    name: "김하온",
    birthDate: "2025-09-04",
    gender: "female",
    ageMonths: 14,
    parentName: "김지수",
    parentPhone: "010-1234-5678",
    newRecords: 3,
    question: { date: isoDay(-8), text: "요즘 블록을 쌓지 않고 자꾸 던지기만 해요.\n이런 행동도 괜찮은 걸까요?" },
    records: [
      rec("p1", "name_response", at(-37, 9), 4.0),
      rec("p1", "imitation", at(-37, 9, 15), 4.7),
      rec("p1", "ball_play", at(-30, 10), 5),
      rec("p1", "name_response", at(-23, 9), 5.8),
      rec("p1", "imitation", at(-23, 9, 20), 3.7),
      rec("p1", "ball_play", at(-23, 9, 45), null, "공이 화면에 충분히 보이지 않았습니다"),
      rec("p1", "name_response", at(-12, 10), 6.0),
      rec("p1", "imitation", at(-12, 10, 20), 2.3),
      rec("p1", "name_response", at(-5, 18), 7.0),
      rec("p1", "ball_play", at(-3, 17, 30), 3),
      rec("p1", "imitation", at(-2, 19), 1.4),
      rec("p1", "name_response", at(0, 8, 12), 8.5),
      rec("p1", "imitation", at(0, 8, 20), 1.6),
    ],
  },
  {
    id: "p2",
    name: "이준서",
    birthDate: "2025-06-10",
    gender: "male",
    ageMonths: 17,
    parentName: "이수진",
    parentPhone: "010-9876-5432",
    newRecords: 1,
    question: { date: isoDay(-3), text: "이름을 불러도 장난감만 볼 때가 많아요." },
    records: [
      rec("p2", "ball_play", at(-27, 11), 2),
      rec("p2", "name_response", at(-27, 11, 20), 1.2),
      rec("p2", "imitation", at(-20, 14), 2.4),
      rec("p2", "ball_play", at(-13, 11), 3),
      rec("p2", "name_response", at(-13, 11, 20), 0.9),
      rec("p2", "imitation", at(-6, 14), 1.8),
      rec("p2", "name_response", at(-6, 14, 20), 1.0),
      rec("p2", "imitation", at(-1, 19, 40), null, "아이 몸이 충분히 보이지 않았습니다"),
    ],
  },
  {
    id: "p3",
    name: "박서연",
    birthDate: "2026-01-20",
    gender: "female",
    ageMonths: 9,
    parentName: "박현주",
    parentPhone: "010-5555-1234",
    newRecords: 0,
    records: [
      rec("p3", "name_response", at(-19, 10), 4.4),
      rec("p3", "name_response", at(-12, 10), 4.1),
      rec("p3", "name_response", at(-5, 10), 4.0),
    ],
  },
  {
    id: "p4",
    name: "최도윤",
    birthDate: "2025-11-02",
    gender: "male",
    ageMonths: 12,
    parentName: "최은영",
    parentPhone: "010-2222-3333",
    pending: { invitedDaysAgo: 2 },
    newRecords: 0,
    records: [],
  },
];

/** 다음(오늘 포함) 진료 */
export function nextAppointment(patientId: string): MockAppointment | undefined {
  const today = isoDay(0);
  return mockAppointments
    .filter((a) => a.patientId === patientId && a.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
}

/** 오늘 이전의 마지막 진료 */
export function lastVisit(patientId: string): MockAppointment | undefined {
  const today = isoDay(0);
  return mockAppointments
    .filter((a) => a.patientId === patientId && a.date < today)
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))[0];
}
