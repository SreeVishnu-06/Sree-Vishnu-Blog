import { conceptVisual } from "./visuals.mjs";
import { writeFile, mkdir, cp, rm } from "node:fs/promises";
import {
  profile as p,
  capabilities,
  concepts,
  experience,
  scenarios,
} from "../assets/content.js";
const connect = (primary = false) =>
  `<a class="button ${primary ? "primary" : "secondary"}" data-magnetic href="${p.linkedin}">Connect on LinkedIn <span aria-hidden="true">↗</span></a>`;
const heading = (label, title, copy = "") =>
  `<div class="section-heading" data-reveal><p class="eyebrow">${label}</p><h2><span>${title}</span></h2>${copy ? `<p>${copy}</p>` : ""}</div>`;
const tags = (items) =>
  `<div class="tags">${items.map((t) => `<span>${t}</span>`).join("")}</div>`;
const order = [0, 1, 2, 5, 3, 4];
const titles = [
  "Multi-agent knowledge orchestration",
  "Grounded enterprise RAG",
  "Responsible AI control plane",
  "Real-time risk intelligence",
  "Cloud-native AI delivery",
  "Intelligent document processing",
];
const details = (c) =>
  `<div class="detail-architecture" aria-label="Architecture stages">${c.stages.map((s, i) => `<span><b>${String(i + 1).padStart(2, "0")}</b>${s}</span>`).join("")}</div><div class="detail-columns"><section><h3>Decisions & tradeoffs</h3><p>${c.decision}</p></section><section><h3>Reliability & governance</h3><p>${c.reliability}</p></section></div><h3>Example stack</h3>${tags(c.stack)}<div class="synthetic"><p class="eyebrow">Synthetic example / No live model calls</p><p>${c.sample}</p><p>${c.result}</p></div>`;
const site = "https://sreevishnu0506-cyber.github.io/Sree-Vishnu-Blog/";
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#080A0D"><title>${p.name} | ${p.title}</title><meta name="description" content="Sree Vishnu Raju Dommaraju designs agentic AI, grounded retrieval, machine learning, and cloud-native systems. Explore interactive architecture concepts."><link rel="canonical" href="${site}"><meta property="og:title" content="${p.name} | ${p.title}"><meta property="og:description" content="Designing intelligent systems that move from research to production."><meta property="og:type" content="website"><meta property="og:url" content="${site}"><meta property="og:image" content="${site}assets/social.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${p.name} — Senior Generative AI Engineer"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${p.name} | ${p.title}"><meta name="twitter:description" content="Designing intelligent systems that move from research to production."><meta name="twitter:image" content="${site}assets/social.png"><link rel="icon" href="assets/favicon.svg"><link rel="preload" href="assets/fonts/space-grotesk.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="style.css"><script type="module" src="assets/app.js"></script><script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Person", name: p.name, jobTitle: p.title, sameAs: [p.linkedin] })}</script></head>
<body><a class="skip" href="#main">Skip to content</a><div class="reading-progress" aria-hidden="true"></div><div class="cursor-aura" data-cursor aria-hidden="true"><i></i><span></span></div><header class="site-header"><a class="brand" href="#home" aria-label="sv / AI ENGINEERING — Sree Vishnu Raju Dommaraju, home">sv<span> /</span><small>AI ENGINEERING</small></a><button class="menu-toggle" aria-expanded="false" aria-controls="main-nav" hidden>Menu <span aria-hidden="true">＋</span></button><nav id="main-nav" aria-label="Main navigation">${[
  ["about", "About"],
  ["playground", "Architecture"],
  ["systems", "Work"],
  ["expertise", "Expertise"],
  ["experience", "Journey"],
]
  .map(([id, label]) => `<a href="#${id}" data-magnetic>${label}</a>`)
  .join(
    "",
  )}<a class="nav-contact" data-magnetic href="#contact">Let’s connect <span aria-hidden="true">↗</span></a></nav></header>
