// -----------------------------------
// SITE GLOBAL JS
// -----------------------------------

(function () {

  // ---- FOOTER YEAR INJECTION ----
  const yearElem = document.getElementById("year");
  if (yearElem) yearElem.textContent = new Date().getFullYear();

  // ---- AUTO-HIDE NAVBAR ON SCROLL ----
  let lastScroll = 0;
  const header = document.querySelector(".site-header");

  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
      header.classList.remove("hide");
      return;
    }

    if (currentScroll > lastScroll && !header.classList.contains("hide")) {
      header.classList.add("hide");
    }

    if (currentScroll < lastScroll && header.classList.contains("hide")) {
      header.classList.remove("hide");
    }

    lastScroll = currentScroll;
  });

  // ---- MOBILE NAV TOGGLE ----
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-menu]");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      navMenu.classList.toggle("open");
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth < 900) {
          navMenu.classList.remove("open");
          navToggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  // ---- FLIP CARD INTERACTIONS ----
  document.querySelectorAll(".flip-card").forEach((card) => {
    const hit = card.querySelector(".flip-hit");
    if (!hit) return;

    hit.addEventListener("click", (event) => {
      event.preventDefault();

      document.querySelectorAll(".flip-card.is-flipped").forEach((openCard) => {
        if (openCard !== card) openCard.classList.remove("is-flipped");
      });

      card.classList.toggle("is-flipped");
    });
  });

  // ---- CONTACT FORM SUBMISSION (INLINE SUCCESS) ----
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
          headers: { "Accept": "application/json" }
        });

        if (response.ok) {
          document.getElementById("contact-success").classList.add("show");
          contactForm.classList.add("hidden");
        } else {
          alert("Hubo un error al enviar tu mensaje. Intenta de nuevo más tarde.");
        }
      } catch (err) {
        alert("Error de red. Verifica tu conexión y vuelve a intentarlo.");
      }
    });
  }

  // ---- COLLAPSIBLE TOC FOR BLOG PAGES ----
  document.querySelectorAll(".toc[data-toc]").forEach((tocBlock) => {
    // Create toggle button
    const toggle = document.createElement("button");
    toggle.className = "toc-toggle";
    toggle.textContent = "Mostrar contenido";
    tocBlock.parentNode.insertBefore(toggle, tocBlock);

    // Hide initial TOC
    tocBlock.classList.add("hidden");

    toggle.addEventListener("click", () => {
      const isHidden = tocBlock.classList.contains("hidden");
      tocBlock.classList.toggle("hidden");
      toggle.textContent = isHidden ? "Ocultar contenido" : "Mostrar contenido";
    });
  });

})();
