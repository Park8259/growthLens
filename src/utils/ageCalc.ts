const MS_PER_MONTH = (365.25 / 12) * 24 * 60 * 60 * 1000;

/** 교정 월령 계산. gestationalWeeks < 37이면 조산 보정 적용. */
export function correctedAgeMonths(
  birthDate: string,
  gestationalWeeks?: number
): number {
  const birth = new Date(birthDate);
  const today = new Date();
  const rawMonths = Math.floor((today.getTime() - birth.getTime()) / MS_PER_MONTH);

  if (gestationalWeeks !== undefined && gestationalWeeks < 37) {
    const correctionMonths = Math.floor((40 - gestationalWeeks) / 4.33);
    return Math.max(0, rawMonths - correctionMonths);
  }

  return rawMonths;
}
