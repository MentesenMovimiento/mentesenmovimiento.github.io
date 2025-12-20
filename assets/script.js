// -----------------------------------
// SITE GLOBAL JS
// -----------------------------------

(function () {

  // ---- FOOTER YEAR INJECTION ----
  const yearElem = document.getElementById("year");
  if (yearElem) {
    yearElem.textContent = new Date().getFullYear();
  }

  // ---- AUTO-HIDE NAVBAR ON SCROLL ----
  const header = document.querySelector(".site-header");
  let lastScroll = 0;
  if (header) {
    window.addEventListener("scroll", () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll <= 0) {
        header.classList.remove("hide");
        return;
      }

      // Hide on scroll down
      if (currentScroll > lastScroll + 10) {
        header.classList.add("hide");
      }

      // Show on scroll up
      if (currentScroll < lastScroll - 10) {
        header.classList.remove("hide");
      }

      lastScroll = currentScroll;
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

  // ---- ACCORDION FUNCTIONALITY ----
  document.querySelectorAll(".accordion-toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const panel = toggle.nextElementSibling;
      if (!panel) return;

      const currentlyOpen = panel.classList.contains("open");

      // Close all open panels for exclusive behavior
      document.querySelectorAll(".accordion-panel.open").forEach((p) => {
        p.classList.remove("open");
      });
      document.querySelectorAll(".accordion-toggle.active").forEach((t) => {
        t.classList.remove("active");
      });

      if (!currentlyOpen) {
        panel.classList.add("open");
        toggle.classList.add("active");
      }
    });
  });

  // ---- COLLAPSIBLE TOC FOR BLOG PAGES ----
  document.querySelectorAll(".toc[data-toc]").forEach((tocBlock) => {
    const navList = tocBlock.querySelector("nav");
    if (!navList) return;

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "toc-toggle";
    toggleBtn.textContent = "Mostrar contenido";

    tocBlock.parentNode.insertBefore(toggleBtn, tocBlock);
    tocBlock.classList.add("hidden");

    toggleBtn.addEventListener("click", () => {
      const isHidden = tocBlock.classList.contains("hidden");

      tocBlock.classList.toggle("hidden");
      tocBlock.classList.toggle("visible");
      toggleBtn.textContent = isHidden ? "Ocultar contenido" : "Mostrar contenido";
    });
  });

  // ---- INSTAGRAM EMBED ANIMATION DELAY ----
  document.addEventListener("DOMContentLoaded", () => {
    const instaBlocks = document.querySelectorAll(".insta-embeds .instagram-media");
    instaBlocks.forEach((block, i) => {
      block.style.animationDelay = `${i * 0.15}s`;
    });
  });

  // ---- BLOG CARD APPEAR ON SCROLL ----
  const blogCards = document.querySelectorAll(".blog-card");
  if (blogCards.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = "running";
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    blogCards.forEach((card) => {
      card.style.animationPlayState = "paused";
      observer.observe(card);
    });
  }

  // ---- CONTACT FORM SUBMISSION ----
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
          const successElem = document.getElementById("contact-success");
          if (successElem) successElem.classList.add("show");
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
