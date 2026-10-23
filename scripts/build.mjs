import { conceptVisual } from "./visuals.mjs";
import { writeFile, mkdir, cp, rm } from "node:fs/promises";
import {
  profile as p,
  capabilities,
  concepts,
  experience,
  scenarios,
} from "../assets/content.js";
const linkedin = `<a class="button secondary" href="${p.linkedin}">Connect on LinkedIn <span>↗</span></a>`;
const sectionHead = (n, title, copy = "") =>
  `<div class="section-heading"><p class="eyebrow">${n}</p><h2>${title}</h2>${copy ? `<p>${copy}</p>` : ""}</div>`;
const diagram = (stages) =>
  `<div class="mini-diagram" aria-label="Architecture stages">${stages.map((s, j) => `<span><b>${String(j + 1).padStart(2, "0")}</b>${s}</span>`).join('<i aria-hidden="true">→</i>')}</div>`;
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#080b12"><title>${p.name} | ${p.title}</title><meta name="description" content="Senior AI engineer designing agentic workflows, grounded RAG, machine learning platforms, and observable cloud-native systems. Explore representative architectures."><meta property="og:title" content="${p.name} | Engineering intelligence"><meta property="og:description" content="Agentic AI. Grounded retrieval. Systems built with intent."><meta property="og:type" content="website"><meta property="og:url" content="https://sreevishnu0506-cyber.github.io/Sree-Vishnu-Blog/"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Engineering intelligence — Sree Vishnu Raju Dommaraju, Senior Generative AI Engineer"><meta property="og:image" content="https://sreevishnu0506-cyber.github.io/Sree-Vishnu-Blog/assets/social.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${p.name} | ${p.title}"><meta name="twitter:description" content="Agentic AI, grounded retrieval, and cloud-native engineering."><meta name="twitter:image" content="https://sreevishnu0506-cyber.github.io/Sree-Vishnu-Blog/assets/social.png"><link rel="canonical" href="https://sreevishnu0506-cyber.github.io/Sree-Vishnu-Blog/"><link rel="icon" href="assets/favicon.svg"><link rel="stylesheet" href="style.css"><script type="module" src="assets/app.js"></script><script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Person", name: p.name, jobTitle: p.title, sameAs: [p.linkedin] })}</script></head>
<body><a class="skip" href="#main">Skip to content</a><div class="scroll-progress" aria-hidden="true"></div><header><a class="brand" href="#" aria-label="sv / — Sree Vishnu, back to top">sv<span> /</span></a><button class="menu-toggle" aria-expanded="false" aria-controls="main-nav" hidden>Menu <span>＋</span></button><nav id="main-nav" aria-label="Main navigation">${["About", "Expertise", "Systems", "Experience", "Contact"].map((x) => `<a href="#${x.toLowerCase()}">${x}</a>`).join("")}<a class="nav-connect" href="${p.linkedin}">Let’s connect ↗</a></nav></header>
<main id="main"><section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow"><span class="small-line"></span> AI SYSTEMS / HUMAN INTENT</p><p class="identity">${p.name}<br><span>${p.title}</span></p><h1 id="hero-title">Engineering<br>intelligence<span class="cyan">.</span><br><em>Orchestrating</em><br>what comes next<span class="cyan">.</span></h1><p class="hero-description">I design production-oriented AI systems—from agentic workflows and grounded retrieval to scalable machine learning platforms and cloud-native infrastructure.</p><div class="actions"><a class="button" href="#systems">Explore my work <span>↘</span></a>${linkedin}</div></div>
<div class="hero-art"><div class="art-label"><span>FIG. 01 / ORCHESTRATION MAP</span><span>CONCEPTUAL</span></div><svg class="graph-lines" viewBox="0 0 600 600" fill="none" aria-hidden="true"><defs><radialGradient id="halo"><stop stop-color="#53e6ff" stop-opacity=".14"/><stop offset="1" stop-color="#53e6ff" stop-opacity="0"/></radialGradient><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10" fill="#527985"/></marker></defs><circle cx="300" cy="300" r="290" fill="url(#halo)"/><g stroke="#244552"><circle cx="300" cy="300" r="210" stroke-dasharray="3 9"/><circle cx="300" cy="300" r="135"/><path d="M300 80V240 M110 220L250 280 M350 280L490 220 M300 350V510 M150 440L260 330 M340 330L450 440" marker-end="url(#arrow)"/><path d="M110 220L150 440H450L490 220L300 80Z" stroke-dasharray="4 8"/></g><g class="signal" fill="#74f0d1"><circle cx="300" cy="180" r="4"/><circle cx="195" cy="256" r="4"/><circle cx="409" cy="255" r="4"/><circle cx="300" cy="411" r="4"/></g></svg>
<button class="graph-node center" type="button" aria-expanded="false" aria-controls="node-orchestrator"><span class="node-symbol">⌘</span><strong>Orchestrator</strong><small>State · routing · control</small><span class="node-tip" id="node-orchestrator">Bounded execution with explicit handoffs.</span></button>${[
  [
    "input",
    "01",
    "Intent",
    "Query & context",
    "Understand intent before selecting tools.",
  ],
  [
    "retrieve",
    "02",
    "Retrieve",
    "Ground in evidence",
    "Select authorized sources and retain provenance.",
  ],
  [
    "reason",
    "03",
    "Reason",
    "Plan & synthesize",
    "Use structured outputs and bounded reasoning.",
  ],
  [
    "validate",
    "04",
    "Validate",
    "Evaluate & guard",
    "Check evidence, policy, and output contracts.",
  ],
  [
    "observe",
    "05",
    "Observe",
    "Trace & improve",
    "Expose stage state and failure boundaries.",
  ],
]
  .map(
    ([cl, n, t, s, tip]) =>
      `<button class="graph-node ${cl}" type="button" aria-expanded="false" aria-controls="node-${cl}"><span class="node-number">${n}</span><strong>${t}</strong><small>${s}</small><span class="node-tip" id="node-${cl}">${tip}</span></button>`,
  )
  .join(
    "",
  )}<div class="art-bottom"><span class="cyan">◆</span> AGENTIC SYSTEMS / RAG / MLOPS</div></div><a class="scroll-cue" href="#about">SCROLL TO EXPLORE <span>↓</span></a></section>
