import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

let currentActiveWave = null;

export default function WaveformPlayer({ audioUrl }) {
  const containerRef = useRef(null);
  const waveRef = useRef(null);

  useEffect(() => {
    if (!audioUrl || !containerRef.current) return;

    const container = containerRef.current;

    // Destroy existing waveform safely
    const destroyWave = async () => {
      try {
        if (waveRef.current) {
          await waveRef.current.destroy();
          waveRef.current = null;
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error destroying WaveSurfer:", err);
        }
      }
    };

    // Immediately destroy before creating new
    destroyWave();

    const wave = WaveSurfer.create({
      container,
      waveColor: "#FFD70088",
      progressColor: "#FFD700",
      height: 60,
      barWidth: 2,
      responsive: true,
      cursorWidth: 1,
      interact: true,
    });

    waveRef.current = wave;

    wave.on("play", () => {
      if (currentActiveWave && currentActiveWave !== wave) {
        currentActiveWave.pause();
      }
      currentActiveWave = wave;
    });

    // Load audio and catch any issues
    wave.load(audioUrl).catch((err) => {
      if (err.name !== "AbortError") {
        console.error("WaveSurfer load error:", err);
      }
    });

    return () => {
      // On unmount or re-render, clean up
      destroyWave();

      if (currentActiveWave === wave) {
        currentActiveWave = null;
      }
    };
  }, [audioUrl]);

  const togglePlay = () => {
    waveRef.current?.playPause();
  };

  return (
    <div>
      <div ref={containerRef} className="mb-2" />
      <button
        onClick={togglePlay}
        className="bg-adinkra-highlight text-adinkra-bg font-semibold py-1 px-3 rounded text-sm hover:bg-yellow-500 transition"
      >
        ▶ Play / Pause
      </button>
    </div>
  );
}
