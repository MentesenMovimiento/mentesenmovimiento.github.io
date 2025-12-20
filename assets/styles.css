/* -----------------------------------
  GLOBAL
----------------------------------- */
:root {
  /* Colors */
  --terracotta: #D36A2E;
  --fuchsia: #D64B78;
  --sage: #7A8F3A;
  --gold: #F2B84B;
  --bg: #FBF5EC;
  --white: #FFFFFF;
  --text: #2f2722;
  --muted: #6b7280;
  --border: #e7ddce;

  /* Typography */
  --font-head: "Poppins", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  --font-body: "Inter", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;

  /* Spacing */
  --radius: 18px;
  --shadow: 0 12px 28px rgba(47,39,34,0.10);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: hidden; /* prevents horizontal scrolling */
  font-family: var(--font-body);
  background: var(--bg);
  color: var(--text);
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Utilities */
.hidden {
  display: none !important;
}

.show {
  display: block !important;
}

/* -----------------------------------
  TYPOGRAPHY
----------------------------------- */
h1, h2, h3 {
  font-family: var(--font-head);
  font-weight: 600;
  margin: 0 0 0.5em;
}

p {
  margin: 0.6em 0;
}

/* LINKS */
a {
  text-decoration: none;
  color: inherit;
}

a:hover {
  text-decoration: underline;
}

/* -----------------------------------
  LAYOUT HELPERS
----------------------------------- */
.container {
  width: min(1120px, 100%);
  margin: 0 auto;
  padding: 0 16px;
}

/* -----------------------------------
  HEADER
----------------------------------- */
.site-header {
  position: sticky;
  top: 0;
  background: rgba(251,245,236,0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(231,221,206,0.95);
  z-index: 50;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 0;
}

.brand img {
  height: 42px;
  width: auto;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-mentes {
  color: var(--terracotta);
}

.brand-mov {
  color: var(--fuchsia);
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 16px;
  font-family: var(--font-head);
  font-weight: 600;
}

.nav-menu a:hover {
  color: var(--sage);
}

/* Mobile menu toggle */
.nav-toggle {
  display: none;
  border: 0;
  background: transparent;
}

/* -----------------------------------
  HERO (LANDING)
----------------------------------- */
.hero {
  padding: 48px 0 24px;
  background: 
    radial-gradient(circle at 20% 25%, rgba(214,75,120,0.18), transparent 55%),
    radial-gradient(circle at 80% 35%, rgba(122,143,58,0.14), transparent 52%),
    radial-gradient(circle at 50% 75%, rgba(242,184,75,0.16), transparent 60%);
}

.hero .hero-inner {
  text-align: center;
}

.hero .hero-inner h1 {
  font-size: clamp(2.2rem, 4vw, 3.2rem);
}

.hero .hero-inner p {
  color: var(--muted);
  max-width: 60ch;
  margin: 0.8rem auto;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.72rem 1.15rem;
  border-radius: 999px;
  font-family: var(--font-head);
  font-weight: 600;
  border: 1px solid var(--border);
  background: var(--white);
  cursor: pointer;
}

.btn--primary {
  background: var(--fuchsia);
  border-color: var(--fuchsia);
  color: var(--white);
  box-shadow: 0 12px 28px rgba(214,75,120,0.20);
}

.btn--primary:hover {
  background: #b03d6a;
  border-color: #b03d6a;
}

/* Sections */
.section {
  padding: 40px 0;
}
.section--alt {
  background: rgba(255,255,255,0.55);
  border-top: 1px solid rgba(231,221,206,0.9);
  border-bottom: 1px solid rgba(231,221,206,0.9);
}

.section__head h2 {
  color: var(--terracotta);
}

.section__head p {
  color: var(--muted);
  max-width: 72ch;
  margin-top: 0.4em;
}
/* -----------------------------------
   FLIP CARDS (SERVICES)
----------------------------------- */
.services-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.flip-card {
  position: relative;
  perspective: 1200px;
  min-height: 320px;
}

.flip-hit {
  position: absolute;
  inset: 0;
  z-index: 5;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: var(--radius);
}

.flip-inner {
  position: relative;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform .7s cubic-bezier(.2,.85,.2,1);
  border-radius: var(--radius);
}

.flip-card.is-flipped .flip-inner {
  transform: rotateY(180deg);
}

@media (hover:hover) {
  .flip-card:hover .flip-inner {
    transform: rotateY(180deg);
  }
}

.flip-front,
.flip-back {
  position: absolute;
  inset: 0;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border);
  backface-visibility: hidden;
  box-shadow: 0 10px 26px rgba(47,39,34,.07);
}

.flip-front {
  background-size: cover;
  background-position: center;
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: #fff;
}

.flip-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(47,39,34,.62), rgba(47,39,34,.12) 58%, rgba(47,39,34,0));
}

