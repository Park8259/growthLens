export interface ChildProfile {
  id: string;
  name: string;
  birthDate: string;         // YYYY-MM-DD
  gender: "male" | "female";
  gestationalWeeks?: number; // undefined = 만삭(40주); <37 = 조산
  region?: string;           // 시/도 (예: "서울")
  siblingOrder?: number;     // 1=첫째, 2=둘째, 3=셋째 이상
  createdAt: number;         // Unix ms
}
