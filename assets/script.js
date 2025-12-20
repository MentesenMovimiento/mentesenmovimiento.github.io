(() => {
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));

  // Header tone on scroll
  const header = $('[data-header]');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    onScroll(); window.addEventListener('scroll', onScroll, {passive:true});
  }

  // Mobile nav
  const navBtn = $('[data-nav-toggle]'); const menu = $('[data-menu]');
  if (navBtn && menu) navBtn.addEventListener('click', () => {
    const expanded = navBtn.getAttribute('aria-expanded') === 'true';
    navBtn.setAttribute('aria-expanded', String(!expanded));
    menu.style.display = expanded ? '' : 'flex'; // why: simple toggle, no framework
  });

  // Reveal on scroll
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((ents) => ents.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
    }), {threshold:0.15});
    reveals.forEach(el => io.observe(el));
  } else { reveals.forEach(el => el.classList.add('revealed')); }

  // Close sibling details to keep UI tidy
  $$('.card details').forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) $$('.card details').forEach(o => { if (o !== d) o.open = false; });
  }));

  // Footer year
  const y = document.getElementById('year'); if (y) y.textContent = String(new Date().getFullYear());

  // Reading progress
  const progress = document.querySelector('[data-progress]');
  if (progress) {
    const onProg = () => {
      const max = Math.max(1, document.body.scrollHeight - innerHeight);
      progress.style.width = (Math.min(1, scrollY / max) * 100).toFixed(2) + '%';
    };
    onProg(); addEventListener('scroll', onProg, {passive:true}); addEventListener('resize', onProg);
  }

  // Build ToC
  const toc = document.querySelector('[data-toc] nav');
  if (toc) {
    const hs = $$('.post__body h2, .post__body h3');
    hs.forEach(h => {
      if (!h.id) h.id = h.textContent.toLowerCase().trim().replace(/[^\wáéíóúüñ]+/gi,'-');
      const a = document.createElement('a'); a.href = `#${h.id}`; a.textContent = h.textContent; toc.appendChild(a);
    });
  }

  // Simple form validation (mailto fallback)
  const form = document.querySelector('[data-validate]');
  if (form) {
    form.addEventListener('submit', (e) => {
      let ok = true;
      const setErr = (id, msg) => { const p = form.querySelector(`[data-err-for="${id}"]`); if (p) p.textContent = msg || ''; };
      ['nombre','email','mensaje'].forEach(id => setErr(id,''));
      const nombre = form.nombre.value.trim();
      const email = form.email.value.trim();
      const mensaje = form.mensaje.value.trim();
      if (!nombre) { setErr('nombre','Añade tu nombre.'); ok = false; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setErr('email','Email no válido.'); ok = false; }
      if (mensaje.length < 10) { setErr('mensaje','Cuéntanos un poco más.'); ok = false; }
      if (!ok) e.preventDefault();
    });
  }
})();
