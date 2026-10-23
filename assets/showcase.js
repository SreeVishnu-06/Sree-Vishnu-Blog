import {
  onFrame,
  onResize,
  onMotionChange,
  requestFrame,
  viewport,
  motionEnabled,
  finePointer,
  clamp,
} from "./runtime.js";
export function initShowcase() {
  const section = document.querySelector("#systems"),
    sticky = section.querySelector(".showcase-sticky"),
    rail = section.querySelector(".showcase-rail"),
    track = section.querySelector(".showcase-track"),
    cards = [...section.querySelectorAll(".concept")],
    dots = [...section.querySelectorAll("[data-slide-to]")],
    previous = document.querySelector("#slide-prev"),
    next = document.querySelector("#slide-next"),
    status = document.querySelector("#slide-status");
  let pinned = false,
    travel = 0,
    step = 0,
    start = 0,
    offset = 0,
    index = 0,
    drag = null,
    suppressClick = false;
  [previous, next, ...dots].forEach((button) => (button.disabled = false));
  function setIndex(value) {
    index = clamp(Math.round(value), 0, cards.length - 1);
    dots.forEach((dot, i) =>
      dot.setAttribute("aria-pressed", String(i === index)),
    );
    previous.disabled = index === 0;
    next.disabled = index === cards.length - 1;
    const text = `${String(index + 1).padStart(2, "0")} / 06`;
    if (status.textContent !== text) status.textContent = text;
  }
  function measure() {
    const old = pinned;
    const textSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    pinned =
      viewport.width >= 1024 &&
      viewport.height >= 720 &&
      textSize < 22 &&
      motionEnabled() &&
      finePointer.matches;
    section.classList.toggle("is-pinned", pinned);
    section.style.height = "";
    track.style.transform = "";
    step = cards[0].offsetWidth + 22;
    travel = Math.max(0, track.scrollWidth - rail.clientWidth);
    start =
      section.getBoundingClientRect().top +
      scrollY -
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--header"),
      );
    if (pinned) {
      section.style.height = `${viewport.height - parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header")) + travel}px`;
      rail.scrollLeft = 0;
    } else if (old) {
      rail.scrollLeft = Math.min(index * step, travel);
    }
    requestFrame();
  }
  function goTo(value, behavior = "smooth") {
    const target = clamp(value, 0, cards.length - 1);
    const position = Math.min(target * step, travel);
    if (pinned)
      window.scrollTo({
        top: start + position,
        behavior: motionEnabled() ? behavior : "instant",
      });
    else
      rail.scrollTo({
        left: position,
        behavior: motionEnabled() ? behavior : "instant",
      });
    requestFrame();
  }
  previous.addEventListener("click", () => goTo(index - 1));
  next.addEventListener("click", () => goTo(index + 1));
  dots.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));
  rail.addEventListener("keydown", (event) => {
    if (event.target !== rail && !event.target.matches("[data-open-concept]"))
      return;
    let target;
    if (event.key === "ArrowRight") target = index + 1;
    if (event.key === "ArrowLeft") target = index - 1;
    if (event.key === "Home") target = 0;
    if (event.key === "End") target = cards.length - 1;
    if (target === undefined) return;
    event.preventDefault();
    goTo(target);
  });
  rail.addEventListener("focusin", (event) => {
    const card = event.target.closest(".concept");
    if (!card) return;
    const i = cards.indexOf(card);
    const position = i * step;
    if (
      position < offset ||
      position + card.offsetWidth > offset + rail.clientWidth
    )
      goTo(i, "instant");
  });
  rail.addEventListener(
    "scroll",
    () => {
      if (!pinned) {
        offset = rail.scrollLeft;
        setIndex(offset >= travel - 3 ? 5 : offset / step);
      }
      requestFrame();
    },
    { passive: true },
  );
  rail.addEventListener("pointerdown", (event) => {
    if (
      event.button !== 0 ||
      event.target.closest("a,button,summary") ||
      (event.pointerType === "touch" && !pinned)
    )
      return;
    drag = {
      id: event.pointerId,
      start: event.clientX,
      offset: pinned ? offset : rail.scrollLeft,
      moved: false,
    };
    rail.setPointerCapture(event.pointerId);
  });
  rail.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const delta = drag.start - event.clientX;
    if (Math.abs(delta) > 7) {
      drag.moved = true;
      rail.classList.add("dragging");
    }
    if (!drag.moved) return;
    const target = clamp(drag.offset + delta, 0, travel);
    if (pinned) window.scrollTo({ top: start + target, behavior: "instant" });
    else {
      rail.style.scrollSnapType = "none";
      rail.scrollLeft = target;
    }
    requestFrame();
  });
  function finishDrag() {
    if (!drag) return;
    const moved = drag.moved;
    drag = null;
    rail.classList.remove("dragging");
    rail.style.scrollSnapType = "";
    if (moved) {
      suppressClick = true;
      setTimeout(() => (suppressClick = false), 0);
      goTo(Math.round(offset / step));
    }
  }
  rail.addEventListener("pointerup", finishDrag);
  rail.addEventListener("pointercancel", finishDrag);
  rail.addEventListener("lostpointercapture", finishDrag);
  rail.addEventListener(
    "click",
    (event) => {
      if (suppressClick) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    { capture: true },
  );
  onResize(measure);
  onMotionChange(measure);
  measure();
  onFrame(() => {
    if (pinned) {
      offset = clamp(viewport.scroll - start, 0, travel);
      track.style.transform = `translate3d(${-offset}px,0,0)`;
      setIndex(offset >= travel - 3 ? 5 : offset / step);
    }
    return false;
  });
  return { measure, goTo };
}
