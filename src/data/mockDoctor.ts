import type { MeasurementRecord } from "../storage/records";

export const mockDoctor = {
  name: "김민준",
  specialty: "소아청소년과",
  hospital: "서울어린이발달센터",
};

export interface MockAppointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
}

export interface MockPatient {
  id: string;
  name: string;
  birthDate: string;
  gender: "male" | "female";
  ageMonths: number;
  parentName: string;
  parentPhone: string;
  lastRecordedAt: string | null;
  recordCount: number;
  records: MeasurementRecord[];
  appointments: MockAppointment[];
}

export const mockAppointments: MockAppointment[] = [
  { id: "a1", patientId: "p1", patientName: "김하온", date: "2026-11-20", time: "10:00" },
  { id: "a2", patientId: "p2", patientName: "이준서", date: "2026-11-21", time: "14:30" },
  { id: "a3", patientId: "p1", patientName: "김하온", date: "2026-11-10", time: "11:00" },
  { id: "a4", patientId: "p3", patientName: "박서연", date: "2026-11-07", time: "10:00" },
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
    lastRecordedAt: "2026-11-11",
    recordCount: 13,
    appointments: mockAppointments.filter((a) => a.patientId === "p1"),
    records: [
      { id: "r1",  childId: "p1", taskType: "social",      recordedAt: new Date("2026-11-11T09:00:00").getTime(), result: { status: "success", metric: { value: 1.4, unit: "seconds", label: "이름 부르면 돌아보기" } } },
      { id: "r2",  childId: "p1", taskType: "gross_motor", recordedAt: new Date("2026-11-11T09:15:00").getTime(), result: { status: "success", metric: { value: 8.5, unit: "seconds", label: "혼자 서 있기" } } },
      { id: "r3",  childId: "p1", taskType: "social",      recordedAt: new Date("2026-11-04T10:00:00").getTime(), result: { status: "success", metric: { value: 1.6, unit: "seconds", label: "이름 부르면 돌아보기" } } },
      { id: "r4",  childId: "p1", taskType: "fine_motor",  recordedAt: new Date("2026-11-04T10:20:00").getTime(), result: { status: "success", metric: { value: 3,   unit: "count",   label: "블록 쌓기 성공 횟수" } } },
      { id: "r5",  childId: "p1", taskType: "fine_motor",  recordedAt: new Date("2026-10-28T09:45:00").getTime(), result: { status: "retry_needed", retryReason: "손이 가려져 분석할 수 없었어요" } },
      { id: "r6",  childId: "p1", taskType: "gross_motor", recordedAt: new Date("2026-10-28T09:00:00").getTime(), result: { status: "success", metric: { value: 6.0, unit: "seconds", label: "혼자 서 있기" } } },
      { id: "r7",  childId: "p1", taskType: "social",      recordedAt: new Date("2026-10-28T09:30:00").getTime(), result: { status: "success", metric: { value: 2.3, unit: "seconds", label: "이름 부르면 돌아보기" } } },
      { id: "r8",  childId: "p1", taskType: "gross_motor", recordedAt: new Date("2026-10-14T09:00:00").getTime(), result: { status: "success", metric: { value: 3.8, unit: "seconds", label: "혼자 서 있기" } } },
      { id: "r9",  childId: "p1", taskType: "fine_motor",  recordedAt: new Date("2026-10-14T09:20:00").getTime(), result: { status: "success", metric: { value: 5,   unit: "count",   label: "블록 쌓기 성공 횟수" } } },
      { id: "r10", childId: "p1", taskType: "social",      recordedAt: new Date("2026-10-14T09:40:00").getTime(), result: { status: "success", metric: { value: 2.1, unit: "seconds", label: "이름 부르면 돌아보기" } } },
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
    lastRecordedAt: "2026-11-12",
    recordCount: 8,
    appointments: mockAppointments.filter((a) => a.patientId === "p2"),
    records: [
      { id: "r11", childId: "p2", taskType: "gross_motor", recordedAt: new Date("2026-11-12T14:00:00").getTime(), result: { status: "success", metric: { value: 11.0, unit: "seconds", label: "혼자 서 있기" } } },
      { id: "r12", childId: "p2", taskType: "social",      recordedAt: new Date("2026-11-05T10:00:00").getTime(), result: { status: "success", metric: { value: 0.9,  unit: "seconds", label: "이름 부르면 돌아보기" } } },
      { id: "r13", childId: "p2", taskType: "fine_motor",  recordedAt: new Date("2026-10-29T11:00:00").getTime(), result: { status: "success", metric: { value: 2,    unit: "count",   label: "블록 쌓기 성공 횟수" } } },
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
    lastRecordedAt: "2026-11-10",
    recordCount: 3,
    appointments: mockAppointments.filter((a) => a.patientId === "p3"),
    records: [
      { id: "r14", childId: "p3", taskType: "gross_motor", recordedAt: new Date("2026-11-10T10:00:00").getTime(), result: { status: "success", metric: { value: 4.0, unit: "seconds", label: "혼자 서 있기" } } },
    ],
  },
];