<div class="discipline-strip" aria-label="Engineering focus"><span>INTENT → ARCHITECTURE → IMPACT</span><span>Grounded intelligence</span><span>Observable systems</span><span>Thoughtful engineering</span></div>
<section id="about" class="section about">${sectionHead("01 / THE ENGINEER", 'Complex capabilities.<br><span class="muted">Dependable systems.</span>')}<div class="about-copy"><p class="lead">I’m a senior AI engineer with 12+ years across software engineering, data platforms, machine learning, and enterprise-scale generative AI.</p><p>My work turns complex AI capabilities into secure, observable, scalable systems—from multi-agent orchestration and grounded retrieval to production APIs, model evaluation, and cloud deployment.</p><p>I care about the details between a compelling prototype and a dependable system: reliability, grounded answers, measurable evaluation, privacy-aware design, and modular operations.</p></div><div class="highlights"><div><strong>12+</strong><span>Years across software & AI</span></div><div><strong>Agentic AI</strong><span>Orchestration & grounded retrieval</span></div><div><strong>Multi-cloud</strong><span>Infrastructure with intent</span></div><div><strong>MLOps</strong><span>Evaluation through operations</span></div></div></section>
<section id="expertise" class="section">${sectionHead("02 / CAPABILITY MAP", "Depth at the intersections.", "Select a discipline to explore the engineering approach. Tools are a curated vocabulary, not a claim of equal depth in every technology.")}<div class="capability-layout"><div class="capability-list" role="group" aria-label="Choose a capability">${capabilities.map((c, i) => `<button data-capability="${i}" aria-controls="capability-detail" disabled aria-pressed="${i === 0}"><span>0${i + 1}</span>${c[0]}<span>↗</span></button>`).join("")}</div><div class="capability-detail" id="capability-detail" aria-live="polite"><p class="eyebrow">SELECTED DISCIPLINE / 01</p><h3>${capabilities[0][1]}</h3><p>${capabilities[0][2]}</p><div class="capability-orbit" aria-hidden="true"><span>CONTEXT</span><b>REASON<br>+ ACT</b><span>CONTROL</span></div><details><summary>Explore tools & patterns</summary><p>${capabilities[0][3]}</p></details></div></div><noscript><div class="noscript-capabilities">${capabilities
  .slice(1)
  .map((c) => `<h3>${c[0]}</h3><p>${c[2]}</p><p>${c[3]}</p>`)
  .join("")}</div></noscript></section>
<section id="systems" class="section">${sectionHead("03 / SELECTED SYSTEM CONCEPTS", "Architecture is the work.", "Representative architectures inspired by my experience. Illustrative, not public client deliverables.")}<div class="concept-grid">${concepts
  .map(
    (c, i) =>
      `<article class="concept"><div class="concept-top"><span class="eyebrow">${c.kind}</span><span class="concept-number">0${i + 1}</span></div><div class="concept-visual" aria-hidden="true">${conceptVisual(i)}</div><p class="label">REPRESENTATIVE CONCEPT</p><h3>${c.name}</h3><p>${c.problem}</p><div class="tags">${c.stack
        .slice(0, 3)
        .map((t) => `<span>${t}</span>`)
        .join(
          "",
        )}</div><details class="architecture-details"><summary>Explore architecture</summary><div class="detail-body">${diagram(c.stages)}<h4>Technical decision & tradeoff</h4><p>${c.decision}</p><h4>Reliability & governance</h4><p>${c.reliability}</p><h4>Example stack</h4><p>${c.stack.join(" · ")}</p><div class="synthetic"><p class="label">ARCHITECTURE SIMULATION · NO LIVE MODEL CALLS</p><p>${c.sample}</p><button class="small-button" data-demo="${i}" aria-controls="demo-${i}" aria-expanded="false" disabled>${["Trace this query", "Inspect citation pipeline", "Switch policy scenario", "Classify sample events", "Run deployment lifecycle", "Transform document"][i]} →</button><p class="demo-result" id="demo-${i}" role="status" hidden>${c.result}</p></div></div></details></article>`,
  )
  .join("")}</div></section>