<main id="main"><section id="home" class="hero"><div class="hero-copy"><p class="eyebrow hero-enter">GENERATIVE AI · AGENTIC SYSTEMS · MACHINE LEARNING</p><h1 id="hero-title"><span class="name-mask"><span>Sree Vishnu Raju</span></span><span class="name-mask"><span>Dommaraju<span class="ice">.</span></span></span></h1><p class="hero-role hero-enter">${p.title}</p><p class="hero-statement hero-enter">Designing intelligent systems that move from research to production.</p><div class="actions hero-enter"><a class="button primary" data-magnetic href="#systems">Explore Work <span aria-hidden="true">↘</span></a>${connect()}</div><div class="hero-footnote hero-enter"><span class="fine-cross" aria-hidden="true">＋</span><span>Engineering depth.<br>Human intent.</span></div></div><figure class="core-scene" aria-label="Kinetic chrome AI core: an original conceptual sculpture"><div class="scene-heading"><span>FIG. 01 / INTELLIGENCE IN MOTION</span><span>CONCEPTUAL STUDY</span></div><img class="core-fallback" src="assets/core-fallback.svg" fetchpriority="high" width="600" height="600" alt=""><canvas id="core-canvas" width="600" height="600" aria-hidden="true"></canvas><div class="scene-coordinate coordinate-a" aria-hidden="true">CONTEXT<br><b>01 / IN</b></div><div class="scene-coordinate coordinate-b" aria-hidden="true">REASONING<br><b>02 / THROUGH</b></div><div class="scene-caption"><span><i aria-hidden="true"></i>ORCHESTRATE · GROUND · EVALUATE</span><button id="motion-toggle" class="quiet-button" aria-pressed="false" hidden>Pause motion <span aria-hidden="true">Ⅱ</span></button></div></figure><a class="scroll-cue" href="#about"><span class="scroll-line" aria-hidden="true"></span>SCROLL TO DISCOVER <span aria-hidden="true">↓</span></a><div class="hero-index" aria-hidden="true">INDEPENDENT THINKING / CONNECTED SYSTEMS</div></section>
<section id="about" class="section about"><div>${heading("01 / ENGINEERING WITH INTENT", "From complex possibility.<br>To dependable systems.")}<p class="about-signature">Software → Data → ML → Generative AI</p></div><div class="about-copy" data-reveal><p class="lead">12+ years of engineering the systems behind the intelligence.</p><p>My work spans backend engineering, data platforms, machine learning, and enterprise generative AI. Today, I focus on agentic workflows, grounded retrieval, and cloud-native AI architectures.</p><p>Good systems make their reasoning inspectable, their limits explicit, and their operations dependable.</p><div class="principle-row"><span>Grounded by design</span><span>Observable by default</span><span>Built to evolve</span></div></div></section>
<section id="playground" class="section architecture-section">${heading("02 / INSIDE THE ARCHITECTURE", "Follow the intelligence.", "A representative agent workflow, made visible. Select a node to inspect its role, or run a synthetic request through the system.")}<div class="architecture-console" data-reveal><div class="console-toolbar"><label for="scenario">Explore a workflow<select id="scenario" disabled>${Object.entries(
  scenarios,
)
  .map(([key, s]) => `<option value="${key}">${s.name}</option>`)
  .join(
    "",
  )}</select></label><p><span class="status-dot" aria-hidden="true"></span> ARCHITECTURE SIMULATION<br><small>Synthetic examples · No live model calls</small></p></div><div class="architecture-flow"><svg id="flow-svg" aria-hidden="true"><path id="flow-route"/><path id="flow-travel"/><circle id="flow-signal" r="4"/></svg><div id="simulation-nodes">${scenarios.knowledge.stages.map(([label], i) => `<button class="sim-node" data-node="${i}" aria-pressed="${i === 0}" aria-controls="node-explanation" disabled><span>0${i + 1}</span><strong>${label}</strong><small>Waiting</small></button>`).join("")}</div></div><div class="console-lower"><div id="node-explanation" class="node-explanation" aria-live="polite"><p class="eyebrow">NODE 01 / USER QUERY</p><h3>The starting point.</h3><p>${scenarios.knowledge.stages[0][1]}</p></div><div class="execution"><div class="execution-heading"><p class="eyebrow">EXECUTION TRACE</p><p id="simulation-status" role="status">Ready · 0 of ${scenarios.knowledge.stages.length} stages</p></div><ol id="trace-list"><li>Select a workflow and run a simulation.</li></ol><progress id="simulation-progress" max="${scenarios.knowledge.stages.length}" value="0" aria-label="Completed simulation stages"></progress></div></div><div class="console-controls"><div class="actions"><button id="run" class="button primary" disabled>Run simulation <span aria-hidden="true">▶</span></button><button id="pause" class="button secondary" disabled>Pause</button><button id="reset" class="quiet-button" disabled>Reset <span aria-hidden="true">↺</span></button></div><span class="console-note">DETERMINISTIC / CLIENT-SIDE</span></div><noscript><p class="nojs-message">Text walkthrough: User Query → Router Agent → Retrieval / Tool Use → Reasoning / Validation → Guardrails → Response. Authorized fictional evidence is selected, validated, and cited before the synthetic response.</p></noscript></div></section>
