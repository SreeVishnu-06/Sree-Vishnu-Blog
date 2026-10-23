const box = (x, y, w, label, accent = "") =>
  `<g class="diagram-box ${accent}"><rect x="${x}" y="${y}" width="${w}" height="30" rx="4"/><text x="${x + w / 2}" y="${y + 19}">${label}</text></g>`;
const wire = (d, accent = "") =>
  `<path class="diagram-wire ${accent}" d="${d}"/>`;
const dot = (x, y) => `<circle class="diagram-dot" cx="${x}" cy="${y}" r="3"/>`;
const caption = (text) =>
  `<text class="diagram-caption" x="170" y="150">${text}</text>`;
const diagrams = [
  `${box(15, 65, 65, "INTENT")}${box(112, 65, 80, "PLANNER", "accent")}${box(230, 22, 92, "RETRIEVE")}${box(230, 65, 92, "VALIDATE")}${box(230, 108, 92, "RESPOND")}${wire("M80 80H112M192 80H211V37H230M211 80H230M211 80V123H230")}${dot(211, 80)}${caption("BOUNDED AGENTS · EXPLICIT HANDOFFS")}`,
  `<g class="diagram-documents"><rect x="20" y="36" width="40" height="54" rx="3"/><rect x="26" y="42" width="40" height="54" rx="3"/><rect x="32" y="48" width="40" height="54" rx="3"/><path d="M41 62H62M41 72H62M41 82H55"/></g>${box(106, 60, 87, "RETRIEVE", "violet")}${box(230, 60, 94, "CITE [§2]", "violet")}${wire("M72 75H106M193 75H230", "violet")}<g class="diagram-score"><path d="M113 107H174M113 116H156M113 125H139"/></g>${caption("DOCUMENT → EVIDENCE → GROUNDED ANSWER")}`,
  `${box(16, 65, 78, "REQUEST")}${wire("M94 80H128M202 80H229V40H251M229 80V118H251", "mint")}<path class="diagram-shield" d="M165 29L199 42V77Q199 109 165 127Q131 109 131 77V42Z"/><path class="diagram-check" d="M150 77L161 88L181 64"/>${box(251, 25, 73, "ALLOW", "mint")}${box(251, 103, 73, "REVIEW")}${caption("ACCESS · DATA HANDLING · OUTPUT POLICY")}`,
  `<g class="diagram-stream"><path d="M18 85H45L55 63L68 101L82 72L92 85H116"/>${[28, 55, 83].map((x, i) => `<circle cx="${x}" cy="${35 + i * 8}" r="3"/>`).join("")}</g>${box(135, 65, 81, "INFERENCE", "accent")}${wire("M116 80H135M216 80H247")}${box(247, 65, 77, "REVIEW", "violet")}<text class="diagram-note" x="67" y="119">SYNTHETIC EVENTS</text>${caption("VALIDATE FEATURES · CLASSIFY · OBSERVE")}`,
  `${box(18, 36, 82, "TRACK")}${box(130, 36, 82, "BUILD", "violet")}${box(242, 36, 82, "DEPLOY")}${wire("M100 51H130M212 51H242M283 66V109H59V66", "violet")}${box(129, 94, 85, "OBSERVE", "violet")}${dot(59, 109)}${dot(283, 109)}${caption("VERSIONED ARTIFACTS · EVALUATION FEEDBACK")}`,
  `<g class="diagram-documents"><rect x="17" y="50" width="44" height="58" rx="3"/><path d="M27 65H51M27 75H51M27 85H43"/></g>${box(93, 64, 78, "PARSE", "mint")}${wire("M61 79H93M171 79H202M249 79H275", "mint")}<g class="diagram-record"><rect x="202" y="48" width="47" height="62" rx="3"/><path d="M211 62H240M211 75H240M211 88H240"/></g><g class="diagram-index"><ellipse cx="297" cy="55" rx="22" ry="8"/><path d="M275 55V101C275 112 319 112 319 101V55M275 77C275 88 319 88 319 77"/></g>${caption("DOCUMENT → NORMALIZED RECORD → INDEX")}`,
];
export const conceptVisual = (index) =>
  `<svg viewBox="0 0 340 166" fill="none" focusable="false" aria-hidden="true">${diagrams[index]}</svg>`;
