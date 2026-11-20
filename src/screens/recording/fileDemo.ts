// 데모용: 촬영 대신 영상 파일을 골라 분석할 때 쓰는 도구
// (발표 영상에서 AI로 만든 아기 영상을 앱에 넣어 보여주기 위함)

/**
 * 영상 속 소리에서 "이름을 부른 순간"(처음으로 소리가 크게 커지는 시점)을 찾아요. 단위는 ms.
 * 앱 촬영에서는 신호음 시각을 쓰지만, 파일에는 신호음이 없어서 소리로 대신해요.
 * 소리가 없거나 찾지 못하면 null.
 */
export async function detectCallTime(file: Blob): Promise<number | null> {
  try {
    const buf = await file.arrayBuffer();
    const ctx = new OfflineAudioContext(1, 44100, 44100);
    const audio = await ctx.decodeAudioData(buf);
    const data = audio.getChannelData(0);
    const win = Math.floor(audio.sampleRate * 0.05); // 0.05초 단위
    const rms: number[] = [];
    for (let i = 0; i + win <= data.length; i += win) {
      let s = 0;
      for (let j = i; j < i + win; j++) s += data[j] * data[j];
      rms.push(Math.sqrt(s / win));
    }
    if (rms.length === 0) return null;
    const sorted = [...rms].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    // 평소 소리보다 5배 이상, 그리고 아주 작은 잡음은 무시
    const threshold = Math.max(0.05, median * 5);
    // 맨 앞 0.5초는 영상 시작 잡음일 수 있어서 건너뜀
    const start = Math.ceil(0.5 / 0.05);
    for (let i = start; i < rms.length; i++) {
      if (rms[i] >= threshold) return Math.round(i * 50);
    }
    return null;
  } catch {
    return null;
  }
}