<section id="systems" class="showcase-section" aria-labelledby="work-heading"><div class="showcase-sticky"><div class="showcase-heading"><div class="section-heading" data-reveal><p class="eyebrow">03 / SELECTED ARCHITECTURE CONCEPTS</p><h2 id="work-heading"><span>Systems, explored.</span></h2><p>Representative architectures inspired by my experience.<br>Illustrative concepts, not public client deliverables.</p></div><p class="showcase-hint"><span aria-hidden="true">↔</span> SCROLL TO EXPLORE<br><small>Or drag, swipe, and use the arrows</small></p></div><div class="showcase-rail" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Six illustrative architecture concepts" data-cursor-label="DRAG"><div class="showcase-track">${order
  .map((id, index) => {
    const c = concepts[id];
    return `<article class="concept" data-slide="${index}" aria-label="${index + 1} of 6: ${titles[id]}"><div class="concept-content"><div class="concept-meta"><span class="eyebrow">${c.kind}</span><span class="concept-count">0${index + 1} / 06</span></div><p class="concept-label">ARCHITECTURE CONCEPT</p><h3>${titles[id]}</h3><p>${c.problem}</p>${tags(c.stack.slice(0, 3))}<button class="architecture-button" data-open-concept="${id}" data-cursor-label="VIEW" disabled>Explore architecture <span aria-hidden="true">↗</span></button></div><div class="concept-visual" aria-hidden="true">${conceptVisual(id)}<span class="visual-index">SYSTEM / 0${index + 1}</span></div></article>`;
  })
  .join(
    "",
  )}</div></div><div class="showcase-controls"><div class="slide-arrows"><button id="slide-prev" aria-label="Previous concept" disabled>←</button><button id="slide-next" aria-label="Next concept" disabled>→</button></div><div class="slide-indicators" role="group" aria-label="Choose a concept">${order.map((id, i) => `<button data-slide-to="${i}" aria-label="Show concept ${i + 1}: ${titles[id]}" aria-pressed="${i === 0}" disabled><span></span></button>`).join("")}</div><p id="slide-status" role="status">01 / 06</p></div></div><noscript><div class="concept-fallbacks">${order.map((id) => `<details class="architecture-details"><summary>${titles[id]} — architecture details</summary>${details(concepts[id])}</details>`).join("")}</div></noscript></section>
<section id="expertise" class="section expertise-section">${heading("04 / TECHNICAL UNIVERSE", "Depth in the connections.", "Select a discipline. Explore the tools and patterns behind it. A curated vocabulary—not a claim of equal proficiency in every technology.")}<div class="expertise-layout"><div class="capability-list" role="group" aria-label="Choose a technical discipline">${capabilities.map((c, i) => `<button data-capability="${i}" aria-controls="capability-detail" aria-pressed="${i === 0}" disabled><span>0${i + 1}</span>${c[0]}<span aria-hidden="true">↗</span></button>`).join("")}</div><div id="capability-detail" class="capability-detail" aria-live="polite"><p class="eyebrow">SELECTED DISCIPLINE / 01</p><h3>${capabilities[0][1]}</h3><p>${capabilities[0][2]}</p><div class="skill-orbit" aria-hidden="true"><i></i><i></i><b>CONTEXT<br>↔<br>CONTROL</b></div>${tags(capabilities[0][3].split(", ").slice(0, 8))}<details><summary>All tools & patterns <span aria-hidden="true">＋</span></summary><p>${capabilities[0][3]}</p></details></div></div><noscript><div class="nojs-skills">${capabilities
  .slice(1)
  .map((c) => `<h3>${c[0]}</h3><p>${c[2]}</p><p>${c[3]}</p>`)
  .join("")}</div></noscript></section>
<section id="experience" class="section journey">${heading("05 / PROFESSIONAL JOURNEY", "Built layer by layer.", "A career progressing from application foundations to intelligent systems. Domains are anonymized; the engineering progression is the story.")}<div class="timeline">${experience.map(([date, role, domain, copy], i) => `<article data-reveal><div class="timeline-date"><span>${date}</span><i aria-hidden="true"></i></div><div class="timeline-copy"><p class="eyebrow">${domain}</p><h3>${role}</h3><p>${copy}</p></div><span class="timeline-index" aria-hidden="true">0${i + 1}</span></article>`).join("")}</div></section>
<section id="contact" class="section contact"><div class="contact-graphic" aria-hidden="true"><i></i><i></i><i></i></div><p class="eyebrow" data-reveal>06 / WHAT COMES NEXT</p><h2 data-reveal>Let’s engineer<br><span>what comes next.</span></h2><p class="contact-copy" data-reveal>Grounded intelligence. Thoughtful architecture.<br>A conversation is a good place to start.</p><div class="actions" data-reveal>${connect(true)}<a class="text-link" href="#systems">Revisit the concepts ↗</a></div><div class="contact-details" data-reveal><a href="mailto:${p.email}"><span>Email</span><strong>${p.email}</strong></a><a href="tel:${p.phone}"><span>Phone</span><strong>${p.phone}</strong></a></div><div class="contact-identity"><span>${p.name}</span><span>${p.title}</span></div></section></main><footer class="site-footer"><a class="brand" href="#home" aria-label="sv / — Back to top">sv<span> /</span></a><p>© <span id="year">${new Date().getFullYear()}</span> ${p.name}</p><a href="${p.linkedin}">LinkedIn ↗</a><a href="#home">Back to top ↑</a><span>BUILT WITH INTENT.</span></footer><dialog id="concept-dialog" aria-labelledby="dialog-title"><div class="dialog-toolbar"><p class="eyebrow">ARCHITECTURE CONCEPT / SYNTHETIC EXAMPLES</p><button id="close-dialog" class="close-dialog" aria-label="Close architecture details">Close <span aria-hidden="true">×</span></button></div><div id="dialog-content"></div></dialog></body></html>`;
await writeFile("index.html", html);
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
console.log("Built cinematic static portfolio in dist/");
