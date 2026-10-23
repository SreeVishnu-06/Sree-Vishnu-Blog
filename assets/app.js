import { capabilities, concepts, scenarios } from "./content.js";
import { initialState, transition } from "./simulation.js";
import { initMotion } from "./motion.js";
import { initShowcase } from "./showcase.js";
import {
  onFrame,
  onResize,
  onMotionChange,
  requestFrame,
  motionEnabled,
  resize,
  viewport,
  setMotionPaused,
  reducedMotion,
} from "./runtime.js";
const $ = (selector) => document.querySelector(selector);
document.body.classList.add("js");
const menu = $(".menu-toggle"),
  nav = $("#main-nav");
menu.hidden = false;
function closeMenu() {
  nav.classList.remove("open");
  menu.setAttribute("aria-expanded", "false");
}
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("open", open);
});
nav.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;
  const wasOpen = nav.classList.contains("open");
  closeMenu();
  if (wasOpen && link.hash) {
    const target = $(link.hash);
    target?.setAttribute("tabindex", "-1");
    target?.focus({ preventScroll: true });
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav.classList.contains("open")) {
    closeMenu();
    menu.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest("header")) closeMenu();
});
matchMedia("(max-width:800px)").addEventListener("change", closeMenu);
const motionToggle = $("#motion-toggle");
let pausedMotion = false;
motionToggle.hidden = reducedMotion.matches;
motionToggle.addEventListener("click", () => {
  pausedMotion = !pausedMotion;
  setMotionPaused(pausedMotion);
  motionToggle.setAttribute("aria-pressed", String(pausedMotion));
  motionToggle.innerHTML = pausedMotion
    ? 'Resume motion <span aria-hidden="true">▶</span>'
    : 'Pause motion <span aria-hidden="true">Ⅱ</span>';
});
reducedMotion.addEventListener(
  "change",
  () => (motionToggle.hidden = reducedMotion.matches),
);
initMotion();
const showcase = initShowcase();
let coreLoaded = false;
const loadCore = () => {
  if (coreLoaded) return;
  coreLoaded = true;
  import("./scene.js")
    .then((module) => module.initCore())
    .catch(() => ($(".core-scene").dataset.renderState = "fallback"));
};
if ("IntersectionObserver" in window) {
  const lazy = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadCore();
        lazy.disconnect();
      }
    },
    { rootMargin: "100px" },
  );
  lazy.observe($(".core-scene"));
} else loadCore();

const capabilityButtons = [...document.querySelectorAll("[data-capability]")];
capabilityButtons.forEach((button) => {
  button.disabled = false;
  button.addEventListener("click", () => {
    const index = Number(button.dataset.capability),
      [name, headline, description, tools] = capabilities[index];
    capabilityButtons.forEach((other) =>
      other.setAttribute("aria-pressed", String(other === button)),
    );
    $("#capability-detail").innerHTML =
      `<p class="eyebrow">SELECTED DISCIPLINE / 0${index + 1}</p><h3>${headline}</h3><p>${description}</p><div class="skill-orbit" aria-hidden="true"><i></i><i></i><b>CONTEXT<br>↔<br>CONTROL</b></div><div class="tags">${tools
        .split(", ")
        .slice(0, 8)
        .map((tool) => `<span>${tool}</span>`)
        .join(
          "",
        )}</div><details><summary>All tools & patterns <span aria-hidden="true">＋</span></summary><p>${tools}</p></details>`;
    $("#capability-detail").setAttribute("aria-label", name);
    if (motionEnabled())
      $("#capability-detail").animate(
        [
          { opacity: 0.4, transform: "translateX(12px)" },
          { opacity: 1, transform: "translateX(0)" },
        ],
        { duration: 380, easing: "ease-out" },
      );
    resize();
  });
});

// Deterministic execution. The shared frame loop also moves the visible signal.
let state = initialState(),
  elapsed = 0,
  selectedNode = 0,
  routePoints = [],
  routeLength = 0;
const scenario = $("#scenario"),
  run = $("#run"),
  pause = $("#pause"),
  nodeList = $("#simulation-nodes"),
  flow = $(".architecture-flow"),
  route = $("#flow-route"),
  travel = $("#flow-travel"),
  signal = $("#flow-signal");
