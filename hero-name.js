(function () {
  const root = document.querySelector("[data-hero-name]");
  if (!root) return;

  const raw = root.dataset.heroNameLines || "Ирина|Филатова";
  const lines = raw.split("|").map((s) => s.trim());

  const reduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) return;

  const fallback = root.querySelector(".hero__name-fallback");
  if (fallback) fallback.remove();

  const wrap = document.createElement("span");
  wrap.className = "hero__name-lines";
  wrap.setAttribute("aria-hidden", "true");

  lines.forEach((line) => {
    const row = document.createElement("span");
    row.className = "hero__name-line";
    for (const ch of line) {
      const span = document.createElement("span");
      span.className = "hero__name-char";
      span.textContent = ch;
      row.appendChild(span);
    }
    wrap.appendChild(row);
  });

  root.appendChild(wrap);

  const chars = Array.from(root.querySelectorAll(".hero__name-char"));
  if (!chars.length) return;

  root.classList.add("hero__name--interactive");

  let raf = 0;

  function update(clientX, clientY) {
    chars.forEach((el) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const dist = Math.hypot(dx, dy) + 24;
      const influence = Math.min(1.35, 380 / dist);
      const tx = (dx / dist) * 15 * influence;
      const ty = (dy / dist) * 11 * influence;
      const rot = (dx / dist) * 6 * influence;
      el.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) rotate(${rot.toFixed(2)}deg)`;
    });
  }

  function reset() {
    chars.forEach((el) => {
      el.style.transform = "";
    });
  }

  root.addEventListener(
    "pointermove",
    (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        update(e.clientX, e.clientY);
      });
    },
    { passive: true }
  );

  root.addEventListener("pointerleave", reset, { passive: true });
  root.addEventListener("pointercancel", reset, { passive: true });
})();