<section id="playground" class="section playground">${sectionHead("04 / INTERACTIVE PLAYGROUND", "Inside the architecture.", "Interactive architecture simulation using synthetic examples. Follow the decisions between input and output; no live model calls.")}<div class="playground-shell"><div class="playground-toolbar"><label for="scenario">Scenario<select id="scenario" disabled>${Object.entries(
  scenarios,
)
  .map(([k, s]) => `<option value="${k}">${s.name}</option>`)
  .join(
    "",
  )}</select></label><span class="simulation-badge">DETERMINISTIC / CLIENT-SIDE</span></div><div id="simulation-nodes" class="simulation-nodes">${scenarios.knowledge.stages.map(([n], i) => `<div class="sim-node"><span>0${i + 1}</span><strong>${n}</strong><small>Waiting</small></div>`).join("")}</div><div class="simulation-bottom"><div class="simulation-controls"><div class="actions"><button id="run" class="button" disabled>Run simulation <span>▶</span></button><button id="pause" class="button secondary" disabled>Pause</button><button id="reset" class="reset-button" disabled>Reset ↺</button></div><p id="simulation-status" role="status">Ready · 0 of 5 stages</p><progress id="simulation-progress" max="5" value="0" aria-label="Completed simulation stages"></progress><p class="small">Predefined events reveal one stage at a time. Pause preserves your position. Reset returns to the beginning.</p></div><div class="trace"><p class="eyebrow">EXECUTION TRACE</p><ol id="trace-list" aria-label="Simulation trace"><li>Select a scenario and run the simulation.</li></ol></div></div><noscript><p>JavaScript is disabled. Text walkthrough: Query → retrieve an authorized fictional handbook → rerank evidence → attach citation [Handbook §2] → check response support.</p></noscript></div></section>
<section id="experience" class="section experience">${sectionHead("05 / PROFESSIONAL EVOLUTION", "A foundation built<br>across disciplines.", "From application engineering to intelligent systems. An anonymized view of my career, organized by domain.")}<div class="timeline">${experience.map(([date, role, domain, copy]) => `<article><span class="timeline-dot"></span><p class="eyebrow">${date}</p><div><span class="label">${domain}</span><h3>${role}</h3><p>${copy}</p></div></article>`).join("")}</div></section>
<section class="section principles">${sectionHead("06 / OPERATING PRINCIPLES", "Intelligence, with intention.")}<div class="principle-grid">${[
  [
    "Grounded by Design",
    "Retrieval quality, citations, evaluation, and guardrails are part of the system from the start.",
  ],
  [
    "Built for Production",
    "Resilience, observability, automation, and maintainability belong in every engineering decision.",
  ],
  [
    "Security in the Architecture",
    "Access control, sensitive-data handling, and governance define the boundaries of useful intelligence.",
  ],
  [
    "Systems over Demos",
    "Thoughtful interfaces work best when connected to dependable backend services.",
  ],
]
  .map(
    ([t, d], i) =>
      `<article><span class="principle-icon" aria-hidden="true">${["◎", "⌁", "◇", "⊞"][i]}</span><h3>${t}</h3><p>${d}</p></article>`,
  )
  .join("")}</div></section>
<section id="contact" class="section contact"><p class="eyebrow">07 / WHAT COMES NEXT</p><h2>Let’s build the next<br>generation of<br><span>intelligent systems.</span></h2><p>Thoughtful architecture. Grounded intelligence. A conversation is a good place to start.</p><div class="actions">${linkedin}<a class="text-link" href="#systems">Explore systems ↗</a></div><div class="contact-mark" aria-hidden="true">sv/</div></section></main><footer><div><a class="brand" href="#">sv<span> /</span></a><p>${p.name}<br>${p.title}</p></div><div><a href="#about">About</a><a href="#systems">Systems</a><a href="${p.linkedin}">LinkedIn ↗</a><a href="#">Back to top ↑</a></div><p>© <span id="year">${new Date().getFullYear()}</span> ${p.name}<br>Designed with intent. Engineered with care.</p></footer></body></html>`;
await writeFile("index.html", html);
// This fixed, repository-local output directory contains generated artifacts only.
await rm(new URL("../dist/", import.meta.url), {
  recursive: true,
  force: true,
});
await mkdir("dist", { recursive: true });
for (const file of [
  "index.html",
  "style.css",
  "assets",
  "robots.txt",
  "sitemap.xml",
])
  await cp(file, `dist/${file}`, { recursive: true });
await writeFile("dist/.nojekyll", "");
for (const [path, anchor] of [
  ["about", "about"],
  ["projects", "systems"],
  ["blog", "about"],
]) {
  await mkdir(`dist/${path}`, { recursive: true });
  await writeFile(
    `dist/${path}/index.html`,
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Continue to portfolio</title><meta http-equiv="refresh" content="0;url=../#${anchor}"><a href="../#${anchor}">Continue to portfolio</a></html>`,
  );
}
console.log("Built dependency-free static portfolio in dist/");
