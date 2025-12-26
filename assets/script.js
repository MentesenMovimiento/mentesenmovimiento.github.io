/* assets/script.js */
/* ================= CORE I18N ================= */

// ---- utilities ----
function safeGetByPath(obj, path) {
  if (!obj || !path) return undefined;
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

// ---- language detection ----
function detectLang() {
  try {
    const saved = localStorage.getItem("mm_lang");
    if (window.I18N && typeof window.I18N === "object" && saved && window.I18N[saved]) {
      return saved;
    }

    const nav = (navigator.language || "es").toLowerCase().slice(0, 2);
    if (window.I18N && typeof window.I18N === "object" && window.I18N[nav]) {
      return nav;
    }
  } catch (err) {
    console.warn("detectLang fallback:", err);
  }

  return "es";
}

// ---- meta ----
function applyMeta(lang) {
  if (!window.I18N || typeof window.I18N !== "object") return;

  const meta = window.I18N[lang]?.meta;
  if (!meta) return;

  if (typeof meta.title === "string") {
    document.title = meta.title;
  }

  const desc = document.querySelector('meta[name="description"]');
  if (desc && typeof meta.description === "string") {
    desc.setAttribute("content", meta.description);
  }

  document.documentElement.setAttribute("lang", lang);
}

// ---- text ----
function applyText(lang) {
  if (!window.I18N || typeof window.I18N !== "object") return;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const val = safeGetByPath(window.I18N[lang], key);
    if (typeof val !== "string") return;

    if (el.hasAttribute("data-i18n-html")) {
      el.innerHTML = val;
    } else if (el.childElementCount === 0) {
      el.textContent = val;
    }
  });

  document.querySelectorAll("[data-i18n-attr][data-i18n]").forEach((el) => {
    const attr = el.getAttribute("data-i18n-attr");
    const key = el.getAttribute("data-i18n");
    const val = safeGetByPath(window.I18N[lang], key);
    if (attr && typeof val === "string") {
      el.setAttribute(attr, val);
    }
  });
}

// ---- UI ----
function setActiveLangBtn(lang) {
  document.querySelectorAll(".lang-btn[data-lang]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
  });
}

// ---- main setter ----
function setLang(lang) {
  try {
    if (!window.I18N || typeof window.I18N !== "object") {
      console.warn("I18N not ready yet");
      return;
    }

    if (!window.I18N[lang]) lang = "es";

    localStorage.setItem("mm_lang", lang);

    applyMeta(lang);
    applyText(lang);
    
    if (window.__MM_TL__ && window.I18N?.[lang]?.timeline?.steps) {
      window.__MM_TL__.setSteps(window.I18N[lang].timeline.steps);
    }

    if (typeof applyTimelineSteps === "function") {
      applyTimelineSteps(lang);
    }

    setActiveLangBtn(lang);

    // blog support (optional)
    if (typeof mmBlogApplyLang === "function") {
      mmBlogApplyLang(lang);
    }
  } catch (err) {
    console.error("setLang error:", err);
  }
}

// ---- boot ----
window.addEventListener("mm:i18n-ready", () => {
  const initial = detectLang();
  setLang(initial);

  if (typeof mmBlogInit === "function") {
    mmBlogInit();
  }

  document.querySelectorAll(".lang-btn[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setLang(btn.getAttribute("data-lang") || "es");
    });
  });
});


/* ================= BLOG I18N LOADER ================= */

let __MM_BLOG_DICT__ = null;
let __MM_BLOG_SRC__ = null;

function mmBlogApplyLang(lang) {
  const blogRoot = document.querySelector("[data-blog]");
  if (!blogRoot || !__MM_BLOG_DICT__) return;

  const data = __MM_BLOG_DICT__[lang] || __MM_BLOG_DICT__.es;
  if (!data) return;

  if (typeof data["__meta.title"] === "string") {
    document.title = data["__meta.title"];
  }

  if (typeof data["__meta.description"] === "string") {
    const m = document.querySelector('meta[name="description"]');
    if (m) m.setAttribute("content", data["__meta.description"]);
  }

  document
    .querySelectorAll("[data-blog-i18n], [data-blog-i18n-html]")
    .forEach((el) => {
      const key =
        el.getAttribute("data-blog-i18n") ||
        el.getAttribute("data-blog-i18n-html");

      if (!key) return;

      const val = data[key];
      if (typeof val !== "string") return;

      const attr = el.getAttribute("data-blog-i18n-attr");
      if (attr) {
        el.setAttribute(attr, val);
      } else if (el.hasAttribute("data-blog-i18n-html")) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    });
}

