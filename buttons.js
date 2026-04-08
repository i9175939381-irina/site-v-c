/**
 * Кнопки: магнит и подсветка по контуру.
 * Блок «Я соединяю»: магнит и смещение подсветки у терминов.
 */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasCoarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;
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
    if (reduceMotion || hasCoarsePointer) return;
    var heroName = root.querySelector(HERO_NAME_SELECTOR);
    if (!heroName) return;
    if (heroName.dataset.heroNameInit === "true") return;

    if (!heroName.classList.contains("hero__name--magnetic")) {
      heroName.classList.add("hero__name--magnetic");
    }
    if (!heroName.hasAttribute("tabindex")) {
      heroName.setAttribute("tabindex", "0");
    }

    var sourceText = (heroName.textContent || "").replace(/\s+/g, " ").trim();
    if (!sourceText) return;

    var frag = document.createDocumentFragment();
    Array.from(sourceText).forEach(function (ch) {
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
      frag.appendChild(span);
    });

    heroName.textContent = "";
    heroName.appendChild(frag);
    heroName.setAttribute("aria-label", sourceText);

    var chars = Array.prototype.slice.call(heroName.querySelectorAll(".hero__name-char"));
    if (!chars.length) return;

    var targetX = 0;
    var targetY = 0;
    var currentX = 0;
    var currentY = 0;
    var rafId = 0;
    var active = false;

    function resetChars() {
      chars.forEach(function (ch) {
        ch.style.transform = "translate3d(0, 0, 0) scale(1)";
      });
    }

    function frame() {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;
      heroName.style.setProperty("--dx", currentX.toFixed(2) + "px");
      heroName.style.setProperty("--dy", currentY.toFixed(2) + "px");
      if (active && Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.02) {
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
      var rx = (e.clientX - rect.left) / Math.max(rect.width, 1);
      var ry = (e.clientY - rect.top) / Math.max(rect.height, 1);

      var localX = e.clientX - rect.left - rect.width / 2;
      var localY = e.clientY - rect.top - rect.height / 2;
      targetX = Math.max(-7, Math.min(7, localX * 0.09));
      targetY = Math.max(-5, Math.min(5, localY * 0.07));
      heroName.style.setProperty("--tx", (rx * 100).toFixed(1) + "%");
      heroName.style.setProperty("--ty", (ry * 100).toFixed(1) + "%");
      active = true;

      chars.forEach(function (ch) {
        var c = ch.getBoundingClientRect();
        var cx = c.left + c.width / 2;
        var cy = c.top + c.height / 2;
        var dx = e.clientX - cx;
        var dy = e.clientY - cy;
        var dist = Math.hypot(dx, dy);
        var radius = 150;
        var t = Math.max(0, 1 - dist / radius);
        var influence = t * t;

        var moveX = (-dx / Math.max(dist, 1)) * influence * 5.5;
        var moveY = (-dy / Math.max(dist, 1)) * influence * 2.4;
        var scaleX = 1 + influence * 0.14;
        var scaleY = 1 - influence * 0.06;
        ch.style.transform =
          "translate3d(" + moveX.toFixed(2) + "px, " + moveY.toFixed(2) + "px, 0) scale(" +
          scaleX.toFixed(3) + ", " + scaleY.toFixed(3) + ")";
      });

      ensureFrame();
    }

    function onLeave() {
      active = false;
      targetX = 0;
      targetY = 0;
      heroName.style.setProperty("--tx", "50%");
      heroName.style.setProperty("--ty", "50%");
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
