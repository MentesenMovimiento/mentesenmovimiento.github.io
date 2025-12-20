/* assets/script.js
   Site global JS (services expand + timeline + navbar threshold logic) */
(function () {
  // -------------------------------
  // FOOTER YEAR
  // -------------------------------
  const yearElem = document.getElementById("year");
  if (yearElem) yearElem.textContent = new Date().getFullYear();

  // -------------------------------
  // NAVBAR: FIXED + AUTO-HIDE AFTER 40%
  // Visible (sticky) for first 40% of total scroll.
  // After 40%: hide on scroll down, show on scroll up.
  // -------------------------------
  const header = document.querySelector(".site-header.auto-hide");
  let lastScroll = window.pageYOffset || 0;
  let ticking = false;
  let threshold = 0;

  const computeThreshold = () => {
    const doc = document.documentElement;
    const maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight);
    threshold = maxScroll * 0.40; // 40%
  };

  const handleHeaderOnScroll = () => {
    if (!header) return;
    const current = window.pageYOffset || 0;

    // Always visible for first 40%
    if (current <= threshold) {
      header.classList.remove("hide");
      lastScroll = current;
      return;
    }

    // hysteresis to prevent flicker
    if (current > lastScroll + 10) header.classList.add("hide"); // down
    else if (current < lastScroll - 10) header.classList.remove("hide"); // up

    lastScroll = current;
  };

  const onScrollRaf = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      handleHeaderOnScroll();
      ticking = false;
    });
  };

  if (header) {
    computeThreshold();
    window.addEventListener("resize", computeThreshold, { passive: true });
    window.addEventListener("scroll", onScrollRaf, { passive: true });
    handleHeaderOnScroll();
  }

  // -------------------------------
  // NAVIGATION SCROLL-SPY
  // -------------------------------
  (function () {
    const navLinks = document.querySelectorAll(".nav-menu .nav-link");
    const sections = Array.from(navLinks)
      .map((link) => {
        const href = link.getAttribute("href");
        if (!href || !href.startsWith("#")) return null;
        const target = document.querySelector(href);
        return target ? { link, target } : null;
      })
      .filter(Boolean);

    function onScrollSpy() {
      const y = window.pageYOffset + window.innerHeight / 3;
      sections.forEach(({ link, target }) => {
        const top = target.offsetTop;
        const bottom = top + target.offsetHeight;
        if (y >= top && y < bottom) {
          navLinks.forEach((l) => l.classList.remove("active"));
          link.classList.add("active");
        }
      });
    }

    window.addEventListener("scroll", onScrollSpy, { passive: true });
    window.addEventListener("resize", onScrollSpy, { passive: true });
    document.addEventListener("DOMContentLoaded", onScrollSpy);
  })();

  // -------------------------------
  // MOBILE NAV TOGGLE (ARIA + [hidden])
  // -------------------------------
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-menu]");
  if (navToggle && navMenu) {
    const setMenuVisibility = (show) => {
      navToggle.setAttribute("aria-expanded", String(show));
      navMenu.classList.toggle("open", show);
      if (show) navMenu.removeAttribute("hidden");
      else navMenu.setAttribute("hidden", "");
    };

    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      setMenuVisibility(!expanded);
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth < 900) setMenuVisibility(false);
      });
    });
  }

  // -------------------------------
  // SERVICES: EXPAND ON CLICK (single-open)
  // -------------------------------
  (function () {
    const grid = document.querySelector("[data-services]");
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll("[data-service]"));

    const closeAll = (exceptCard) => {
      cards.forEach((card) => {
        if (exceptCard && card === exceptCard) return;
        card.classList.remove("is-expanded");
        const hit = card.querySelector(".service-hit");
        if (hit) hit.setAttribute("aria-expanded", "false");
      });
    };

    cards.forEach((card) => {
      const hit = card.querySelector(".service-hit");
      if (!hit) return;

      hit.addEventListener("click", (e) => {
        e.preventDefault();

        const isOpen = card.classList.contains("is-expanded");
        closeAll(card);

        if (!isOpen) {
          card.classList.add("is-expanded");
          hit.setAttribute("aria-expanded", "true");
        } else {
          card.classList.remove("is-expanded");
          hit.setAttribute("aria-expanded", "false");
        }
      });

      // Keyboard UX: Escape closes
      card.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          closeAll();
        }
      });
    });

    // Clicking outside closes
    document.addEventListener("click", (e) => {
      const clickedInside = e.target.closest("[data-services]");
      if (!clickedInside) closeAll();
    });
  })();

  // -------------------------------
  // TIMELINE: Auto-advance + titles always visible
  // - Auto rotates every 6s
  // - Clicking a title selects it (title grows)
  // - Content panel updates
  // - Arrows allow prev/next
  // -------------------------------
  (function () {
    const root = document.querySelector("[data-timeline]");
    if (!root) return;

    const titles = Array.from(root.querySelectorAll(".timeline-title"));
    const contentEl = root.querySelector("[data-timeline-content]");
    const prevBtn = root.querySelector("[data-timeline-prev]");
    const nextBtn = root.querySelector("[data-timeline-next]");
    const bar = root.querySelector("[data-timeline-bar]");

    const steps = [
      {
        title: "Explorar",
        body: "Escuchar y observar con atención, recopilando contexto familiar y escolar para entender fortalezas y retos reales.",
      },
      {
        title: "Evaluar",
        body: "Evaluar funciones y habilidades en contextos reales para identificar necesidades y prioridades de intervención.",
      },
      {
        title: "Planificar",
        body: "Diseñar un plan centrado en objetivos claros, medibles y relevantes para el niño y su entorno.",
      },
      {
        title: "Implementar",
        body: "Aplicar estrategias y prácticas funcionales en la vida diaria del niño, con ajustes continuos.",
      },
      {
        title: "Revisar",
        body: "Monitorear resultados, recopilar retroalimentación y adaptar el plan para fomentar autonomía y bienestar.",
      },
    ];

    let index = 0;
    let timer = null;
    let lastInteraction = Date.now();
    const INTERVAL = 6000;

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const render = (i) => {
      index = (i + steps.length) % steps.length;

      titles.forEach((btn, n) => {
        const active = n === index;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", String(active));
      });

      if (contentEl) {
        const step = steps[index];
        contentEl.innerHTML = `
          <h3>${step.title}</h3>
          <p>${step.body}</p>
        `;
      }

      // progress bar (simple reset + animate via JS)
      if (bar && !prefersReducedMotion) {
        bar.style.transition = "none";
        bar.style.width = "0%";
        // force reflow
        void bar.offsetWidth;
        bar.style.transition = `width ${INTERVAL}ms linear`;
        bar.style.width = "100%";
      } else if (bar) {
        bar.style.width = "100%";
      }
    };

    const next = () => render(index + 1);
    const prev = () => render(index - 1);

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };

    const start = () => {
      if (prefersReducedMotion) return; // don't auto-rotate for reduced motion users
      stop();
      timer = window.setInterval(() => {
        // if user interacted very recently, give them a breather
        if (Date.now() - lastInteraction < 1200) return;
        next();
      }, INTERVAL);
    };

    const interact = () => {
      lastInteraction = Date.now();
      start();
    };

    titles.forEach((btn) => {
      btn.addEventListener("click", () => {
        const stepIndex = Number(btn.getAttribute("data-step"));
        render(Number.isFinite(stepIndex) ? stepIndex : 0);
        interact();
      });

      // keyboard support (left/right)
      btn.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); next(); interact(); }
        if (e.key === "ArrowLeft") { e.preventDefault(); prev(); interact(); }
      });
    });

    if (nextBtn) nextBtn.addEventListener("click", () => { next(); interact(); });
    if (prevBtn) prevBtn.addEventListener("click", () => { prev(); interact(); });

    // pause on hover/focus
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", start);

    render(0);
    start();
  })();

  // -------------------------------
  // INSTAGRAM EMBED ANIMATION
  // -------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    const instaBlocks = document.querySelectorAll(".insta-embeds .instagram-media");
    instaBlocks.forEach((block, i) => {
      block.style.animationDelay = `${i * 0.15}s`;
    });
  });

  // -------------------------------
  // BLOG CARD APPEAR ON SCROLL
  // -------------------------------
  const blogCards = document.querySelectorAll(".blog-card");
  if (blogCards.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.animationPlayState = "running";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    blogCards.forEach((card) => {
      card.style.animationPlayState = "paused";
      observer.observe(card);
    });
  }

  // -------------------------------
  // CONTACT FORM SUBMISSION
  // -------------------------------
  const contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(contactForm);
      const submitUrl = contactForm.getAttribute("action");

      try {
        const response = await fetch(submitUrl, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          const successElem = document.getElementById("contact-success");
          if (successElem) {
            successElem.hidden = false;       // IMPORTANT: unhide
            successElem.classList.add("show");
          }
          contactForm.classList.add("hidden");
        } else {
          alert("Hubo un error al enviar tu mensaje. Intenta de nuevo más tarde.");
        }
      } catch (err) {
        alert("Error de red. Verifica tu conexión e intenta de nuevo.");
      }
    });
  }
})();
