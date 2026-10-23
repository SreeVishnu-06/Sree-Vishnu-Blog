import {
  onFrame,
  onMotionChange,
  onResize,
  requestFrame,
  motionEnabled,
  finePointer,
  pointer,
  viewport,
  clamp,
} from "./runtime.js";
export function initMotion() {
  const aura = document.querySelector("[data-cursor]"),
    label = aura.querySelector("span"),
    dot = aura.querySelector("i");
  let x = 0,
    y = 0,
    initialized = false,
    activeMagnet = null,
    activeCard = null;
  const magnets = [...document.querySelectorAll("[data-magnetic]")].map(
    (element) => ({ element, x: 0, y: 0, vx: 0, vy: 0, rect: null }),
  );
  const cards = [...document.querySelectorAll(".concept")].map((element) => ({
    element,
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    rect: null,
  }));
  magnets.forEach((item) => {
    item.element.addEventListener("pointerenter", () => {
      item.rect = item.element.getBoundingClientRect();
      activeMagnet = item;
      requestFrame();
    });
    item.element.addEventListener("pointerleave", () => {
      if (activeMagnet === item) activeMagnet = null;
      requestFrame();
    });
  });
  cards.forEach((item) => {
    item.element.addEventListener("pointerenter", () => {
      item.rect = item.element.getBoundingClientRect();
      activeCard = item;
      requestFrame();
    });
    item.element.addEventListener("pointerleave", () => {
      if (activeCard === item) activeCard = null;
      requestFrame();
    });
  });
  document.addEventListener(
    "pointerover",
    (event) => {
      const hovered = event.target.closest("a,button,summary,[data-cursor-label]");
      const custom = event.target.closest("[data-cursor-label]");
      label.textContent = custom?.dataset.cursorLabel || "";
      aura.classList.toggle("over-control", !!hovered);
      requestFrame();
    },
    { passive: true },
  );
  const reset = () => {
    activeMagnet = null;
    activeCard = null;
    magnets.forEach((item) => {
      item.x = item.y = item.vx = item.vy = 0;
      item.element.style.removeProperty("transform");
    });
    cards.forEach((item) => {
      item.x = item.y = 0;
      item.element.style.removeProperty("transform");
    });
    aura.style.opacity = "0";
    initialized = false;
  };
  onMotionChange(reset);
  onResize(reset);
  onFrame(({ dt }) => {
    if (!motionEnabled() || !finePointer.matches) {
      if (initialized) reset();
      return false;
    }
    let moving = false;
    const step = dt / 16.67;
    if (pointer.present) {
      if (!initialized) {
        x = pointer.x;
        y = pointer.y;
        initialized = true;
      }
      x += (pointer.x - x) * Math.min(0.4, 0.16 * step);
      y += (pointer.y - y) * Math.min(0.4, 0.16 * step);
      aura.style.opacity = "1";
      aura.style.transform = `translate3d(${x}px,${y}px,0)`;
      dot.style.transform = `translate(${pointer.x - x}px,${pointer.y - y}px)`;
      moving = Math.abs(pointer.x - x) + Math.abs(pointer.y - y) > 0.2;
    } else aura.style.opacity = "0";
    magnets.forEach((item) => {
      let tx = 0,
        ty = 0;
      if (activeMagnet === item && pointer.present && item.rect) {
        tx =
          clamp(
            (pointer.x - item.rect.left) / item.rect.width - 0.5,
            -0.5,
            0.5,
          ) * 14;
        ty =
          clamp(
            (pointer.y - item.rect.top) / item.rect.height - 0.5,
            -0.5,
            0.5,
          ) * 10;
      }
      item.vx = (item.vx + (tx - item.x) * 0.18 * step) * Math.pow(0.68, step);
      item.vy = (item.vy + (ty - item.y) * 0.18 * step) * Math.pow(0.68, step);
      item.x += item.vx * step;
      item.y += item.vy * step;
      if (
        Math.abs(item.x) + Math.abs(item.y) + Math.abs(tx) + Math.abs(ty) >
        0.02
      )
        item.element.style.transform = `translate3d(${item.x}px,${item.y}px,0)`;
      else item.element.style.removeProperty("transform");
      moving =
        moving ||
        Math.abs(tx - item.x) +
          Math.abs(ty - item.y) +
          Math.abs(item.vx) +
          Math.abs(item.vy) >
          0.03;
    });
    cards.forEach((item) => {
      let tx = 0,
        ty = 0;
      if (
        item === activeCard &&
        pointer.present &&
        item.rect &&
        !document.querySelector(".dragging")
      ) {
        tx =
          clamp(
            (pointer.x - item.rect.left) / item.rect.width - 0.5,
            -0.5,
            0.5,
          ) * 3;
        ty =
          clamp(
            (pointer.y - item.rect.top) / item.rect.height - 0.5,
            -0.5,
            0.5,
          ) * -3;
        item.element.style.setProperty(
          "--card-x",
          `${((pointer.x - item.rect.left) / item.rect.width) * 100}%`,
        );
        item.element.style.setProperty(
          "--card-y",
          `${((pointer.y - item.rect.top) / item.rect.height) * 100}%`,
        );
      }
      item.x += (tx - item.x) * 0.13;
      item.y += (ty - item.y) * 0.13;
      if (Math.abs(item.x) + Math.abs(item.y) > 0.02)
        item.element.style.transform = `perspective(1200px) rotateX(${item.y}deg) rotateY(${item.x}deg)`;
      else item.element.style.removeProperty("transform");
      moving = moving || Math.abs(tx - item.x) + Math.abs(ty - item.y) > 0.02;
    });
    return moving;
  });
  const animations = new Set();
  function animate(element, keyframes, options) {
    if (!motionEnabled()) return;
    const animation = element.animate(keyframes, {
      duration: 750,
      easing: "cubic-bezier(.16,1,.3,1)",
      ...options,
    });
    animations.add(animation);
    animation.finished
      .then(() => animations.delete(animation))
      .catch(() => animations.delete(animation));
  }
  document
    .querySelectorAll(".name-mask>span")
    .forEach((element, i) =>
      animate(
        element,
        [{ transform: "translateY(115%)" }, { transform: "translateY(0)" }],
        { duration: 1000, delay: 90 + i * 110 },
      ),
    );
  document.querySelectorAll(".hero-enter").forEach((element, i) =>
    animate(
      element,
      [
        { opacity: 0, transform: "translateY(16px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { delay: 150 + i * 110 },
    ),
  );
  animate(
    document.querySelector(".core-scene"),
    [
      { opacity: 0, transform: "scale(.88)" },
      { opacity: 1, transform: "scale(1)" },
    ],
    { duration: 1300, delay: 100 },
  );
  const sweep = document.createElement("div");
  sweep.className = "hero-sweep";
  sweep.setAttribute("aria-hidden", "true");
  document.querySelector(".hero").append(sweep);
  animate(sweep, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
    duration: 1400,
  });
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const children = [...entry.target.children];
        children.forEach((element, i) =>
          animate(
            element,
            [
              {
                opacity: 0.2,
                transform: `translateY(${element.tagName === "H2" ? 30 : 18}px)`,
              },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { delay: i * 65, duration: 850 },
          ),
        );
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14 },
  );
  document
    .querySelectorAll("[data-reveal]")
    .forEach((element) => observer.observe(element));
  onMotionChange(() => {
    if (!motionEnabled()) animations.forEach((animation) => animation.cancel());
  });
  document.addEventListener("visibilitychange", () => {
    animations.forEach((animation) =>
      document.hidden ? animation.pause() : animation.play(),
    );
  });
  // Scroll parallax changes only transforms and is intentionally modest.
  let contactTop = 0;
  const contact = document.querySelector(".contact-graphic");
  const measure = () => {
    contactTop = document.querySelector("#contact").offsetTop;
  };
  onResize(measure);
  measure();
  onFrame(() => {
    contact.style.transform = motionEnabled()
      ? `translateY(${clamp((viewport.scroll - contactTop + viewport.height) / viewport.height, -1, 1) * -22}px)`
      : "";
    return false;
  });
}
