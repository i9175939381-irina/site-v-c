/**
 * Кнопки: магнит, свет, демо loading.
 * Блок «Я соединяю»: магнит и смещение подсветки у терминов.
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

  /** Форма контактов: открытие почтового клиента с mailto (статический сайт без бэкенда). */
  function bindContactMailForm() {
    var form = document.getElementById("contact-mail-form");
    if (!form) return;

    var TO = "irana0408@yandex.ru";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var nameEl = form.querySelector('[name="name"]');
      var emailEl = form.querySelector('[name="email"]');
      var msgEl = form.querySelector('[name="message"]');
      var name = nameEl ? nameEl.value.trim() : "";
      var email = emailEl ? emailEl.value.trim() : "";
      var message = msgEl ? msgEl.value.trim() : "";

      var subject = "Сообщение с сайта Vibe Coder";
      if (name) subject += " — " + name;

      var body = "";
      if (name) body += "Имя: " + name + "\n";
      body += "Email для ответа: " + email + "\n\n";
      body += "Сообщение:\n" + message;

      var mailto =
        "mailto:" +
        TO +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);

      window.location.href = mailto;
    });
  }

  function bindWhyTerms(root) {
    if (reduceMotion) return;

    var cap = 5;

    root.querySelectorAll("[data-magnetic-term]").forEach(function (el) {
      function onMove(e) {
        var r = el.getBoundingClientRect();
        var tx = ((e.clientX - r.left) / Math.max(r.width, 1)) * 100;
        var ty = ((e.clientY - r.top) / Math.max(r.height, 1)) * 100;
        el.style.setProperty("--tx", tx.toFixed(1) + "%");
        el.style.setProperty("--ty", ty.toFixed(1) + "%");

        var mx = (e.clientX - r.left - r.width / 2) * 0.18;
        var my = (e.clientY - r.top - r.height / 2) * 0.16;
        el.style.setProperty("--dx", Math.max(-cap, Math.min(cap, mx)).toFixed(2) + "px");
        el.style.setProperty("--dy", Math.max(-cap, Math.min(cap, my)).toFixed(2) + "px");
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
    });
  }

  bindMagneticAndGlow(document);
  bindContactMailForm();
  bindWhyTerms(document);
})();
