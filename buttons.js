/**
 * Интерактив только для кнопок: мягкий «магнит», след света по курсору, демо loading.
 */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const magneticMax = 6;

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

  function bindContactDemo() {
    var demo = document.getElementById("contact-send-demo");
    if (!demo) return;

    var copy = demo.querySelector(".btn__copy");
    var idleText = copy ? copy.textContent.trim() : "";

    demo.addEventListener("click", function () {
      if (
        demo.classList.contains("btn--is-loading") ||
        demo.classList.contains("btn--is-done")
      ) {
        return;
      }

      demo.classList.add("btn--is-loading");
      demo.setAttribute("aria-busy", "true");
      if (copy) copy.textContent = "Принимаю…";

      window.setTimeout(function () {
        demo.classList.remove("btn--is-loading");
        demo.classList.add("btn--is-done");
        demo.setAttribute("aria-busy", "false");
        if (copy) copy.textContent = "Принято";

        window.setTimeout(function () {
          demo.classList.remove("btn--is-done");
          if (copy) copy.textContent = idleText;
        }, 2000);
      }, reduceMotion ? 900 : 2200);
    });
  }

  bindMagneticAndGlow(document);
  bindContactDemo();
})();
