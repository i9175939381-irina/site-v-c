/**
 * Кнопки: магнит и подсветка по контуру.
 * Блок «Я соединяю»: магнит и смещение подсветки у терминов.
 */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const magneticMax = 6;
  const HERO_NAME_SELECTOR = ".hero__name--magnetic, .hero__name.name";
  const GENERIC_MAGNETIC_SELECTOR = "[data-magnetic-term]:not(.hero__name--magnetic)";

  function bindMagneticTerm(el, options) {
    if (reduceMotion || !el || el.dataset.magneticBound === "true") return;

    var capX = options && typeof options.capX === "number" ? options.capX : 5;
    var capY = options && typeof options.capY === "number" ? options.capY : 5;
    var kx = options && typeof options.kx === "number" ? options.kx : 0.18;
    var ky = options && typeof options.ky === "number" ? options.ky : 0.16;

    function onMove(e) {
      var r = el.getBoundingClientRect();
      var tx = ((e.clientX - r.left) / Math.max(r.width, 1)) * 100;
      var ty = ((e.clientY - r.top) / Math.max(r.height, 1)) * 100;
      el.style.setProperty("--tx", tx.toFixed(1) + "%");
      el.style.setProperty("--ty", ty.toFixed(1) + "%");

      var mx = (e.clientX - r.left - r.width / 2) * kx;
      var my = (e.clientY - r.top - r.height / 2) * ky;
      el.style.setProperty("--dx", Math.max(-capX, Math.min(capX, mx)).toFixed(2) + "px");
      el.style.setProperty("--dy", Math.max(-capY, Math.min(capY, my)).toFixed(2) + "px");
    }

    function onLeave() {
      el.style.setProperty("--tx", "50%");
      el.style.setProperty("--ty", "50%");
      el.style.setProperty("--dx", "0px");
      el.style.setProperty("--dy", "0px");
    }

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointercancel", onLeave);
    el.dataset.magneticBound = "true";
  }

  function bindMagneticAndGlow(root) {
    if (reduceMotion) return;

    root.querySelectorAll(".btn--primary, .btn--secondary, .btn--ghost, .btn--warm").forEach(function (el) {
      function onMove(e) {
        if (el.classList.contains("btn--is-loading")) return;
        var r = el.getBoundingClientRect();
        var px = ((e.clientX - r.left) / Math.max(r.width, 1)) * 100;
        var py = ((e.clientY - r.top) / Math.max(r.height, 1)) * 100;
        el.style.setProperty("--cx", px.toFixed(2) + "%");
        el.style.setProperty("--cy", py.toFixed(2) + "%");

        var k = el.classList.contains("btn--primary") ? 0.11 : 0.09;
        var mx = (e.clientX - r.left - r.width / 2) * k;
        var my = (e.clientY - r.top - r.height / 2) * k;
        el.style.setProperty(
          "--mag-x",
          Math.max(-magneticMax, Math.min(magneticMax, mx)).toFixed(2) + "px"
        );
        el.style.setProperty(
          "--mag-y",
          Math.max(-magneticMax, Math.min(magneticMax, my)).toFixed(2) + "px"
        );
      }

      function onLeave() {
        el.style.setProperty("--cx", "50%");
        el.style.setProperty("--cy", "50%");
        el.style.setProperty("--mag-x", "0px");
        el.style.setProperty("--mag-y", "0px");
      }

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      el.addEventListener("pointercancel", onLeave);
    });
  }

  function bindWhyTerms(root) {
    if (reduceMotion) return;
    root.querySelectorAll(GENERIC_MAGNETIC_SELECTOR).forEach(function (el) {
      bindMagneticTerm(el, { capX: 5, capY: 5, kx: 0.18, ky: 0.16 });
    });
  }

  function bindHeroNameMagnet(root) {
    var heroName = root.querySelector(HERO_NAME_SELECTOR);
    if (!heroName) return;
    if (heroName.dataset.heroNameInit === "true") return;
    var disableInteractive =
      reduceMotion ||
      window.matchMedia("(max-width: 900px), (hover: none), (pointer: coarse)").matches;

    if (!heroName.classList.contains("hero__name--magnetic")) {
      heroName.classList.add("hero__name--magnetic");
    }
    if (!heroName.hasAttribute("tabindex")) {
      heroName.setAttribute("tabindex", "0");
    }

    var sourceText = (heroName.textContent || "").replace(/\s+/g, " ").trim();
    if (!sourceText) return;

    function buildLine(text) {
      var line = document.createElement("span");
      line.className = "hero__name-line";
      line.setAttribute("aria-hidden", "true");
      Array.from(text).forEach(function (ch) {
        var span = document.createElement("span");
        if (ch === " ") {
          span.className = "hero__name-space";
          span.setAttribute("aria-hidden", "true");
          span.textContent = " ";
        } else {
          span.className = "hero__name-char";
          span.setAttribute("aria-hidden", "true");
          span.textContent = ch;
        }
        line.appendChild(span);
      });
      return line;
    }

    var parts = sourceText.split(" ");
    var firstLine = parts[0] || "";
    var secondLine = parts.slice(1).join(" ");
    if (!secondLine) secondLine = "";

    var frag = document.createDocumentFragment();
    frag.appendChild(buildLine(firstLine));
    if (secondLine) {
      frag.appendChild(buildLine(secondLine));
    }

    heroName.textContent = "";
    heroName.appendChild(frag);
    heroName.setAttribute("aria-label", sourceText);

    // Keep identical typography/line rendering on all devices.
    // Only interactive motion is disabled on mobile/reduced-motion.
    if (disableInteractive) {
      heroName.dataset.heroNameInit = "true";
      return;
    }

    var chars = Array.prototype.slice.call(heroName.querySelectorAll(".hero__name-char"));
    if (!chars.length) return;
    var charState = chars.map(function () {
      return { x: 0, y: 0, sx: 1, sy: 1, tx: 0, ty: 0, tsx: 1, tsy: 1 };
    });

    var targetX = 0;
    var targetY = 0;
    var currentX = 0;
    var currentY = 0;
    var rafId = 0;
    var active = false;

    function resetChars() {
      charState.forEach(function (s) {
        s.tx = 0;
        s.ty = 0;
        s.tsx = 1;
        s.tsy = 1;
      });
    }

    function frame() {
      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;
      heroName.style.setProperty("--dx", currentX.toFixed(2) + "px");
      heroName.style.setProperty("--dy", currentY.toFixed(2) + "px");
      var charsStillMoving = false;
      chars.forEach(function (ch, i) {
        var s = charState[i];
        s.x += (s.tx - s.x) * 0.22;
        s.y += (s.ty - s.y) * 0.22;
        s.sx += (s.tsx - s.sx) * 0.2;
        s.sy += (s.tsy - s.sy) * 0.2;
        ch.style.transform =
          "translate3d(" + s.x.toFixed(2) + "px, " + s.y.toFixed(2) + "px, 0) scale(" +
          s.sx.toFixed(3) + ", " + s.sy.toFixed(3) + ")";
        if (
          Math.abs(s.tx - s.x) > 0.02 ||
          Math.abs(s.ty - s.y) > 0.02 ||
          Math.abs(s.tsx - s.sx) > 0.001 ||
          Math.abs(s.tsy - s.sy) > 0.001
        ) {
          charsStillMoving = true;
        }
      });
      if ((active && Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.02) || charsStillMoving) {
        rafId = window.requestAnimationFrame(frame);
      } else {
        rafId = 0;
      }
    }

    function ensureFrame() {
      if (!rafId) rafId = window.requestAnimationFrame(frame);
    }

    function onMove(e) {
      var rect = heroName.getBoundingClientRect();
      var localX = e.clientX - rect.left - rect.width / 2;
      var localY = e.clientY - rect.top - rect.height / 2;
      targetX = Math.max(-7.2, Math.min(7.2, localX * 0.09));
      targetY = Math.max(-4.8, Math.min(4.8, localY * 0.072));
      active = true;

      var progressX = (e.clientX - rect.left) / Math.max(rect.width, 1);
      chars.forEach(function (ch, i) {
        var c = ch.getBoundingClientRect();
        var cx = c.left + c.width / 2;
        var cy = c.top + c.height / 2;
        var dx = e.clientX - cx;
        var dy = e.clientY - cy;
        var dist = Math.hypot(dx, dy);
        var radius = 178;
        var t = Math.max(0, 1 - dist / radius);
        var influence = t * t;
        var pos = i / Math.max(chars.length - 1, 1);
        var accordion = 1 - Math.min(1, Math.abs(pos - progressX) * 2.4);
        var wave = influence * (0.68 + accordion * 0.7);

        var moveX = (-dx / Math.max(dist, 1)) * wave * 5.6;
        var moveY = (-dy / Math.max(dist, 1)) * wave * 2.2;
        var stretch = wave * 0.11;
        var scaleX = 1 + stretch;
        var scaleY = 1 - stretch * 0.45;

        var s = charState[i];
        s.tx = moveX;
        s.ty = moveY;
        s.tsx = scaleX;
        s.tsy = scaleY;
      });

      ensureFrame();
    }

    function onLeave() {
      active = false;
      targetX = 0;
      targetY = 0;
      resetChars();
      ensureFrame();
    }

    heroName.addEventListener("pointermove", onMove);
    heroName.addEventListener("pointerleave", onLeave);
    heroName.addEventListener("pointercancel", onLeave);
    heroName.dataset.heroNameInit = "true";
  }

  function bindContactModal() {
    var modal = document.getElementById("contact-modal");
    var form = document.getElementById("contact-modal-form");
    var success = document.getElementById("contact-modal-success");
    if (!modal || !form) return;

    var backdrop = modal.querySelector(".contact-modal__backdrop");
    var closeBtn = modal.querySelector(".contact-modal__close");
    var successClose = modal.querySelector(".contact-modal__success-close");
    var firstInput = document.getElementById("modal-name");

    function openModal() {
      modal.classList.add("contact-modal--open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (firstInput) {
        window.setTimeout(function () {
          firstInput.focus();
        }, 100);
      }
    }

    function closeModal() {
      modal.classList.remove("contact-modal--open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      form.reset();
      form.hidden = false;
      if (success) {
        success.hidden = true;
      }
    }

    document.addEventListener("click", function (e) {
      var opener = e.target.closest && e.target.closest(".js-open-contact-modal");
      if (!opener) return;
      e.preventDefault();
      openModal();
    });

    if (backdrop) {
      backdrop.addEventListener("click", closeModal);
    }
    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
    }
    if (successClose) {
      successClose.addEventListener("click", closeModal);
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("contact-modal--open")) {
        closeModal();
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      form.hidden = true;
      if (success) {
        success.hidden = false;
        var okBtn = success.querySelector(".contact-modal__success-close");
        if (okBtn) {
          okBtn.focus();
        }
      }
    });
  }

  bindMagneticAndGlow(document);
  bindHeroNameMagnet(document);
  bindWhyTerms(document);
  bindContactModal();
})();