scenario.disabled = false;
run.disabled = false;
$("#reset").disabled = false;
function selectNode(index) {
  selectedNode = index;
  const [name, description] = scenarios[scenario.value].stages[index];
  $("#node-explanation").innerHTML =
    `<p class="eyebrow">NODE 0${index + 1} / ${name}</p><h3>${name}</h3><p>${description}</p>`;
  nodeList
    .querySelectorAll("button")
    .forEach((button, i) =>
      button.setAttribute("aria-pressed", String(i === index)),
    );
}
function measureRoute() {
  const rect = flow.getBoundingClientRect();
  routePoints = [...nodeList.children].map((node) => {
    const r = node.getBoundingClientRect();
    return {
      x: r.left - rect.left + r.width / 2,
      y: r.top - rect.top + r.height / 2,
    };
  });
  const d = routePoints
    .map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`)
    .join(" ");
  route.setAttribute("d", d);
  travel.setAttribute("d", d);
  routeLength = route.getTotalLength();
  $("#flow-svg").setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
  requestFrame();
}
function renderNodes() {
  nodeList.innerHTML = scenarios[scenario.value].stages
    .map(
      ([name], i) =>
        `<button class="sim-node" data-node="${i}" aria-pressed="${i === selectedNode}" aria-controls="node-explanation"><span>0${i + 1}</span><strong>${name}</strong><small>Waiting</small></button>`,
    )
    .join("");
  nodeList.style.gridTemplateColumns =
    viewport.width > 800
      ? `repeat(${scenarios[scenario.value].stages.length},minmax(0,1fr))`
      : "";
  measureRoute();
}
function renderState() {
  const s = scenarios[scenario.value],
    labels = {
      idle: "Ready",
      running: "Running",
      paused: "Paused",
      complete: "Complete",
    };
  $("#simulation-status").textContent =
    `${labels[state.status]} · ${state.step} of ${s.stages.length} stages`;
  $("#simulation-progress").max = s.stages.length;
  $("#simulation-progress").value = state.step;
  nodeList.querySelectorAll("button").forEach((button, i) => {
    const complete = i < state.step,
      current =
        i === state.step &&
        state.status !== "idle" &&
        state.status !== "complete";
    button.classList.toggle("complete", complete);
    button.classList.toggle("processing", current);
    button.querySelector("small").textContent = complete
      ? "Complete"
      : current
        ? state.status === "paused"
          ? "Paused here"
          : "Processing"
        : "Waiting";
  });
  run.setAttribute("aria-disabled", String(state.status === "running"));
  pause.disabled = state.status !== "running";
  run.innerHTML =
    state.status === "paused"
      ? 'Resume <span aria-hidden="true">▶</span>'
      : state.status === "complete"
        ? 'Run again <span aria-hidden="true">↺</span>'
        : 'Run simulation <span aria-hidden="true">▶</span>';
  $("#trace-list").innerHTML = state.step
    ? s.stages
        .slice(0, state.step)
        .map(
          ([name, description]) => `<li><b>${name}</b> — ${description}</li>`,
        )
        .join("")
    : "<li>Select a workflow and run a simulation.</li>";
  $("#trace-list").scrollTop = $("#trace-list").scrollHeight;
  requestFrame();
}
function dispatch(action) {
  state = transition(state, action, scenarios[scenario.value].stages.length);
  if (action === "reset") elapsed = 0;
  renderState();
}
nodeList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-node]");
  if (button) selectNode(Number(button.dataset.node));
});
run.addEventListener("click", () => {
  if (state.status === "running") return;
  if (state.status === "complete") elapsed = 0;
  dispatch("run");
  selectNode(Math.min(state.step, scenarios[scenario.value].stages.length - 1));
});
pause.addEventListener("click", () => {
  dispatch("pause");
  run.focus({ preventScroll: true });
});
$("#reset").addEventListener("click", () => {
  dispatch("reset");
  selectNode(0);
});
scenario.addEventListener("change", () => {
  state = initialState();
  elapsed = 0;
  selectedNode = 0;
  renderNodes();
  selectNode(0);
  renderState();
});
onResize(() => {
  renderNodes();
  renderState();
});
new ResizeObserver(measureRoute).observe(flow);
new IntersectionObserver(
  (entries) => {
    if (!entries[0].isIntersecting && state.status === "running")
      dispatch("pause");
  },
  { rootMargin: "-100px 0px 0px 0px" },
).observe($(".architecture-console"));
onFrame(({ dt }) => {
  if (state.status === "running") {
    elapsed += dt;
    if (elapsed >= 1100) {
      elapsed -= 1100;
      dispatch("tick");
      if (state.status !== "complete") selectNode(state.step);
    }
  }
  const moving = state.status === "running";
  if (moving && motionEnabled() && routePoints.length > 1) {
    const i = Math.min(state.step, routePoints.length - 2),
      a = routePoints[i],
      b = routePoints[i + 1],
      t = state.step === routePoints.length - 1 ? 1 : elapsed / 1100;
    signal.setAttribute("cx", a.x + (b.x - a.x) * t);
    signal.setAttribute("cy", a.y + (b.y - a.y) * t);
    signal.style.opacity = "1";
  } else signal.style.opacity = "0";
  const length = routeLength;
  travel.style.strokeDasharray = String(length);
  travel.style.strokeDashoffset = String(
    length * (1 - Math.min(1, state.step / Math.max(1, routePoints.length - 1))),
  );
  return moving;
});
renderNodes();
selectNode(0);
renderState();

const dialog = $("#concept-dialog"),
  dialogContent = $("#dialog-content");
let returnFocus = null,
  demo = null;
function finishDemo() {
  demo = null;
  requestFrame();
}
function closeDialog() {
  dialog.close();
}
$("#close-dialog").addEventListener("click", closeDialog);
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      closeDialog();
  }
});
dialog.addEventListener("close", () => {
  finishDemo();
  returnFocus?.focus({ preventScroll: true });
  requestFrame();
});
document.querySelectorAll("[data-open-concept]").forEach((button) => {
  button.disabled = false;
  button.addEventListener("click", () => {
    const id = Number(button.dataset.openConcept),
      c = concepts[id];
    returnFocus = button;
    if (state.status === "running") dispatch("pause");
    const art = button.closest(".concept").querySelector("svg").outerHTML;
    dialogContent.innerHTML = `<h2 id="dialog-title">${c.name}</h2><p>${c.problem}</p><div class="dialog-visual concept-visual" aria-hidden="true">${art}</div><div class="detail-architecture" aria-label="Architecture stages">${c.stages.map((name, i) => `<span class="dialog-stage"><b>0${i + 1}</b>${name}</span>`).join("")}</div><div class="detail-columns"><section><h3>Decisions & tradeoffs</h3><p>${c.decision}</p></section><section><h3>Reliability & governance</h3><p>${c.reliability}</p></section></div><h3>Example stack</h3><div class="tags">${c.stack.map((tool) => `<span>${tool}</span>`).join("")}</div><div class="synthetic"><p class="eyebrow">Architecture simulation / No live model calls</p><p>${c.sample}</p><div class="dialog-demo"><button class="button secondary" id="concept-demo">${id === 2 ? "Try restricted-source scenario" : "Run walkthrough"} <span aria-hidden="true">→</span></button><p id="concept-demo-status" role="status">Synthetic example ready.</p></div></div>`;
    let restricted = false;
    $("#concept-demo").addEventListener("click", () => {
      if (id === 2) {
        restricted = !restricted;
        $("#concept-demo-status").textContent = restricted
          ? c.result
          : "Public-source scenario: classification permits retrieval → output schema validated → decision recorded.";
        $("#concept-demo").textContent = restricted
          ? "Try public-source scenario →"
          : "Try restricted-source scenario →";
        dialogContent
          .querySelectorAll(".dialog-stage")
          .forEach((node, i) =>
            node.classList.toggle("done", !restricted || i < 2),
          );
        return;
      }
      if (!motionEnabled()) {
        dialogContent
          .querySelectorAll(".dialog-stage")
          .forEach((node) => node.classList.add("done"));
        $("#concept-demo-status").textContent = c.result;
        return;
      }
      demo = { concept: c, step: 0, elapsed: 0 };
      $("#concept-demo-status").textContent =
        `Stage 1/${c.stages.length}: ${c.stages[0]}`;
      $("#concept-demo").textContent = "Replay walkthrough ↺";
      requestFrame();
    });
    dialog.showModal();
    dialog.scrollTop = 0;
    $("#close-dialog").focus({ preventScroll: true });
    requestFrame();
  });
});
onFrame(({ dt }) => {
  if (!demo || !dialog.open) return false;
  demo.elapsed += dt;
  const nodes = dialogContent.querySelectorAll(".dialog-stage");
  if (demo.elapsed > 500) {
    demo.elapsed = 0;
    demo.step++;
  }
  nodes.forEach((node, i) => {
    node.classList.toggle("current", i === demo.step);
    node.classList.toggle("done", i < demo.step);
  });
  if (demo.step >= nodes.length) {
    $("#concept-demo-status").textContent = demo.concept.result;
    finishDemo();
    return false;
  }
  const label = `Stage ${demo.step + 1}/${nodes.length}: ${demo.concept.stages[demo.step]}`;
  if ($("#concept-demo-status").textContent !== label)
    $("#concept-demo-status").textContent = label;
  return true;
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (state.status === "running") dispatch("pause");
    finishDemo();
  }
});
onMotionChange(() => {
  if (demo && !motionEnabled()) {
    const c = demo.concept;
    finishDemo();
    $("#concept-demo-status").textContent = c.result;
    dialogContent.querySelectorAll(".dialog-stage").forEach((node) => {
      node.classList.add("done");
      node.classList.remove("current");
    });
  }
});
const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
let sectionPositions = [];
function measureSections() {
  sectionPositions = [...document.querySelectorAll("main>section[id]")].map(
    (section) => ({
      id: section.id,
      top: section.getBoundingClientRect().top + scrollY,
    }),
  );
}
onResize(measureSections);
measureSections();
onFrame(() => {
  const max = document.documentElement.scrollHeight - viewport.height;
  $(".reading-progress").style.transform =
    `scaleX(${max > 0 ? viewport.scroll / max : 0})`;
  const current = sectionPositions
    .filter((section) => section.top <= viewport.scroll + viewport.height * 0.3)
    .at(-1);
  navLinks.forEach((link) => {
    if (link.hash === `#${current?.id}`)
      link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  return false;
});
$("#year").textContent = new Date().getFullYear();
document.fonts.ready.then(() => {
  showcase.measure();
  resize();
});

// Observe the inherited em size so browser text scaling also refreshes pin geometry.
const typeProbe = document.createElement("span");
typeProbe.className = "type-probe";
typeProbe.setAttribute("aria-hidden", "true");
document.body.append(typeProbe);
new ResizeObserver(() => resize()).observe(typeProbe);
