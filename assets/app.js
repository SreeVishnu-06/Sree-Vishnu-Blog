import { capabilities, concepts, scenarios } from "./content.js";
import { initialState, transition } from "./simulation.js";

const $ = (selector) => document.querySelector(selector);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const menu = $(".menu-toggle");
const nav = $("#main-nav");
document.body.classList.add("js");
menu.hidden = false;
document
  .querySelectorAll("[data-capability], [data-demo], #scenario, #run, #reset")
  .forEach((control) => (control.disabled = false));

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
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav.classList.contains("open")) {
    closeMenu();
    menu.focus();
  }
  if (event.key === "Escape") {
    document.querySelectorAll(".graph-node").forEach((node) => {
      node.classList.remove("selected");
      node.setAttribute("aria-expanded", "false");
    });
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest("header")) closeMenu();
});
matchMedia("(max-width: 800px)").addEventListener("change", closeMenu);

// Native buttons expose node descriptions to touch, keyboard, and pointer users.
document.querySelectorAll(".graph-node").forEach((node) => {
  node.addEventListener("click", () => {
    const selected = !node.classList.contains("selected");
    document.querySelectorAll(".graph-node").forEach((other) => {
      other.classList.toggle("selected", other === node && selected);
      other.setAttribute("aria-expanded", String(other === node && selected));
    });
  });
});

const capabilityButtons = [...document.querySelectorAll("[data-capability]")];
capabilityButtons.forEach((button) =>
  button.addEventListener("click", () => {
    capabilityButtons.forEach((other) =>
      other.setAttribute("aria-pressed", String(other === button)),
    );
    const index = Number(button.dataset.capability);
    const [name, headline, description, tools] = capabilities[index];
    $("#capability-detail").innerHTML =
      `<p class="eyebrow">SELECTED DISCIPLINE / 0${index + 1}</p><h3>${headline}</h3><p>${description}</p><div class="capability-orbit" aria-hidden="true"><span>INPUT</span><b>DESIGN<br>+ VERIFY</b><span>OUTCOME</span></div><details><summary>Explore tools & patterns</summary><p>${tools}</p></details>`;
    $("#capability-detail").setAttribute("aria-label", name);
  }),
);

// Each walkthrough owns one finite timer. Closing its panel or leaving the page stops it.
const walkthroughs = new Map();
function stopWalkthrough(button) {
  clearInterval(walkthroughs.get(button));
  walkthroughs.delete(button);
}
document.querySelectorAll("[data-demo]").forEach((button) => {
  const index = Number(button.dataset.demo);
  const panel = button.closest(".architecture-details");
  const output = button.nextElementSibling;
  const nodes = [...panel.querySelectorAll(".mini-diagram > span")];
  panel.addEventListener("toggle", () => {
    if (!panel.open) stopWalkthrough(button);
  });
  button.addEventListener("click", () => {
    stopWalkthrough(button);
    output.hidden = false;
    button.setAttribute("aria-expanded", "true");
    nodes.forEach((node) =>
      node.classList.remove("stage-current", "stage-complete"),
    );
    if (index === 2) {
      const restricted = button.dataset.policy !== "restricted";
      button.dataset.policy = restricted ? "restricted" : "allowed";
      output.textContent = restricted
        ? concepts[index].result
        : "Public-source scenario: classification permits retrieval → output schema validated → decision recorded.";
      button.textContent = restricted
        ? "Try public-source scenario →"
        : "Try restricted-source scenario →";
      nodes.forEach((node, i) =>
        node.classList.toggle("stage-complete", !restricted || i < 2),
      );
      return;
    }
    button.textContent = "Replay walkthrough ↺";
    if (reducedMotion.matches) {
      nodes.forEach((node) => node.classList.add("stage-complete"));
      output.textContent = concepts[index].result;
      return;
    }
    let step = 0;
    const advance = () => {
      nodes.forEach((node, i) => {
        node.classList.toggle("stage-complete", i < step);
        node.classList.toggle("stage-current", i === step);
      });
      if (step < nodes.length) {
        output.textContent = `Stage ${step + 1}/${nodes.length}: ${concepts[index].stages[step]} — synthetic walkthrough`;
        step++;
      } else {
        output.textContent = concepts[index].result;
        stopWalkthrough(button);
      }
    };
    advance();
    walkthroughs.set(button, setInterval(advance, 450));
  });
});