function mmBlogInit() {
  const blogRoot = document.querySelector("[data-blog]");
  if (!blogRoot) return;

  const src = blogRoot.getAttribute("data-blog-i18n");
  if (!src) return;

  if (__MM_BLOG_DICT__ && __MM_BLOG_SRC__ === src) {
    mmBlogApplyLang(localStorage.getItem("mm_lang") || "es");
    return;
  }

  __MM_BLOG_SRC__ = src;

  fetch(src)
    .then((r) => r.json())
    .then((dict) => {
      __MM_BLOG_DICT__ = dict || null;
      mmBlogApplyLang(localStorage.getItem("mm_lang") || "es");
    })
    .catch((err) => console.error("Blog i18n error:", err));
}
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
  // NOTE: Logic unchanged. Only the `steps` content is now sourced from i18n when available.
  (function () {
    const root = document.querySelector("[data-timeline]");
    if (!root) return;

    const titles = Array.from(root.querySelectorAll(".timeline-title"));
    const contentEl = root.querySelector("[data-timeline-content]");
    const prevBtn = root.querySelector("[data-timeline-prev]");
    const nextBtn = root.querySelector("[data-timeline-next]");
    const bar = root.querySelector("[data-timeline-bar]");

    // Default ES copy (fallback)
    let steps = [
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

    // Expose a safe hook for i18n to swap copy without touching behavior
    window.__MM_TL__ = {
      setSteps: (newSteps) => {
        if (!Array.isArray(newSteps) || newSteps.length !== 5) return;
        steps = newSteps.map(s => ({ title: String(s.title || ""), body: String(s.body || "") }));
        render(index); // re-render current without changing autoplay state
      },
      getIndex: () => index
    };
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

/* PROJECT MODAL LOGIC */
(function () {
  const modal = document.getElementById("projectModal");
  if (!modal) return;

  const closeEls = modal.querySelectorAll("[data-modal-close]");

  const closeModal = () => {
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  // Open on load
  window.addEventListener("load", () => {
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  });

  // Close handlers
  closeEls.forEach(el => el.addEventListener("click", closeModal));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") {
      closeModal();
    }
  });
})();

/* ============================ i18n MULTILINGUAL LAYER ============================ */
(function () {
window.I18N = {
    es: {
      meta: {
        title: "Mentes en Movimiento · Clínica de desarrollo infantil",
        description: "Clínica de desarrollo infantil en Salou para niños con necesidades educativas especiales. Educación, fisioterapia, logopedia y movimiento."
      },
      a11y: { skip: "Saltar al contenido" },
      nav: {
        aria: "Navegación principal",
        home_aria: "Ir al inicio",
        menu_open: "Abrir menú",
        services: "Servicios",
        approach: "Enfoque",
        blog: "Blog",
        instagram: "Instagram",
        legal: "Legal"
      },
      hero: {
        aria: "Introducción",
        trust_aria: "Puntos de confianza",
        trust1: "Enfoque funcional y aplicable",
        trust2: "Coordinación familia–escuela",
        trust3: "Objetivos claros y medibles",
        slogan: "Cada niño, su propio camino",
        lead: "Acompañamos a niños y adolescentes que presentan dificultades en regulación, aprendizaje, comunicación o adaptación escolar, con un enfoque integrado: mente, cuerpo y acción.",
        cta_primary: "Cuéntanos tu caso",
        cta_secondary: "Ver cómo trabajamos"
      },
      about: {
        aria: "Quiénes somos",
        title: "Quiénes somos",
        lead: "Un equipo con base en educación y movimiento, con una mirada cálida y profesional. Lo importante: estrategias que funcionan en la vida real (casa y colegio).",
        card1: { title: "Trabajo centrado en el niño", desc: "Ajustamos el plan al perfil, ritmo y contexto del niño: no hay “talla única”." },
        card2: { title: "Intervención con sentido", desc: "Priorizamos objetivos funcionales: participación, autonomía y bienestar." },
        card3: { title: "Seguimiento y ajustes", desc: "Revisamos avances y adaptamos estrategias con claridad (qué funciona y por qué)." }
      },
      services: {
        title: "Servicios",
        lead: "Haz clic en cada área para ver detalles y conocer al profesional responsable.",
        education: {
          open_aria: "Abrir: Educación Especial",
          detail_aria: "Detalle: Educación Especial",
          title: "Educación Especial",
          front: "Aprendizaje funcional, adaptación y participación en contextos reales.",
          b1: "Apoyos para aprendizaje y autonomía",
          b2: "Planificación visual y estructura",
          b3: "Estrategias para casa y colegio",
          b4: "Objetivos funcionales y medibles",
          role: "Educación especial · Intervención individualizada",
          bio: "Acompaña a niños y familias con estrategias prácticas para mejorar participación, adaptación escolar y rutinas diarias. Enfoque cálido, estructurado y centrado en fortalezas."
        },
        physio: {
          open_aria: "Abrir: Fisioterapia Pediátrica",
          detail_aria: "Detalle: Fisioterapia Pediátrica",
          title: "Fisioterapia Pediátrica",
          front: "Postura, coordinación y fuerza funcional para la vida diaria.",
          b1: "Equilibrio, coordinación y control postural",
          b2: "Patrones de movimiento y habilidades motoras",
          b3: "Objetivos claros (seguimiento y ajustes)",
          alt: "Profesional de fisioterapia pediátrica",
          name: "Profesional de Fisioterapia",
          role: "Fisioterapia pediátrica",
          bio: "Intervención basada en objetivos funcionales y participación. Trabajo coordinado con familia y escuela para generalizar avances.",
          placeholder: "(Si aún no has definido nombre/foto, esto queda como placeholder.)"
        },
        speech: {
          open_aria: "Abrir: Logopedia",
          detail_aria: "Detalle: Logopedia",
          title: "Logopedia",
          front: "Comunicación funcional: comprensión, intención y contexto.",
          b1: "Comunicación más allá del habla",
          b2: "Comprensión, turnos, juego e interacción",
          b3: "Apoyos visuales y estrategias prácticas",
          alt: "Profesional de logopedia",
          name: "Profesional de Logopedia",
          role: "Logopedia · Comunicación funcional",
          bio: "Enfoque centrado en participación: reducir frustración, aumentar iniciativa comunicativa y mejorar comprensión en rutinas reales.",
          placeholder: "(Placeholder editable: nombre, foto y credenciales.)"
        },
        movement: {
          open_aria: "Abrir: Movimiento y Regulación",
          detail_aria: "Detalle: Movimiento y Regulación",
          title: "Movimiento y Regulación",
          front: "Preparación para aprender: cuerpo organizado, mente disponible.",
          b1: "Rutinas de regulación (activación ↔ calma)",
          b2: "Movimiento con intención (no “gastar energía”)",
          b3: "Preparación para tareas (learning readiness)",
          role: "Movimiento · Ejercicio terapéutico",
          bio: "Diseña actividades y rutinas para ayudar a regular el cuerpo y facilitar atención, participación y aprendizaje. Enfoque práctico y progresivo, adaptado al perfil del niño."
        }
      },
      timeline: {
        title: "Un enfoque integrado",
        lead: "Títulos siempre visibles. El contenido cambia automáticamente (12s) y se sincroniza con la barra de progreso.",
        aria: "Etapas del enfoque",
        panel_aria: "Contenido del enfoque",
        controls_aria: "Controles de enfoque",
        prev_aria: "<",
        next_aria: ">",
        progress_aria: "Progreso",
        labels: ["Explorar", "Evaluar", "Planificar", "Implementar", "Revisar"],
        steps: [
          { title: "Explorar", body: "Escuchar y observar con atención, recopilando contexto familiar y escolar para entender fortalezas y retos reales." },
          { title: "Evaluar", body: "Evaluar funciones y habilidades en contextos reales para identificar necesidades y prioridades de intervención." },
          { title: "Planificar", body: "Diseñar un plan centrado en objetivos claros, medibles y relevantes para el niño y su entorno." },
          { title: "Implementar", body: "Aplicar estrategias y prácticas funcionales en la vida diaria del niño, con ajustes continuos." },
          { title: "Revisar", body: "Monitorear resultados, recopilar retroalimentación y adaptar el plan para fomentar autonomía y bienestar." }
        ]
      },
      blog: {
        aria: "Artículos del blog",
        title: "Blog",
        lead: "Lecturas cortas y aplicables para familias y profesionales.",
        all: "Ver todos los artículos",
        card1: { title: "Movimiento y desarrollo infantil", desc: "Atención, regulación y preparación para aprender.", alt: "Movimiento y desarrollo infantil" },
        card2: { title: "Logopedia funcional", desc: "Comunicación más allá del habla: intención, comprensión y contexto.", alt: "Logopedia y desarrollo global" },
        card3: { title: "Intervención individualizada", desc: "Objetivos funcionales y coordinación familia–escuela.", alt: "Intervención individualizada" }
      },
      instagram: {
        title: "Instagram",
        lead: "Contenido educativo: desarrollo, regulación, aprendizaje y estrategias prácticas.",
        placeholder: "Integra aquí tus embeds reales o enlaces a reels destacados."
      },
      contact: {
        title: "Contacto",
        lead: "Cuéntanos tu caso (sin compromiso). Responderemos con claridad y orientación inicial.",
        name: "Nombre",
        email: "Email",
        message: "Mensaje",
        send: "Enviar",
        success: "Gracias. Hemos recibido tu mensaje."
      },
      legal: {
        aria: "Información legal y privacidad",
        location: "Costa Daurada (Tarragona)",
        contact_label: "Contacto",
        privacy_label: "Datos y privacidad",
        privacy: "Usamos tus datos únicamente para responder a tu consulta. Cumplimos con la normativa aplicable de protección de datos (RGPD)."
      },
      modal: {
        title: "Estado del proyecto",
        phase1: { title: "Fase 1 · Asociación", status: "En progreso", desc: "Constitución legal, estatutos, acta fundacional, certificado digital y NIF." },
        phase2: { title: "Fase 2 · Licencias", desc: "Licencia municipal, autorización sanitaria y registros oficiales." },
        phase3: { title: "Fase 3 · Subvenciones", desc: "ACNEAE, ayuntamientos, diputación y fundaciones." },
        phase4: { title: "Fase 4 · Local", desc: "Elección del espacio, proyecto técnico y adecuación." },
        phase5: { title: "Fase 5 · Apertura", desc: "Contratación, inspecciones y apertura progresiva." }
      }
    },

    ca: {
      meta: {
        title: "Mentes en Movimiento · Clínica de desenvolupament infantil",
        description: "Clínica de desenvolupament infantil a Salou per a infants amb necessitats educatives. Educació, fisioteràpia, logopèdia i moviment."
      },
      a11y: { skip: "Saltar al contingut" },
      nav: {
        aria: "Navegació principal",
        home_aria: "Anar a l'inici",
        menu_open: "Obrir menú",
        services: "Serveis",
        approach: "Enfocament",
        blog: "Blog",
        instagram: "Instagram",
        legal: "Legal"
      },
      hero: {
        aria: "Introducció",
        trust_aria: "Punts de confiança",
        trust1: "Enfocament funcional i aplicable",
        trust2: "Coordinació família–escola",
        trust3: "Objectius clars i mesurables",
        slogan: "Cada infant, el seu propi camí",
        lead: "Acompanyem infants i adolescents amb dificultats de regulació, aprenentatge, comunicació o adaptació escolar, amb un enfocament integrat: ment, cos i acció.",
        cta_primary: "Explica'ns el teu cas",
        cta_secondary: "Veure com treballem"
      },
      about: {
        aria: "Qui som",
        title: "Qui som",
        lead: "Un equip amb base en educació i moviment, amb una mirada càlida i professional. L’important: estratègies que funcionen a la vida real (casa i escola).",
        card1: { title: "Treball centrat en l’infant", desc: "Ajustem el pla al perfil, ritme i context de l’infant: no hi ha “talla única”." },
        card2: { title: "Intervenció amb sentit", desc: "Prioritzem objectius funcionals: participació, autonomia i benestar." },
        card3: { title: "Seguiment i ajustos", desc: "Revisem els avenços i adaptem les estratègies amb claredat (què funciona i per què)." }
      },
      services: {
        title: "Serveis",
        lead: "Fes clic a cada àrea per veure detalls i conèixer el/la professional responsable.",
        education: {
          open_aria: "Obrir: Educació Especial",
          detail_aria: "Detall: Educació Especial",
          title: "Educació Especial",
          front: "Aprenentatge funcional, adaptació i participació en contextos reals.",
          b1: "Suports per a aprenentatge i autonomia",
          b2: "Planificació visual i estructura",
          b3: "Estratègies per a casa i escola",
          b4: "Objectius funcionals i mesurables",
          role: "Educació especial · Intervenció individualitzada",
          bio: "Acompanya infants i famílies amb estratègies pràctiques per millorar participació, adaptació escolar i rutines diàries. Enfocament càlid, estructurat i centrat en fortaleses."
        },
        physio: {
          open_aria: "Obrir: Fisioteràpia Pediàtrica",
          detail_aria: "Detall: Fisioteràpia Pediàtrica",
          title: "Fisioteràpia Pediàtrica",
          front: "Postura, coordinació i força funcional per a la vida diària.",
          b1: "Equilibri, coordinació i control postural",
          b2: "Patrons de moviment i habilitats motrius",
          b3: "Objectius clars (seguiment i ajustos)",
          alt: "Professional de fisioteràpia pediàtrica",
          name: "Professional de Fisioteràpia",
          role: "Fisioteràpia pediàtrica",
          bio: "Intervenció basada en objectius funcionals i participació. Treball coordinat amb família i escola per generalitzar avenços.",
          placeholder: "(Si encara no has definit nom/foto, això queda com a placeholder.)"
        },
        speech: {
          open_aria: "Obrir: Logopèdia",
          detail_aria: "Detall: Logopèdia",
          title: "Logopèdia",
          front: "Comunicació funcional: comprensió, intenció i context.",
          b1: "Comunicació més enllà de la parla",
          b2: "Comprensió, torns, joc i interacció",
          b3: "Suports visuals i estratègies pràctiques",
          alt: "Professional de logopèdia",
          name: "Professional de Logopèdia",
          role: "Logopèdia · Comunicació funcional",
          bio: "Enfocament centrat en participació: reduir frustració, augmentar iniciativa comunicativa i millorar comprensió en rutines reals.",
          placeholder: "(Placeholder editable: nom, foto i credencials.)"
        },
        movement: {
          open_aria: "Obrir: Moviment i Regulació",
          detail_aria: "Detall: Moviment i Regulació",
          title: "Moviment i Regulació",
          front: "Preparació per aprendre: cos organitzat, ment disponible.",
          b1: "Rutines de regulació (activació ↔ calma)",
          b2: "Moviment amb intenció (no “cremar energia”)",
          b3: "Preparació per a tasques (learning readiness)",
          role: "Moviment · Exercici terapèutic",
          bio: "Dissenya activitats i rutines per ajudar a regular el cos i facilitar atenció, participació i aprenentatge. Enfocament pràctic i progressiu, adaptat al perfil de l’infant."
        }
      },
      timeline: {
        title: "Un enfocament integrat",
        lead: "Títols sempre visibles. El contingut canvia automàticament (12s) i es sincronitza amb la barra de progrés.",
        aria: "Etapes de l’enfocament",
        panel_aria: "Contingut de l’enfocament",
        controls_aria: "Controls de l’enfocament",
        prev_aria: "<",
        next_aria: ">",
        progress_aria: "Progrés",
        labels: ["Explorar", "Avaluar", "Planificar", "Implementar", "Revisar"],
        steps: [
          { title: "Explorar", body: "Escoltar i observar amb atenció, recopilant context familiar i escolar per entendre fortaleses i reptes reals." },
          { title: "Avaluar", body: "Avaluar funcions i habilitats en contextos reals per identificar necessitats i prioritats d’intervenció." },
          { title: "Planificar", body: "Dissenyar un pla centrat en objectius clars, mesurables i rellevants per a l’infant i el seu entorn." },
          { title: "Implementar", body: "Aplicar estratègies i pràctiques funcionals en la vida diària, amb ajustos continus." },
          { title: "Revisar", body: "Monitoritzar resultats, recollir retorn i adaptar el pla per fomentar autonomia i benestar." }
        ]
      },
      blog: {
        aria: "Articles del blog",
        title: "Blog",
        lead: "Lectures curtes i aplicables per a famílies i professionals.",
        all: "Veure tots els articles",
        card1: { title: "Moviment i desenvolupament infantil", desc: "Atenció, regulació i preparació per aprendre.", alt: "Moviment i desenvolupament infantil" },
        card2: { title: "Logopèdia funcional", desc: "Comunicació més enllà de la parla: intenció, comprensió i context.", alt: "Logopèdia i desenvolupament global" },
        card3: { title: "Intervenció individualitzada", desc: "Objectius funcionals i coordinació família–escola.", alt: "Intervenció individualitzada" }
      },
      instagram: {
        title: "Instagram",
        lead: "Contingut educatiu: desenvolupament, regulació, aprenentatge i estratègies pràctiques.",
        placeholder: "Integra aquí els teus embeds reals o enllaços a reels destacats."
      },
      contact: {
        title: "Contacte",
        lead: "Explica’ns el teu cas (sense compromís). Respondrem amb claredat i orientació inicial.",
        name: "Nom",
        email: "Email",
        message: "Missatge",
        send: "Enviar",
        success: "Gràcies. Hem rebut el teu missatge."
      },
      legal: {
        aria: "Informació legal i privacitat",
        location: "Costa Daurada (Tarragona)",
        contact_label: "Contacte",
        privacy_label: "Dades i privacitat",
        privacy: "Utilitzem les teves dades únicament per respondre la teva consulta, d’acord amb la normativa de protecció de dades (RGPD)."
      },
      modal: {
        title: "Estat del projecte",
        phase1: { title: "Fase 1 · Associació", status: "En curs", desc: "Constitució legal, estatuts, acta fundacional, certificat digital i NIF." },
        phase2: { title: "Fase 2 · Llicències", desc: "Llicència municipal, autorització sanitària i registres oficials." },
        phase3: { title: "Fase 3 · Subvencions", desc: "ACNEAE, ajuntaments, diputació i fundacions." },
        phase4: { title: "Fase 4 · Local", desc: "Elecció de l’espai, projecte tècnic i adequació." },
        phase5: { title: "Fase 5 · Obertura", desc: "Contractació, inspeccions i obertura progressiva." }
      }
    },

    en: {
      meta: {
        title: "Mentes en Movimiento · Child Development Clinic",
        description: "Child development clinic in Salou supporting children with learning and developmental needs. Education, physiotherapy, speech therapy and movement."
      },
      a11y: { skip: "Skip to content" },
      nav: {
        aria: "Primary navigation",
        home_aria: "Go to homepage",
        menu_open: "Open menu",
        services: "Services",
        approach: "Approach",
        blog: "Blog",
        instagram: "Instagram",
        legal: "Legal"
      },
      hero: {
        aria: "Introduction",
        trust_aria: "Trust highlights",
        trust1: "Practical, functional approach",
        trust2: "Family–school coordination",
        trust3: "Clear, measurable goals",
        slogan: "Every child, their own path",
        lead: "We support children and adolescents with challenges in regulation, learning, communication or school adjustment through an integrated approach: mind, body and action.",
        cta_primary: "Tell us about your case",
        cta_secondary: "See how we work"
      },
      about: {
        aria: "Who we are",
        title: "Who we are",
        lead: "A team grounded in education and movement, with a warm and professional lens. The key: strategies that work in real life (home and school).",
        card1: { title: "Child-centred work", desc: "We tailor the plan to the child’s profile, pace and context—no one-size-fits-all." },
        card2: { title: "Meaningful intervention", desc: "We prioritise functional goals: participation, independence and wellbeing." },
        card3: { title: "Review and adjust", desc: "We track progress and refine strategies with clarity (what works and why)." }
      },
      services: {
        title: "Services",
        lead: "Click each area to see details and meet the lead professional.",
        education: {
          open_aria: "Open: Special Education",
          detail_aria: "Details: Special Education",
          title: "Special Education",
          front: "Functional learning, adaptation and participation in real contexts.",
          b1: "Support for learning and independence",
          b2: "Visual planning and structure",
          b3: "Strategies for home and school",
          b4: "Functional, measurable goals",
          role: "Special education · Individualised support",
          bio: "Supports children and families with practical strategies to improve participation, school adjustment and daily routines. Warm, structured, strengths-based approach."
        },
        physio: {
          open_aria: "Open: Paediatric Physiotherapy",
          detail_aria: "Details: Paediatric Physiotherapy",
          title: "Paediatric Physiotherapy",
          front: "Posture, coordination and functional strength for daily life.",
          b1: "Balance, coordination and postural control",
          b2: "Movement patterns and motor skills",
          b3: "Clear goals (monitor and adjust)",
          alt: "Paediatric physiotherapy professional",
          name: "Physiotherapy Professional",
          role: "Paediatric physiotherapy",
          bio: "Goal-based, participation-focused intervention. Coordinated work with family and school to generalise gains.",
          placeholder: "(If you haven’t finalised name/photo yet, this remains an editable placeholder.)"
        },
        speech: {
          open_aria: "Open: Speech therapy",
          detail_aria: "Details: Speech therapy",
          title: "Speech therapy",
          front: "Functional communication: understanding, intention and context.",
          b1: "Communication beyond speech",
          b2: "Understanding, turn-taking, play and interaction",
          b3: "Visual supports and practical strategies",
          alt: "Speech therapy professional",
          name: "Speech Therapy Professional",
          role: "Speech therapy · Functional communication",
          bio: "Participation-centred approach: reduce frustration, increase initiation and improve understanding in real routines.",
          placeholder: "(Editable placeholder: name, photo and credentials.)"
        },
        movement: {
          open_aria: "Open: Movement and regulation",
          detail_aria: "Details: Movement and regulation",
          title: "Movement and regulation",
          front: "Ready to learn: organised body, available mind.",
          b1: "Regulation routines (activation ↔ calm)",
          b2: "Movement with purpose (not just “burning energy”)",
          b3: "Learning readiness for tasks",
          role: "Movement · Therapeutic exercise",
          bio: "Designs activities and routines to regulate the body and support attention, participation and learning. Practical, progressive and child-tailored."
        }
      },
      timeline: {
        title: "An integrated approach",
        lead: "Titles stay visible. Content changes automatically (12s) and syncs with the progress bar.",
        aria: "Approach stages",
        panel_aria: "Approach content",
        controls_aria: "Approach controls",
        prev_aria: "<",
        next_aria: ">",
        progress_aria: "Progress",
        labels: ["Explore", "Assess", "Plan", "Implement", "Review"],
        steps: [
          { title: "Explore", body: "Listen and observe carefully, gathering family and school context to understand strengths and real-world challenges." },
          { title: "Assess", body: "Assess functions and skills in real contexts to identify needs and priorities for intervention." },
          { title: "Plan", body: "Design a plan with clear, measurable goals that matter to the child and their environment." },
          { title: "Implement", body: "Apply practical strategies in daily life, with ongoing adjustments." },
          { title: "Review", body: "Monitor outcomes, gather feedback and adapt the plan to build autonomy and wellbeing." }
        ]
      },
      blog: {
        aria: "Blog articles",
        title: "Blog",
        lead: "Short, practical reads for families and professionals.",
        all: "See all articles",
        card1: { title: "Movement and child development", desc: "Attention, regulation and readiness to learn.", alt: "Movement and child development" },
        card2: { title: "Functional speech therapy", desc: "Communication beyond speech: intention, understanding and context.", alt: "Speech therapy and global development" },
        card3: { title: "Individualised intervention", desc: "Functional goals and family–school coordination.", alt: "Individualised intervention" }
      },
      instagram: {
        title: "Instagram",
        lead: "Educational content: development, regulation, learning and practical strategies.",
        placeholder: "Embed your real posts here or link to featured reels."
      },
      contact: {
        title: "Contact",
        lead: "Tell us about your case (no obligation). We’ll respond with clear initial guidance.",
        name: "Name",
        email: "Email",
        message: "Message",
        send: "Send",
        success: "Thank you. We’ve received your message."
      },
      legal: {
        aria: "Legal information and privacy",
        location: "Costa Daurada (Tarragona)",
        contact_label: "Contact",
        privacy_label: "Data and privacy",
        privacy: "We use your data solely to respond to your enquiry, in line with applicable data protection regulations (GDPR)."
      },
      modal: {
        title: "Project status",
        phase1: { title: "Phase 1 · Association", status: "In progress", desc: "Legal setup, bylaws, founding act, digital certificate and tax ID." },
        phase2: { title: "Phase 2 · Licences", desc: "Local activity licence, health authorisation and official registrations." },
        phase3: { title: "Phase 3 · Funding", desc: "ACNEAE, local councils, provincial support and foundations." },
        phase4: { title: "Phase 4 · Premises", desc: "Select premises, technical project and compliance works." },
        phase5: { title: "Phase 5 · Opening", desc: "Hiring, inspections and phased opening." }
      }
    }
  };

  const getByPath = (obj, path) => {
    if (!obj || !path) return undefined;
    const parts = path.split(".");
    let cur = obj;
    for (const p of parts) {
      cur = cur?.[p];
      if (cur == null) return undefined;
    }
    return cur;
  };

  window.dispatchEvent(new Event("mm:i18n-ready"));

})();
