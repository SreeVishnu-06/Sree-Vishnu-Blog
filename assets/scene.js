import {
  onFrame,
  onResize,
  onMotionChange,
  requestFrame,
  motionEnabled,
  finePointer,
  pointer,
  viewport,
  clamp,
} from "./runtime.js";
export function initCore() {
  const scene = document.querySelector(".core-scene"),
    canvas = document.querySelector("#core-canvas");
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;
  let bounds,
    visible = true,
    angle = 0.5,
    px = 0,
    py = 0,
    needsDraw = true;
  const points = [],
    faces = [];
  const segments = 64,
    sides = 8;
  function rotate(x, y, z, rx, ry, rz = 0) {
    let a = y * Math.cos(rx) - z * Math.sin(rx),
      b = y * Math.sin(rx) + z * Math.cos(rx);
    let c = x * Math.cos(ry) + b * Math.sin(ry),
      d = -x * Math.sin(ry) + b * Math.cos(ry);
    return [
      c * Math.cos(rz) - a * Math.sin(rz),
      c * Math.sin(rz) + a * Math.cos(rz),
      d,
    ];
  }
  for (let ring = 0; ring < 3; ring++) {
    const offset = points.length;
    for (let i = 0; i < segments; i++)
      for (let j = 0; j < sides; j++) {
        const u = (i / segments) * Math.PI * 2,
          v = (j / sides) * Math.PI * 2;
        const position = rotate(
          (145 + 10 * Math.cos(v)) * Math.cos(u),
          (145 + 10 * Math.cos(v)) * Math.sin(u),
          10 * Math.sin(v),
          ring === 0 ? 0.65 : 1.15,
          ring * 0.9,
          ring * 1.05,
        );
        const normal = rotate(
          Math.cos(v) * Math.cos(u),
          Math.cos(v) * Math.sin(u),
          Math.sin(v),
          ring === 0 ? 0.65 : 1.15,
          ring * 0.9,
          ring * 1.05,
        );
        points.push({ position, normal });
        faces.push({
          ids: [
            offset + i * sides + j,
            offset + ((i + 1) % segments) * sides + j,
            offset + ((i + 1) % segments) * sides + ((j + 1) % sides),
            offset + i * sides + ((j + 1) % sides),
          ],
          ring,
        });
      }
  }
  const projected = points.map(() => ({ x: 0, y: 0, z: 0, light: 0 }));
  function size() {
    const rect = scene.getBoundingClientRect();
    bounds = {
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top + scrollY,
    };
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    needsDraw = true;
    requestFrame();
  }
  onResize(size);
  onMotionChange(() => {
    needsDraw = true;
    requestFrame();
  });
  size();
  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      canvas.dataset.renderState = visible ? "ready" : "offscreen";
      if (visible) {
        needsDraw = true;
        requestFrame();
      }
    },
    { rootMargin: "60px" },
  );
  observer.observe(scene);
  function draw(time) {
    const w = canvas.width,
      h = canvas.height,
      scale = Math.min(w, h) / 470;
    context.clearRect(0, 0, w, h);
    context.save();
    context.translate(w / 2, h / 2);
    context.scale(scale, scale);
    const glow = context.createRadialGradient(0, 0, 15, 0, 0, 230);
    glow.addColorStop(0, "#428bac22");
    glow.addColorStop(0.55, "#18384c14");
    glow.addColorStop(1, "#080a0d00");
    context.fillStyle = glow;
    context.fillRect(-250, -250, 500, 500);
    const mx =
        ((pointer.x - bounds.left - bounds.width / 2) / bounds.width) * 470,
      my =
        ((pointer.y - (bounds.top - viewport.scroll) - bounds.height / 2) /
          bounds.height) *
        470;
    // A restrained, cursor-reactive precision field sits behind the sculpture.
    for (let x = -210; x <= 210; x += 35)
      for (let y = -210; y <= 210; y += 35) {
        const dx = x - mx,
          dy = y - my,
          distance = Math.hypot(dx, dy),
          force =
            motionEnabled() && pointer.present
              ? Math.max(0, 1 - distance / 110) * 8
              : 0;
        context.fillStyle =
          distance < 110 && pointer.present ? "#91c4dc65" : "#566c7c30";
        context.fillRect(
          x + (dx / (distance || 1)) * force,
          y + (dy / (distance || 1)) * force,
          1,
          1,
        );
      }
    context.strokeStyle = "#5e83982b";
    context.lineWidth = 0.6;
    context.beginPath();
    context.arc(0, 0, 205, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([1, 10]);
    context.beginPath();
    context.arc(0, 0, 221, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([]);
    const scroll = clamp((viewport.scroll - bounds.top + 120) / 800, -0.2, 1);
    const rx = 0.35 + py * 0.18 + scroll * 0.22,
      ry = angle + px * 0.25;
    points.forEach((point, i) => {
      const [x, y, z] = rotate(...point.position, rx, ry);
      const [nx, ny, nz] = rotate(...point.normal, rx, ry);
      const perspective = 600 / (600 - z);
      const p = projected[i];
      p.x = x * perspective;
      p.y = y * perspective;
      p.z = z;
      const diffuse = Math.max(0, -nx * 0.4 - ny * 0.65 + nz * 0.55);
      const spec = Math.pow(
        Math.max(0, -nx * 0.25 - ny * 0.45 + nz * 0.85),
        16,
      );
      p.light = 28 + diffuse * 115 + spec * 125;
    });
    faces.forEach((face) => {
      face.depth = face.ids.reduce((sum, id) => sum + projected[id].z, 0) / 4;
    });
    faces.sort((a, b) => a.depth - b.depth);
    const sphere = () => {
      const g = context.createRadialGradient(-21, -23, 1, 3, 4, 50);
      g.addColorStop(0, "#f2fbff");
      g.addColorStop(0.19, "#aab9c4");
      g.addColorStop(0.33, "#506373");
      g.addColorStop(0.54, "#12202d");
      g.addColorStop(0.73, "#080c13");
      g.addColorStop(0.88, "#3d6277");
      g.addColorStop(1, "#9ec6d8");
      context.fillStyle = g;
      context.beginPath();
      context.arc(0, 0, 47, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = "#d2f3ff77";
      context.lineWidth = 0.6;
      context.stroke();
      context.strokeStyle = "#66e4ff44";
      context.beginPath();
      context.ellipse(0, 0, 49, 17, angle * 0.4, 0, Math.PI * 2);
      context.stroke();
    };
    let sphereDrawn = false;
    for (const face of faces) {
      if (!sphereDrawn && face.depth > 0) {
        sphere();
        sphereDrawn = true;
      }
      const verts = face.ids.map((id) => projected[id]),
        light = verts.reduce((sum, p) => sum + p.light, 0) / 4;
      context.fillStyle = `rgb(${Math.round(light * 0.91)} ${Math.round(light * 0.98)} ${Math.round(Math.min(255, light * 1.06))})`;
      context.beginPath();
      context.moveTo(verts[0].x, verts[0].y);
      for (let i = 1; i < 4; i++) context.lineTo(verts[i].x, verts[i].y);
      context.closePath();
      context.fill();
    }
    for (let i = 0; i < 3; i++) {
      const u = time * 0.00025 + (i * Math.PI * 2) / 3;
      const [x, y, z] = rotate(
        184 * Math.cos(u),
        184 * Math.sin(u),
        0,
        0.9,
        ry * 0.5,
        i * 0.6,
      );
      const perspective = 600 / (600 - z);
      context.fillStyle = "#b8f5ff";
      context.shadowColor = "#66e4ff";
      context.shadowBlur = 12;
      context.beginPath();
      context.arc(x * perspective, y * perspective, 2.5, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
    }
    context.restore();
    scene.classList.add("scene-ready");
  }
  let elapsed = 0;
  onFrame(({ dt }) => {
    const animated =
      visible &&
      motionEnabled() &&
      viewport.width > 800 &&
      finePointer.matches &&
      !document.querySelector("dialog[open]");
    if (!visible) return false;
    if (animated) {
      elapsed += dt;
      angle += dt * 0.00016;
      const tx = pointer.present
          ? clamp((pointer.x - bounds.left) / bounds.width - 0.5, -0.6, 0.6)
          : 0,
        ty = pointer.present
          ? clamp(
              (pointer.y - (bounds.top - viewport.scroll)) / bounds.height -
                0.5,
              -0.6,
              0.6,
            )
          : 0;
      px += (tx - px) * 0.06;
      py += (ty - py) * 0.06;
      draw(elapsed);
      canvas.dataset.renderState = "animated";
    } else if (needsDraw) {
      draw(elapsed);
      canvas.dataset.renderState = "static";
    }
    needsDraw = false;
    return animated;
  });
}