.flip-front__head {
  position: relative;
  z-index: 2;
}

.flip-front__blurb {
  position: relative;
  z-index: 2;
  margin-top: 4px;
  color: rgba(255,255,255,.92);
}

.flip-hint {
  position: relative;
  z-index: 2;
  display: inline-block;
  margin-top: .7rem;
  font-family: var(--font-head);
  opacity: .92;
}

.flip-back {
  background: var(--white);
  transform: rotateY(180deg);
  padding: 16px;
}

.flip-back h3 {
  color: var(--terracotta);
}

.flip-back ul {
  color: var(--text);
  margin-left: 1rem;
}

.flip-back li {
  margin-bottom: .5rem;
}

/* -----------------------------------
   BLOG CARDS
----------------------------------- */
.blog-cards {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(260px,1fr));
}

.blog-card {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 12px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 10px 26px rgba(47,39,34,.06);
  padding: 12px;
}

.blog-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius);
}

.blog-card h3 {
  color: var(--fuchsia);
  margin: .2rem 0 .4rem;
}

.blog-card p {
  color: var(--muted);
  margin: 0;
  font-size: .95rem;
}

/* -----------------------------------
   INSTAGRAM EMBEDS
----------------------------------- */
.insta-embeds {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  margin-top: 14px;
}

.instagram-media {
  width: 100% !important;
  margin: 0 !important;
  border-radius: var(--radius) !important;
  overflow: hidden !important;
  border: 1px solid var(--border) !important;
  background: var(--white) !important;
}

/* -----------------------------------
   CONTACT FORM
----------------------------------- */
.split {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(260px,1fr));
}

.contact {
  list-style: none;
  padding: 0;
  margin-top: 12px;
}

.contact li {
  margin-bottom: 8px;
}

#contact-form {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
}

.field {
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
}

label {
  font-family: var(--font-head);
  font-weight: 600;
  color: var(--terracotta);
  margin-bottom: 6px;
}

input,
textarea {
  font-family: var(--font-body);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: .72rem .85rem;
  background: var(--bg);
}

textarea {
  resize: vertical;
}

#contact-success {
  display: none;
  background: var(--fuchsia);
  color: #fff;
  padding: 18px;
  border-radius: var(--radius);
  text-align: center;
  font-family: var(--font-head);
  font-size: 1.1rem;
  margin-top: 12px;
}

/* -----------------------------------
   LEGAL
----------------------------------- */
.legal-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(260px,1fr));
  margin-top: 14px;
}

.legal-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px;
  box-shadow: var(--shadow);
}

.legal-card h3 {
  color: var(--terracotta);
}

/* -----------------------------------
   FOOTER
----------------------------------- */
.site-footer {
  padding: 18px 0;
  border-top: 1px solid rgba(231,221,206,.95);
  background: rgba(251,245,236,.75);
}

.footer__grid {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.footer__nav {
  display: flex;
  gap: 14px;
  font-family: var(--font-head);
  font-weight: 600;
}

.footer__nav a {
  color: var(--fuchsia);
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* -----------------------------------
   RESPONSIVE ADJUSTMENTS
----------------------------------- */
@media (max-width: 900px) {
  .nav-menu {
    display: none;
    flex-direction: column;
    gap: 12px;
  }

  .nav-menu.open {
    display: flex;
    padding-top: 8px;
  }

  .nav-toggle {
    display: inline-flex;
  }

  .blog-card {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .flip-inner {
    transition: none;
  }
}

/* END OF FILE */
