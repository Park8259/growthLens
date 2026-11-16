// 녹화된 영상(Blob)을 일정 간격으로 넘기며 프레임을 읽는 공용 도구
// Pose·Hands·Face가 함께 사용합니다. (브라우저 전용)
//
// 영상을 재생하지 않고 currentTime을 옮겨 가며 읽기 때문에,
// PC 성능과 관계없이 항상 같은 간격으로 프레임을 얻습니다.

export interface VideoInfo {
  width: number; // 가로 픽셀
  height: number; // 세로 픽셀
  duration: number; // 길이(초)
}

/** 이벤트 한 번 기다리기. 영상 오류가 나면 실패 */
function once(video: HTMLVideoElement, event: keyof HTMLMediaElementEventMap) {
  return new Promise<void>((resolve, reject) => {
    const ok = () => {
      video.removeEventListener("error", fail);
      resolve();
    };
    const fail = () => {
      video.removeEventListener(event, ok);
      // 원인 구분용: 어느 단계(event)에서, 어떤 오류 코드로 실패했는지 붙임
      // 코드 1=중단, 2=네트워크, 3=디코딩 실패, 4=형식 미지원
      const err = video.error;
      reject(new Error(`영상을 읽지 못했어요 (${event}, 코드 ${err?.code ?? "?"}${err?.message ? `: ${err.message}` : ""})`));
    };
    video.addEventListener(event, ok, { once: true });
    video.addEventListener("error", fail, { once: true });
  });
}

/** 영상 길이 구하기.
 *  MediaRecorder로 녹화한 webm은 처음에 길이가 Infinity로 나와서,
 *  맨 끝으로 한 번 이동해야 실제 길이를 알 수 있습니다. */
async function resolveDuration(video: HTMLVideoElement): Promise<number> {
  if (Number.isFinite(video.duration)) return video.duration;
  video.currentTime = Number.MAX_SAFE_INTEGER;
  await once(video, "seeked");
  const duration = video.duration;
  video.currentTime = 0;
  await once(video, "seeked");
  return Number.isFinite(duration) ? duration : 0;
}

/**
 * 영상을 fps 간격으로 넘기며 매 프레임 onFrame을 호출합니다.
 * onFrame에는 현재 프레임이 그려진 video 요소와 영상 안 시각(초)이 전달됩니다.
 */
export async function forEachVideoFrame(
  videoBlob: Blob,
  fps: number,
  onFrame: (video: HTMLVideoElement, t: number) => void,
  onProgress?: (ratio: number) => void
): Promise<VideoInfo> {
  if (videoBlob.size === 0) throw new Error("녹화된 영상이 비어 있어요");
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  const url = URL.createObjectURL(videoBlob);
  try {
    video.src = url;
    await once(video, "loadeddata");
    const duration = await resolveDuration(video);

    const step = 1 / fps;
    for (let i = 0; i * step < duration; i++) {
      video.currentTime = i * step;
      await once(video, "seeked");
      onFrame(video, video.currentTime);
      onProgress?.(Math.min(1, (i * step) / duration));
    }
    onProgress?.(1);

    return { width: video.videoWidth, height: video.videoHeight, duration };
  } finally {
    URL.revokeObjectURL(url);
    video.removeAttribute("src");
    video.load();
  }
}
