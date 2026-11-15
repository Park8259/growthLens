export interface ChildProfile {
  id: string;
  name: string;
  birthDate: string;         // YYYY-MM-DD
  gender: "male" | "female";
  gestationalWeeks?: number; // undefined = 만삭(40주) 또는 조산인데 주수 모름; <37 = 조산
  premature?: boolean;       // 조산 여부. 주수를 모르는 조산도 구분하려고 따로 둠
  region?: string;           // 시/도 (예: "서울")
  district?: string;         // 시/군/구 (예: "강남구")
  siblingOrder?: number;     // 1=첫째, 2=둘째, 3=셋째 이상
  weightKg?: number;         // 가장 최근에 잰 몸무게. undefined = 모름
  heightCm?: number;         // 가장 최근에 잰 키. undefined = 모름
  createdAt: number;         // Unix ms
}
