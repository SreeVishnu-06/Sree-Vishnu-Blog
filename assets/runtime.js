// One demand-driven frame scheduler for canvas, pointer springs, scroll, and signals.
export const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
export const finePointer = matchMedia("(pointer: fine)");
export const pointer = { x: 0, y: 0, present: false };
export const viewport = {
  width: innerWidth,
  height: innerHeight,
  scroll: scrollY,
};
let paused = false,
  frame = 0,
  last = 0;
const subscribers = new Set(),
  resizeHandlers = new Set(),
  motionHandlers = new Set();
export const motionEnabled = () => !reducedMotion.matches && !paused;
export function requestFrame() {
  if (!frame && !document.hidden) frame = requestAnimationFrame(tick);
}
function tick(now) {
  frame = 0;
  const dt = Math.min(32, Math.max(1, now - (last || now - 16.67)));
  last = now;
  viewport.scroll = scrollY;
  let keepGoing = false;
  for (const callback of subscribers)
    keepGoing = callback({ now, dt }) || keepGoing;
  if (keepGoing) requestFrame();
}
export function onFrame(callback) {
  subscribers.add(callback);
  requestFrame();
  return () => subscribers.delete(callback);
}
export function onResize(callback) {
  resizeHandlers.add(callback);
  return () => resizeHandlers.delete(callback);
}
export function onMotionChange(callback) {
  motionHandlers.add(callback);
  return () => motionHandlers.delete(callback);
}
export function setMotionPaused(value) {
  paused = value;
  document.body.classList.toggle("motion-paused", value);
  motionHandlers.forEach((fn) => fn());
  resize();
}
export function resize() {
  viewport.width = innerWidth;
  viewport.height = innerHeight;
  viewport.scroll = scrollY;
  resizeHandlers.forEach((fn) => fn());
  requestFrame();
}
addEventListener("scroll", requestFrame, { passive: true });
let resizeFrame;
addEventListener(
  "resize",
  () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(resize);
  },
  { passive: true },
);
addEventListener(
  "pointermove",
  (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.present = event.pointerType !== "touch";
    requestFrame();
  },
  { passive: true },
);
document.documentElement.addEventListener("pointerleave", () => {
  pointer.present = false;
  requestFrame();
});
function motionChange() {
  motionHandlers.forEach((fn) => fn());
  resize();
}
reducedMotion.addEventListener("change", motionChange);
finePointer.addEventListener("change", motionChange);
document.addEventListener("visibilitychange", () => {
  last = 0;
  if (document.hidden) {
    cancelAnimationFrame(frame);
    frame = 0;
  } else requestFrame();
});
addEventListener("pagehide", () => {
  cancelAnimationFrame(frame);
  frame = 0;
});
addEventListener("pageshow", () => {
  last = 0;
  requestFrame();
});
export const clamp = (value, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));
