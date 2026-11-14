// 개발용: 영상을 넣으면 Pose 좌표를 추출해 요약을 보여주고, 좌표 JSON을 내려받을 수 있습니다.
import { useState } from "react";
import { extractPoseLandmarks, type PoseTrack } from "../engine/pose";
import { measureStanding, toGrossMotorResult } from "../engine/metrics/grossMotor";

export default function EngineTest() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [track, setTrack] = useState<PoseTrack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  async function run(f: File) {
    setFile(f);
    setTrack(null);
    setError(null);
    setProgress(0);
    const start = Date.now();
    try {
      setTrack(await extractPoseLandmarks(f, { onProgress: setProgress }));
      setElapsed((Date.now() - start) / 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setProgress(null);
    }
  }

  function download() {
    if (!track || !file) return;
    const blob = new Blob([JSON.stringify({ source: file.name, ...track })], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = file.name.replace(/\.[^.]+$/, "") + ".pose.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const detected = track ? track.frames.filter((f) => f.lm).length : 0;
  const standing = track ? measureStanding(track) : null;
  const sec = (n: number) => `${n.toFixed(1)}초`;

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: 640, margin: "40px auto", padding: "0 16px" }}>
      <h1>엔진 테스트 (개발용)</h1>

      <input
        type="file"
        accept="video/*"
        disabled={progress !== null}
        onChange={(e) => e.target.files?.[0] && run(e.target.files[0])}
      />

      {progress !== null && <p>좌표 추출 중… {Math.round(progress * 100)}%</p>}
      {error && <p style={{ color: "crimson" }}>오류: {error}</p>}

      {track && (
        <>
          <table style={{ marginTop: 16, borderCollapse: "collapse" }}>
            <tbody>
              <Row k="영상" v={`${file?.name} (${track.width}×${track.height})`} />
              <Row k="길이" v={`${track.duration.toFixed(2)}초`} />
              <Row k="프레임" v={`${track.frames.length}개 (${track.fps}fps)`} />
              <Row
                k="사람 인식"
                v={`${detected}개 (${Math.round((detected / Math.max(1, track.frames.length)) * 100)}%)`}
              />
              <Row k="처리 시간" v={`${elapsed.toFixed(1)}초`} />
            </tbody>
          </table>
          <button style={{ marginTop: 12 }} onClick={download}>
            좌표 JSON 내려받기
          </button>

          {standing && (
            <>
              <h2>대근육: 독립 서기</h2>
              <table style={{ borderCollapse: "collapse" }}>
                <tbody>
                  <Row k="가장 긴 서기" v={sec(standing.longestSec)} />
                  <Row k="서기 합계" v={sec(standing.totalSec)} />
                  <Row k="판정 가능 시간" v={sec(standing.analyzedSec)} />
                  <Row k="판정 불가 비율" v={`${Math.round(standing.unknownRatio * 100)}%`} />
                  <Row
                    k="서기 구간"
                    v={
                      standing.segments
                        .map((s) => `${s.start.toFixed(1)}~${s.end.toFixed(1)}초`)
                        .join(", ") || "없음"
                    }
                  />
                </tbody>
              </table>
              <p>엔진 결과 (AnalysisResult)</p>
              <pre style={{ background: "#f4f4f4", padding: 12 }}>
                {JSON.stringify(toGrossMotorResult(standing), null, 2)}
              </pre>
            </>
          )}
        </>
      )}
    </main>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <tr>
      <th style={{ textAlign: "left", padding: "4px 16px 4px 0" }}>{k}</th>
      <td>{v}</td>
    </tr>
  );
}
