import { useEffect, useRef } from "react";

const LIGHT_PALETTE = [
  [0, 0, 0],
  [11, 26, 18],
  [39, 62, 47],
];

const DARK_PALETTE = [
  [231, 235, 232],
  [117, 203, 157],
  [230, 214, 168],
];

function drawAmbientGlow(context, x, y, radius, color) {
  const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = gradient;
  context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

export function Wavefield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let columns = 0;
    let rows = 0;
    let pointerX = 0;
    let pointerY = 0;
    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let frameId = 0;
    let active = true;

    const draw = (time, force = false) => {
      if (!active) return;

      pointerX += (pointerTargetX - pointerX) * 0.035;
      pointerY += (pointerTargetY - pointerY) * 0.035;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);

      const dark = document.documentElement.dataset.theme === "dark";
      const palette = dark ? DARK_PALETTE : LIGHT_PALETTE;
      const phase = reducedMotion.matches ? 0 : time * 0.00012;
      const maxDimension = Math.max(width, height);

      context.globalCompositeOperation = dark ? "lighter" : "source-over";
      drawAmbientGlow(
        context,
        width * (0.72 + pointerX * 0.03),
        height * 0.18,
        maxDimension * 0.58,
        dark ? "rgba(54, 184, 125, 0.09)" : "rgba(0, 0, 0, 0.035)",
      );
      drawAmbientGlow(
        context,
        width * (0.25 - pointerX * 0.018),
        height * 0.86,
        maxDimension * 0.42,
        dark ? "rgba(230, 214, 168, 0.04)" : "rgba(5, 18, 11, 0.025)",
      );

      for (let row = 0; row < rows; row += 1) {
        const v = row / (rows - 1);
        const frontness = 0.22 + v * 0.98;

        for (let column = 0; column < columns; column += 1) {
          const u = column / (columns - 1);
          const centeredX = u - 0.5;
          const centeredY = v - 0.48;
          const ripple =
            Math.sin((u * 7.8 + v * 1.4 + phase) * Math.PI) * 0.075 +
            Math.cos((v * 7.1 - u * 0.72 - phase * 0.7) * Math.PI) * 0.065 +
            Math.sin(Math.hypot(centeredX * 1.45, centeredY) * 18 - phase * 2.2) * 0.038;
          const crest =
            Math.exp(-((centeredX + 0.13) ** 2 * 8 + (centeredY - 0.04) ** 2 * 20)) * 0.17 -
            Math.exp(-((centeredX - 0.32) ** 2 * 15 + (centeredY + 0.17) ** 2 * 16)) * 0.1;
          const depth = Math.max(0.34, frontness + ripple + crest);
          const perspective = 0.56 + v * 0.94;
          const x =
            width * 0.5 +
            centeredX * width * 1.44 * perspective +
            pointerX * (18 + v * 28);
          const y =
            height * 0.08 +
            v * height * 1.06 -
            (ripple + crest) * height * (0.5 + v * 0.56) +
            pointerY * (10 + v * 18);

          if (x < -5 || x > width + 5 || y < -5 || y > height + 5) continue;

          const centreFade = Math.max(0, 1 - Math.abs(centeredX) * 1.34);
          const opacity = (0.12 + depth * 0.52) * centreFade * (dark ? 0.95 : 0.78);
          const size = Math.max(0.42, 0.35 + v * 0.96 + (ripple + crest) * 0.45);
          const accent = (Math.sin(u * 30 + v * 12) + 1) * 0.5;
          const colorIndex = dark && accent > 0.9 ? 1 : dark && accent < 0.08 ? 2 : 0;
          const [red, green, blue] = palette[colorIndex];

          context.beginPath();
          context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
          context.arc(x, y, size, 0, Math.PI * 2);
          context.fill();
        }
      }

      context.globalCompositeOperation = "source-over";
      if (!reducedMotion.matches && !force) frameId = requestAnimationFrame(draw);
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, width < 640 ? 1.2 : 1.5);
      columns = width < 640 ? 68 : width < 1024 ? 100 : 138;
      rows = width < 640 ? 76 : width < 1024 ? 92 : 118;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      draw(performance.now(), true);
    };

    const onPointerMove = (event) => {
      if (!finePointer.matches) return;
      pointerTargetX = event.clientX / Math.max(width, 1) - 0.5;
      pointerTargetY = event.clientY / Math.max(height, 1) - 0.5;
    };

    const onVisibilityChange = () => {
      active = !document.hidden;
      cancelAnimationFrame(frameId);
      if (active && !reducedMotion.matches) frameId = requestAnimationFrame(draw);
    };

    const requestStaticDraw = () => {
      if (reducedMotion.matches) draw(performance.now(), true);
    };

    const onMotionPreferenceChange = () => {
      cancelAnimationFrame(frameId);
      resize();
      if (!reducedMotion.matches) frameId = requestAnimationFrame(draw);
    };

    const themeObserver = new MutationObserver(requestStaticDraw);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    reducedMotion.addEventListener("change", onMotionPreferenceChange);
    if (!reducedMotion.matches) frameId = requestAnimationFrame(draw);

    return () => {
      active = false;
      cancelAnimationFrame(frameId);
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reducedMotion.removeEventListener("change", onMotionPreferenceChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="reward-wavefield" aria-hidden="true" />;
}
