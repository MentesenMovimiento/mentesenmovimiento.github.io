/* assets/script.js */
(function () {
  // FOOTER YEAR
  const yearElem = document.getElementById("year");
  if (yearElem) yearElem.textContent = new Date().getFullYear();

  // NAVBAR: visible for first 40% then hide on down / show on up
  const header = document.querySelector(".site-header.auto-hide");
  let lastScroll = window.pageYOffset || 0;
  let ticking = false;
  let threshold = 0;

  const computeThreshold = () => {
    const doc = document.documentElement;
    const maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight);
    threshold = maxScroll * 0.40;
  };

  const handleHeaderOnScroll = () => {
    if (!header) return;
    const current = window.pageYOffset || 0;

    if (current <= threshold) {
      header.classList.remove("hide");
      lastScroll = current;
      return;
    }

    if (current > lastScroll + 10) header.classList.add("hide");
    else if (current < lastScroll - 10) header.classList.remove("hide");

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

  // SCROLL SPY
  (function () {
    const navLinks = document.querySelectorAll(".nav-menu .nav-link");
    const sections = Array.from(navLinks)
      .map((link) => {
        const href = link.getAttribute("href");
        if (!href || !href.includes("#")) return null;
        const hash = href.substring(href.indexOf("#"));
        const target = document.querySelector(hash);
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

  // MOBILE NAV TOGGLE
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-menu]");
  if (navToggle && navMenu) {
    const setMenuVisibility = (show) => {
      navToggle.setAttribute("aria-expanded", String(show));
      navMenu.classList.toggle("open", show);
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

  // SERVICES: expand on click (single-open) + generalized dynamic layout classing
  (function () {
    const grid = document.querySelector("[data-services]");
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll("[data-service]"));
    const EXPANDED_CLASS_PREFIX = "expanded-";

    const clearExpandedStateClasses = () => {
      grid.classList.remove("has-expanded");
      Array.from(grid.classList).forEach((cls) => {
        if (cls.startsWith(EXPANDED_CLASS_PREFIX)) grid.classList.remove(cls);
      });
    };

    const applyExpandedStateClasses = () => {
      clearExpandedStateClasses();

      const expandedCard = grid.querySelector(".service-card.is-expanded");
      if (!expandedCard) return;

      const id = expandedCard.getAttribute("data-service-id") || "";
      if (!id) return;

      grid.classList.add("has-expanded");
      grid.classList.add(`${EXPANDED_CLASS_PREFIX}${id}`);
    };

    const closeAll = (exceptCard) => {
      cards.forEach((card) => {
        if (exceptCard && card === exceptCard) return;
        card.classList.remove("is-expanded");
        const hit = card.querySelector(".service-hit");
        if (hit) hit.setAttribute("aria-expanded", "false");
      });
      applyExpandedStateClasses();
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

        applyExpandedStateClasses();
      });

      card.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAll();
      });
    });

    document.addEventListener("click", (e) => {
      const clickedInside = e.target.closest("[data-services]");
      if (!clickedInside) closeAll();
    });

    applyExpandedStateClasses();
  })();

  // TIMELINE: starts in view; pauses out of view; resumes from same progress
  (function () {
    const root = document.querySelector("[data-timeline]");
    if (!root) return;

    const titles = Array.from(root.querySelectorAll(".timeline-title"));
    const contentEl = root.querySelector("[data-timeline-content]");
    const prevBtn = root.querySelector("[data-timeline-prev]");
    const nextBtn = root.querySelector("[data-timeline-next]");
    const bar = root.querySelector("[data-timeline-bar]");

    const steps = [
      { title: "Explorar", body: "Escuchar y observar con atención, recopilando contexto familiar y escolar para entender fortalezas y retos reales." },
      { title: "Evaluar", body: "Evaluar funciones y habilidades en contextos reales para identificar necesidades y prioridades de intervención." },
      { title: "Planificar", body: "Diseñar un plan centrado en objetivos claros, medibles y relevantes para el niño y su entorno." },
      { title: "Implementar", body: "Aplicar estrategias y prácticas funcionales en la vida diaria del niño, con ajustes continuos." },
      { title: "Revisar", body: "Monitorear resultados, recopilar retroalimentación y adaptar el plan para fomentar autonomía y bienestar." }
    ];

    const INTERVAL = 12000;
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    let index = 0;

    let running = false;
    let timeoutId = null;

    let barStartTs = null;
    let elapsedMs = 0;

    const clearTimer = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = null;
    };

    const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

    const setBarInstant = (pct) => {
      if (!bar) return;
      bar.style.transition = "none";
      bar.style.width = `${pct}%`;
      void bar.offsetWidth;
    };

    const animateBarToEnd = (remainingMs, fromPct) => {
      if (!bar) return;
      if (prefersReducedMotion) {
        setBarInstant(100);
        return;
      }
      setBarInstant(fromPct);
      bar.style.transition = `width ${remainingMs}ms linear`;
      bar.style.width = "100%";
    };

    const render = (i) => {
      index = (i + steps.length) % steps.length;

      titles.forEach((btn, n) => {
        const active = n === index;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", String(active));
      });

      if (contentEl) {
        const step = steps[index];
        contentEl.innerHTML = `<h3>${step.title}</h3><p>${step.body}</p>`;
      }
    };

    const scheduleNextSwap = (delayMs) => {
      if (prefersReducedMotion) return;
      if (!running) return;

      clearTimer();
      timeoutId = window.setTimeout(() => {
        if (!running) return;

        elapsedMs = 0;
        barStartTs = performance.now();
        render(index + 1);

        animateBarToEnd(INTERVAL, 0);
        scheduleNextSwap(INTERVAL);
      }, delayMs);
    };

    const startAutoplay = () => {
      if (prefersReducedMotion) return;
      if (running) return;

      running = true;

      elapsedMs = clamp(elapsedMs, 0, INTERVAL);
      const remaining = clamp(INTERVAL - elapsedMs, 0, INTERVAL);
      const pct = (elapsedMs / INTERVAL) * 100;

      barStartTs = performance.now();
      animateBarToEnd(remaining, pct);
      scheduleNextSwap(remaining);
    };

    const stopAutoplay = () => {
      if (!running) return;

      running = false;
      clearTimer();

      if (barStartTs != null) {
        const now = performance.now();
        elapsedMs = clamp(elapsedMs + (now - barStartTs), 0, INTERVAL);
      }
      barStartTs = null;

      const pct = (elapsedMs / INTERVAL) * 100;
      setBarInstant(pct);
    };

    const userAdvance = (nextIndex) => {
      render(nextIndex);
      elapsedMs = 0;
      barStartTs = running ? performance.now() : null;

      if (bar) setBarInstant(0);

      if (running && !prefersReducedMotion) {
        animateBarToEnd(INTERVAL, 0);
        scheduleNextSwap(INTERVAL);
      }
    };

    const next = () => userAdvance(index + 1);
    const prev = () => userAdvance(index - 1);

    titles.forEach((btn) => {
      btn.addEventListener("click", () => {
        const stepIndex = Number(btn.getAttribute("data-step"));
        userAdvance(Number.isFinite(stepIndex) ? stepIndex : 0);
      });

      btn.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); next(); }
        if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      });
    });

    if (nextBtn) nextBtn.addEventListener("click", () => next());
    if (prevBtn) prevBtn.addEventListener("click", () => prev());

    let isInView = false;
    const section = root.closest("section") || root;

    root.addEventListener("mouseenter", () => { if (running) stopAutoplay(); });
    root.addEventListener("mouseleave", () => { if (isInView && !prefersReducedMotion) startAutoplay(); });
    root.addEventListener("focusin", () => { if (running) stopAutoplay(); });
    root.addEventListener("focusout", () => { if (isInView && !prefersReducedMotion) startAutoplay(); });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target !== section) continue;
          isInView = entry.isIntersecting && entry.intersectionRatio >= 0.35;
          if (isInView) startAutoplay();
          else stopAutoplay();
        }
      },
      { threshold: [0, 0.15, 0.35, 0.6, 1] }
    );

    observer.observe(section);

    render(0);
    if (bar) setBarInstant(0);

    // keyboard convenience
    if (section) {
      section.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") next();
        if (e.key === "ArrowLeft") prev();
      });
    }
  })();

  // CONTACT FORM
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
            successElem.hidden = false;
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
