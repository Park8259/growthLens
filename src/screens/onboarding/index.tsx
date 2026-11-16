import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChildStore } from "../../store/child";
import { Field, SelectBox, TextBox, PageHeader, BottomButton } from "../../components/FormField";
import {
  GenderSheet,
  BirthDateSheet,
  WeightSheet,
  HeightSheet,
  PrematureSheet,
  WeeksSheet,
  RegionSheet,
  SiblingSheet,
} from "./sheets";
import { SIBLING_LABEL } from "./labels";

// Figma(와이어프레임 페이지) 흐름: 출생 정보("다음") → 우리 아이 정보("완료")

type Sheet =
  | "premature" | "weeks" | "region" | "sibling"
  | "gender" | "birthDate" | "weight" | "height"
  | null;

// 몸무게·키·임신 주수: undefined = 아직 안 고름, null = "잘 모르겠어요"
type Measure = number | null | undefined;

const UNKNOWN = "잘 모르겠어요";

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}

export default function OnboardingScreen() {
  const navigate = useNavigate();
  const setProfile = useChildStore((s) => s.setProfile);

  const [step, setStep] = useState<1 | 2>(1);
  const [sheet, setSheet] = useState<Sheet>(null);

  // 1단계: 출생 정보
  const [premature, setPremature] = useState<boolean | null>(null);
  const [weeks, setWeeks] = useState<Measure>(undefined);
  const [region, setRegion] = useState<{ province: string; district: string } | null>(null);
  const [siblingOrder, setSiblingOrder] = useState<number | null>(null);

  // 2단계: 우리 아이 정보
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [weight, setWeight] = useState<Measure>(undefined);
  const [height, setHeight] = useState<Measure>(undefined);

  const step1Valid =
    premature !== null &&
    (!premature || weeks !== undefined) &&
    region !== null &&
    siblingOrder !== null;

  const step2Valid =
    name.trim() !== "" &&
    gender !== null &&
    birthDate !== "" &&
    weight !== undefined &&
    height !== undefined;

  const close = () => setSheet(null);

  function handleSubmit() {
    if (!step1Valid || !step2Valid || !gender || !region) return;
    setProfile({
      id: crypto.randomUUID(),
      name: name.trim(),
      birthDate,
      gender,
      premature: premature ?? undefined,
      gestationalWeeks: premature && typeof weeks === "number" ? weeks : undefined,
      region: region.province,
      district: region.district,
      siblingOrder: siblingOrder ?? undefined,
      weightKg: weight ?? undefined,
      heightCm: height ?? undefined,
      createdAt: Date.now(),
    });
    navigate("/tasks");
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto font-noto">
      {step === 1 ? (
        <>
          <PageHeader title="출생 정보" onBack={() => navigate(-1)} />
          <div className="flex-1 px-6 pt-6 space-y-[22px]">
            <Field label="조산 여부">
              <SelectBox
                value={premature === null ? "" : premature ? "조산" : "정상 출산"}
                placeholder="선택해주세요"
                active={sheet === "premature"}
                onClick={() => setSheet("premature")}
              />
            </Field>

            {/* 조산을 골랐을 때만 보이는 칸. 시트는 조산을 고르는 순간 자동으로 열려요 */}
            {premature && (
              <Field label="출생 시 임신 주수">
                <SelectBox
                  value={weeks === undefined ? "" : weeks === null ? UNKNOWN : `${weeks}주`}
                  placeholder="주수를 선택해주세요"
                  active={sheet === "weeks"}
                  onClick={() => setSheet("weeks")}
                />
              </Field>
            )}

            <Field label="거주지역">
              <SelectBox
                value={region ? `${region.province} ${region.district}` : ""}
                placeholder="지역을 선택해주세요"
                active={sheet === "region"}
                onClick={() => setSheet("region")}
              />
            </Field>

            <Field label="출생 순서">
              <SelectBox
                value={siblingOrder ? SIBLING_LABEL[siblingOrder] : ""}
                placeholder="선택해주세요"
                active={sheet === "sibling"}
                onClick={() => setSheet("sibling")}
              />
            </Field>
          </div>
          <BottomButton label="다음" disabled={!step1Valid} onClick={() => setStep(2)} />
        </>
      ) : (
        <>
          <PageHeader title="우리 아이 정보" onBack={() => setStep(1)} />
          <div className="flex-1 px-6 pt-6 space-y-[22px]">
            <Field label="이름">
              <TextBox
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력해주세요"
              />
            </Field>

            <Field label="성별">
              <SelectBox
                value={gender === null ? "" : gender === "male" ? "남아" : "여아"}
                placeholder="선택해주세요"
                active={sheet === "gender"}
                onClick={() => setSheet("gender")}
              />
            </Field>

            <Field label="생년월일">
              <SelectBox
                value={birthDate ? formatDate(birthDate) : ""}
                placeholder="날짜를 선택해주세요"
                icon="calendar"
                active={sheet === "birthDate"}
                onClick={() => setSheet("birthDate")}
              />
            </Field>

            <Field label="몸무게">
              <SelectBox
                value={weight === undefined ? "" : weight === null ? UNKNOWN : `${weight.toFixed(1)}kg`}
                placeholder="몸무게를 선택해주세요"
                active={sheet === "weight"}
                onClick={() => setSheet("weight")}
              />
            </Field>

            <Field label="키">
              <SelectBox
                value={height === undefined ? "" : height === null ? UNKNOWN : `${height}cm`}
                placeholder="키를 선택해주세요"
                active={sheet === "height"}
                onClick={() => setSheet("height")}
              />
            </Field>
          </div>
          <BottomButton label="완료" disabled={!step2Valid} onClick={handleSubmit} />
        </>
      )}

      {/* 선택 시트 */}
      {sheet === "premature" && (
        <PrematureSheet
          value={premature}
          onClose={close}
          onSelect={(v) => {
            setPremature(v);
            if (v) {
              // 조산을 고르면 바로 임신 주수 시트를 띄움
              setSheet("weeks");
            } else {
              setWeeks(undefined);
              close();
            }
          }}
        />
      )}
      {sheet === "weeks" && (
        <WeeksSheet value={weeks} onClose={close} onSelect={(v) => { setWeeks(v); close(); }} />
      )}
      {sheet === "region" && (
        <RegionSheet value={region} onClose={close} onSelect={(v) => { setRegion(v); close(); }} />
      )}
      {sheet === "sibling" && (
        <SiblingSheet value={siblingOrder} onClose={close} onSelect={(v) => { setSiblingOrder(v); close(); }} />
      )}
      {sheet === "gender" && (
        <GenderSheet value={gender} onClose={close} onSelect={(v) => { setGender(v); close(); }} />
      )}
      {sheet === "birthDate" && (
        <BirthDateSheet value={birthDate} onClose={close} onSelect={(v) => { setBirthDate(v); close(); }} />
      )}
      {sheet === "weight" && (
        <WeightSheet value={weight} onClose={close} onSelect={(v) => { setWeight(v); close(); }} />
      )}
      {sheet === "height" && (
        <HeightSheet value={height} onClose={close} onSelect={(v) => { setHeight(v); close(); }} />
      )}
    </div>
  );
}
