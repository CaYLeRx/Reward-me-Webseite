import { useEffect, useRef, useState } from "react";

function readTheme() {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function VideoBackground() {
  const [theme, setTheme] = useState(readTheme);
  const videoRef = useRef(null);

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.play().catch(() => undefined);
  }, [theme]);

  const source = `/media/reward-wave-${theme}`;

  return (
    <div className="reward-wave-background" aria-hidden="true">
      <img
        className="reward-wave-poster"
        src={`${source}.jpg`}
        alt=""
        decoding="async"
      />
      <video
        key={theme}
        ref={videoRef}
        className="reward-wave-video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={`${source}.jpg`}
      >
        <source src={`${source}.mp4`} type="video/mp4" />
      </video>
    </div>
  );
}
