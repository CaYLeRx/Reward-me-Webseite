import { useEffect, useRef } from "react";

const LIGHT_PALETTE = [
  [11, 82, 56],
  [67, 101, 81],
  [158, 126, 46],
];

const DARK_PALETTE = [
  [59, 227, 140],
  [230, 214, 168],
  [245, 239, 226],
];

function createRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function createStars(count) {
  const random = createRandom(24041996);
  return Array.from({ length: count }, () => ({
    x: random() * 1.9 - 0.95,
    y: random() * 1.7 - 0.85,
    z: random(),
    size: 0.55 + random() * 1.45,
    alpha: 0.25 + random() * 0.62,
    speed: 0.55 + random() * 1.1,
    color: Math.floor(random() * 3),
    sparkle: random(),
    drift: random() * Math.PI * 2,
  }));
}

export function Starfield() {
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
    let stars = [];
    let scrollY = window.scrollY;
    let pointerX = 0;
    let pointerY = 0;
    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let frameId = 0;
    let lastFrame = 0;
    let active = true;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, width < 640 ? 1.2 : 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      stars = createStars(width < 640 ? 96 : width < 1024 ? 150 : 220);
      draw(performance.now(), true);
    };

    const drawGlow = (x, y, radius, color) => {
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = gradient;
      context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    };

    const draw = (time, force = false) => {
      if (!active) return;
      if (!force && time - lastFrame < 32) {
        frameId = requestAnimationFrame(draw);
        return;
      }
      lastFrame = time;

      pointerX += (pointerTargetX - pointerX) * 0.045;
      pointerY += (pointerTargetY - pointerY) * 0.045;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);

      const dark = document.documentElement.dataset.theme === "dark";
      const palette = dark ? DARK_PALETTE : LIGHT_PALETTE;
      const motion = reducedMotion.matches ? 0 : time * 0.000012;
      const scrollDepth = scrollY * 0.00017;

      context.globalCompositeOperation = dark ? "lighter" : "source-over";
      drawGlow(
        width * (0.76 + pointerX * 0.018),
        height * (0.2 + pointerY * 0.016),
        Math.max(width, height) * 0.56,
        dark ? "rgba(31, 163, 111, 0.075)" : "rgba(31, 163, 111, 0.055)",
      );
      drawGlow(
        width * (0.18 - pointerX * 0.012),
        height * (0.78 - pointerY * 0.014),
        Math.max(width, height) * 0.42,
        dark ? "rgba(230, 214, 168, 0.035)" : "rgba(230, 214, 168, 0.045)",
      );

      for (const star of stars) {
        const z = ((star.z - scrollDepth * star.speed + motion * star.speed) % 1 + 1) % 1;
        const depth = 0.34 + z * 1.16;
        const perspective = 1 / depth;
        const driftX = Math.sin(star.drift + time * 0.00008) * 3 * (1 - z);
        const driftY = Math.cos(star.drift + time * 0.00006) * 2 * (1 - z);
        const x =
          width * 0.5 +
          star.x * width * 0.58 * perspective +
          pointerX * 22 * (1 - z) +
          driftX;
        const y =
          height * 0.5 +
          star.y * height * 0.62 * perspective +
          pointerY * 16 * (1 - z) +
          driftY;

        if (x < -12 || x > width + 12 || y < -12 || y > height + 12) continue;

        const size = star.size * (0.48 + perspective * 0.72);
        const depthOpacity = 0.18 + (1 - z) * 0.82;
        const alpha = star.alpha * depthOpacity * (dark ? 0.86 : 0.53);
        const [red, green, blue] = palette[star.color];

        context.beginPath();
        context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
        context.arc(x, y, Math.max(0.45, size), 0, Math.PI * 2);
        context.fill();

        if (star.sparkle > 0.9 && size > 1.25) {
          const ray = size * (2.5 + (1 - z) * 1.6);
          context.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${alpha * 0.42})`;
          context.lineWidth = Math.max(0.35, size * 0.22);
          context.beginPath();
          context.moveTo(x - ray, y);
          context.lineTo(x + ray, y);
          context.moveTo(x, y - ray);
          context.lineTo(x, y + ray);
          context.stroke();
        }
      }

      context.globalCompositeOperation = "source-over";
      if (!reducedMotion.matches && !force) frameId = requestAnimationFrame(draw);
    };

    const requestStaticDraw = () => {
      if (reducedMotion.matches) draw(performance.now(), true);
    };

    const onScroll = () => {
      scrollY = window.scrollY;
      requestStaticDraw();
    };

    const onPointerMove = (event) => {
      if (!finePointer.matches) return;
      pointerTargetX = event.clientX / Math.max(width, 1) - 0.5;
      pointerTargetY = event.clientY / Math.max(height, 1) - 0.5;
    };

    const onVisibilityChange = () => {
      active = !document.hidden;
      cancelAnimationFrame(frameId);
      if (active) frameId = requestAnimationFrame(draw);
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
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    reducedMotion.addEventListener("change", onMotionPreferenceChange);

    if (!reducedMotion.matches) frameId = requestAnimationFrame(draw);

    return () => {
      active = false;
      cancelAnimationFrame(frameId);
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reducedMotion.removeEventListener("change", onMotionPreferenceChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="reward-starfield" aria-hidden="true" />;
}
