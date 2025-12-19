// app.js — subtle UX interactions for Mentes en Movimiento

// Footer year
document.addEventListener("DOMContentLoaded", () => {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
});

// Mobile nav panel
(() => {
  const backdrop = document.getElementById("nav-panel-backdrop");
  const panel = document.getElementById("nav-panel");
  const openBtn = document.querySelector("[data-nav-open]");
  const closeBtns = document.querySelectorAll("[data-nav-close]");

  const open = () => {
    if (!backdrop || !panel) return;
    backdrop.style.display = "block";
    panel.style.display = "block";
    panel.setAttribute("aria-hidden", "false");
  };

  const close = () => {
    if (!backdrop || !panel) return;
    backdrop.style.display = "none";
    panel.style.display = "none";
    panel.setAttribute("aria-hidden", "true");
  };

  if (openBtn) openBtn.addEventListener("click", open);
  closeBtns.forEach((b) => b.addEventListener("click", close));

  // Escape key closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();

// Reveal-on-scroll (respect reduced motion)
(() => {
  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const els = document.querySelectorAll("[data-reveal]");
  if (!els.length) return;

  if (prefersReduced) {
    els.forEach(el => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(el => io.observe(el));
})();

// CTA -> preselect topic in contact form
(() => {
  function setTopic(value) {
    const sel = document.getElementById("topic");
    if (!sel) return;
    const values = Array.from(sel.options).map(o => o.value);
    if (values.includes(value)) sel.value = value;
  }

  document.querySelectorAll("[data-set-topic]").forEach((el) => {
    el.addEventListener("click", () => {
      const v = el.getAttribute("data-set-topic");
      if (v) setTopic(v);
    });
  });
})();

// Accordion: one open at a time + smooth height animation
(() => {
  const buttons = document.querySelectorAll("[data-accordion]");
  if (!buttons.length) return;

  function close(btn) {
    const tile = btn.closest(".tile");
    const body = tile?.querySelector(".tile-body");
    if (!body) return;

    btn.setAttribute("aria-expanded", "false");
    // animate close
    body.style.height = body.scrollHeight + "px";
    requestAnimationFrame(() => {
      body.style.height = "0px";
      body.style.opacity = "0";
    });
    body.addEventListener("transitionend", () => {
      body.hidden = true;
      body.style.height = "";
      body.style.opacity = "";
    }, { once: true });
  }

  function open(btn) {
    const tile = btn.closest(".tile");
    const body = tile?.querySelector(".tile-body");
    if (!body) return;

    btn.setAttribute("aria-expanded", "true");
    body.hidden = false;
    body.style.height = "0px";
    body.style.opacity = "0";

    requestAnimationFrame(() => {
      body.style.height = body.scrollHeight + "px";
      body.style.opacity = "1";
    });

    body.addEventListener("transitionend", () => {
      body.style.height = "";
      body.style.opacity = "";
    }, { once: true });
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";

      // close others
      buttons.forEach((b) => {
        if (b !== btn && b.getAttribute("aria-expanded") === "true") close(b);
      });

      if (expanded) close(btn);
      else open(btn);
    });
  });
})();

