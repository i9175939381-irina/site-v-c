(function () {
  "use strict";

  const root = document.querySelector("[data-hero-name]");
  if (!root) return;

  var reducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const raw = root.dataset.heroNameLines || "Ирина|Филатова";
  const lines = raw.split("|").map(function (s) {
    return s.trim();
  });

  const fallback = root.querySelector(".hero__name-fallback");

  /* Статичная подпись Marck Script из CSS; без разбиения на буквы */
  if (reducedMotion) return;

  if (fallback) fallback.remove();

  const wrap = document.createElement("span");
  wrap.className = "hero__name-lines";
  wrap.setAttribute("aria-hidden", "true");

  lines.forEach(function (line) {
    const row = document.createElement("span");
    row.className = "hero__name-line";
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      var span = document.createElement("span");
      span.className = "hero__name-char";
      span.textContent = ch;
      row.appendChild(span);
    }
    wrap.appendChild(row);
  });

  root.appendChild(wrap);

  var chars = root.querySelectorAll(".hero__name-char");
  if (!chars.length) return;

  root.classList.add("hero__name--interactive");

  /* Зона реакции — весь блок с фото и подписью, чтобы события не терялись */
  var zone = root.closest(".hero__visual") || root;

  var lx = 0;
  var ly = 0;
  var scheduled = false;

  function update() {
    scheduled = false;
    for (var i = 0; i < chars.length; i++) {
      var el = chars[i];
      var r = el.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      var dx = lx - cx;
      var dy = ly - cy;
      var dist = Math.hypot(dx, dy) + 28;
      var influence = Math.min(1.5, 440 / dist);
      var tx = (dx / dist) * 18 * influence;
      var ty = (dy / dist) * 14 * influence;
      var rot = (dx / dist) * 8 * influence;
      el.style.transform =
        "translate(" + tx.toFixed(2) + "px," + ty.toFixed(2) + "px) rotate(" + rot.toFixed(2) + "deg)";
    }
  }

  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }

  function onPointerMove(e) {
    lx = e.clientX;
    ly = e.clientY;
    scheduleUpdate();
  }

  function reset() {
    for (var i = 0; i < chars.length; i++) {
      chars[i].style.transform = "";
    }
  }

  zone.addEventListener("pointermove", onPointerMove, { passive: true });
  zone.addEventListener("pointerleave", reset, { passive: true });
  zone.addEventListener("pointercancel", reset, { passive: true });
})();
