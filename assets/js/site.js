(function () {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Mobile menu: turn the existing nav into a simple overlay
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");

  let backdrop = document.getElementById("nav-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "nav-backdrop";
    backdrop.style.cssText = `
      position:fixed; inset:0; background:rgba(47,39,34,.35);
      display:none; z-index:60;
    `;
    document.body.appendChild(backdrop);
  }

  function openNav() {
    if (!nav || !toggle) return;
    nav.style.display = "grid";
    nav.style.position = "fixed";
    nav.style.top = "70px";
    nav.style.right = "16px";
    nav.style.background = "#FFFFFF";
    nav.style.border = "1px solid #e7ddce";
    nav.style.borderRadius = "18px";
    nav.style.padding = "14px";
    nav.style.boxShadow = "0 18px 44px rgba(47,39,34,.14)";
    nav.style.gap = "10px";
    nav.style.zIndex = "61";
    backdrop.style.display = "block";
    toggle.setAttribute("aria-expanded", "true");
  }

  function closeNav() {
    if (!nav || !toggle) return;
    nav.removeAttribute("style"); // revert to CSS (hidden on mobile)
    backdrop.style.display = "none";
    toggle.setAttribute("aria-expanded", "false");
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      expanded ? closeNav() : openNav();
    });
  }
  backdrop.addEventListener("click", closeNav);

  // Close nav when clicking a link (mobile)
  document.querySelectorAll(".site-nav a").forEach((a) => {
    a.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 860px)").matches) closeNav();
    });
  });

  // Flip cards: tap support
  document.querySelectorAll(".flip-card").forEach((card) => {
    const hit = card.querySelector(".flip-hit");
    if (!hit) return;

    hit.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".flip-card.is-flipped").forEach((open) => {
        if (open !== card) open.classList.remove("is-flipped");
      });
      card.classList.toggle("is-flipped");
    });
  });
})();
