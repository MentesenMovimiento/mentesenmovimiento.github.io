// -----------------------------------
// SITE GLOBAL JS
// -----------------------------------
(function() {

  // #### MOBILE MENU TOGGLE ####
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-menu]");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      navMenu.classList.toggle("open");
    });

    // Close menu on link click (mobile)
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth < 900) {
          navMenu.classList.remove("open");
          navToggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  // #### FLIP CARD TAP/CLICK SUPPORT ####
  document.querySelectorAll(".flip-card").forEach((card) => {
    const hit = card.querySelector(".flip-hit");
    if (!hit) return;

    hit.addEventListener("click", (event) => {
      event.preventDefault();
      // Close other flipped cards
      document.querySelectorAll(".flip-card.is-flipped").forEach((openCard) => {
        if (openCard !== card) openCard.classList.remove("is-flipped");
      });
      card.classList.toggle("is-flipped");
    });
  });

  // #### FORM SUBMISSION (INLINE SUCCESS) ####
  const contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const submitUrl = contactForm.getAttribute("action");

      try {
        const res = await fetch(submitUrl, {
          method: "POST",
          body: formData,
          headers: { "Accept": "application/json" }
        });

        if (res.ok) {
          // Show inline success
          document.querySelector("#contact-success").classList.add("show");
          contactForm.classList.add("hidden");
        } else {
          alert("Hubo un error al enviar. Intenta de nuevo más tarde.");
        }
      } catch (err) {
        alert("Hubo un error al enviar. Verifica tu conexión e intenta de nuevo.");
      }
    });
  }

})();