let state = initialState();
let timer;
const scenario = $("#scenario");
const run = $("#run");
const pause = $("#pause");
function renderSimulation() {
  const selected = scenarios[scenario.value];
  $("#simulation-nodes").innerHTML = selected.stages
    .map(([name], index) => {
      const complete = index < state.step;
      const current =
        index === state.step && ["running", "paused"].includes(state.status);
      const label = complete
        ? "Complete"
        : current
          ? state.status === "paused"
            ? "Paused here"
            : "Processing"
          : "Waiting";
      return `<div class="sim-node ${complete ? "done" : current ? "active" : ""}"><span>0${index + 1}</span><strong>${name}</strong><small>${label}</small></div>`;
    })
    .join("");
  const status = {
    idle: "Ready",
    running: "Running",
    paused: "Paused",
    complete: "Complete",
  }[state.status];
  $("#simulation-status").textContent =
    `${status} · ${state.step} of ${selected.stages.length} stages`;
  $("#simulation-progress").value = state.step;
  $("#simulation-progress").max = selected.stages.length;
  $("#trace-list").innerHTML = state.step
    ? selected.stages
        .slice(0, state.step)
        .map(
          ([name, description]) =>
            `<li><strong>${name}</strong> — ${description}</li>`,
        )
        .join("")
    : "<li>Select a scenario and run the simulation.</li>";
  // Keep Run focusable while running so keyboard focus is never lost to a disabled button.
  run.setAttribute("aria-disabled", String(state.status === "running"));
  pause.disabled = state.status !== "running";
  run.innerHTML =
    state.status === "paused"
      ? "Resume <span>▶</span>"
      : state.status === "complete"
        ? "Run again <span>↺</span>"
        : "Run simulation <span>▶</span>";
}
function dispatch(action) {
  state = transition(state, action, scenarios[scenario.value].stages.length);
  renderSimulation();
  if (state.status !== "running") clearInterval(timer);
}
run.addEventListener("click", () => {
  if (state.status === "running") return;
  clearInterval(timer);
  dispatch("run");
  timer = setInterval(() => dispatch("tick"), 1100);
});
pause.addEventListener("click", () => {
  dispatch("pause");
  run.focus({ preventScroll: true });
});
$("#reset").addEventListener("click", () => dispatch("reset"));
scenario.addEventListener("change", () => dispatch("reset"));
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    dispatch("pause");
    walkthroughs.forEach((_, button) => stopWalkthrough(button));
  }
});
renderSimulation();
$("#year").textContent = new Date().getFullYear();

if ("IntersectionObserver" in window) {
  new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting && state.status === "running")
      dispatch("pause");
  }).observe($("#playground"));
  const reveal = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (!reducedMotion.matches) entry.target.classList.add("reveal");
        reveal.unobserve(entry.target);
      });
    },
    { threshold: 0.08 },
  );
  document
    .querySelectorAll(".section-heading, .highlights, .principle-grid")
    .forEach((element) => reveal.observe(element));
}

const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
const sections = [...document.querySelectorAll("section[id]")];
let frame;
function updateScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  $(".scroll-progress").style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  const current = sections
    .filter(
      (section) => section.getBoundingClientRect().top <= innerHeight * 0.35,
    )
    .at(-1);
  navLinks.forEach((link) => {
    if (
      link.hash === `#${current?.id === "playground" ? "systems" : current?.id}`
    )
      link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  frame = null;
}
addEventListener(
  "scroll",
  () => {
    if (!frame) frame = requestAnimationFrame(updateScroll);
  },
  { passive: true },
);
addEventListener("resize", updateScroll);
updateScroll();
if (matchMedia("(pointer:fine)").matches) {
  const art = $(".hero-art");
  art.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches) return;
    const bounds = art.getBoundingClientRect();
    art.style.setProperty(
      "--mx",
      `${((event.clientX - bounds.left) / bounds.width) * 100}%`,
    );
    art.style.setProperty(
      "--my",
      `${((event.clientY - bounds.top) / bounds.height) * 100}%`,
    );
  });
  art.addEventListener("pointerleave", () => {
    art.style.removeProperty("--mx");
    art.style.removeProperty("--my");
  });
}
