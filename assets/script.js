(() => {
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));
  const base = document.body.getAttribute('data-base') || '';

  /* Header scroll */
  const header = $('[data-header]');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', scrollY > 8);
    onScroll(); addEventListener('scroll', onScroll, {passive:true});
  }

  /* Mobile nav */
  const navBtn = $('[data-nav-toggle]'); const menu = $('[data-menu]');
  if (navBtn && menu) navBtn.addEventListener('click', () => {
    const expanded = navBtn.getAttribute('aria-expanded') === 'true';
    navBtn.setAttribute('aria-expanded', String(!expanded));
    menu.style.display = expanded ? '' : 'flex';
  });

  /* Reveal */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((ents)=>ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('revealed'); io.unobserve(e.target); } }),{threshold:.15});
    reveals.forEach(el=>io.observe(el));
  } else { reveals.forEach(el=>el.classList.add('revealed')); }

  /* Tilt cards (Servicios) */
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    const tiltEls = $$('[data-tilt]');
    tiltEls.forEach(card => {
      const inner = card.querySelector('.service__inner');
      let raf = 0;
      const onMove = (e) => {
        const r = inner.getBoundingClientRect();
        const x = (e.clientX || (e.touches && e.touches[0].clientX)) - r.left;
        const y = (e.clientY || (e.touches && e.touches[0].clientY)) - r.top;
        const rx = ((y / r.height) - .5) * -6;   // rotateX
        const ry = ((x / r.width)  - .5) *  6;   // rotateY
        const glx = (x / r.width) * 100 + '%';
        const gly = (y / r.height) * 100 + '%';
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
          inner.parentElement.style.setProperty('--glx', glx);
          inner.parentElement.style.setProperty('--gly', gly);
        });
      };
      const reset = () => { inner.style.transform = ''; };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', reset);
      card.addEventListener('touchmove', onMove, {passive:true});
      card.addEventListener('touchend', reset);
    });
  }

  /* Tabs (Enfoque) with keyboard nav + progress */
  const tabs = $('[data-tabs]');
  if (tabs) {
    const btns = $$('.tabs__btn', tabs);
    const panels = $$('.tabs__panel', tabs);
    const progress = $('.tabs__progress', tabs);
    const select = (i) => {
      btns.forEach((b,idx) => {
        const sel = idx===i;
        b.setAttribute('aria-selected', sel);
        panels[idx].hidden = !sel;
      });
      if (progress) {
        progress.style.transform = `translateX(${i*100}%)`;
        progress.style.width = '25%';
      }
    };
    btns.forEach((b,i) => {
      b.addEventListener('click', ()=>select(i));
      b.addEventListener('keydown', (e)=>{
        if (['ArrowRight','ArrowLeft','Home','End'].includes(e.key)) {
          e.preventDefault();
          let ni = i + (e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0);
          if (e.key==='Home') ni = 0; if (e.key==='End') ni = btns.length-1;
          if (ni<0) ni = btns.length-1; if (ni>=btns.length) ni = 0;
          btns[ni].focus(); select(ni);
        }
      });
    });
    select(0);
  }

  /* Footer year */
  const y = $('#year'); if (y) y.textContent = String(new Date().getFullYear());

  /* Reading progress (articles) */
  const prog = $('[data-progress]');
  if (prog) {
    const onProg = () => {
      const max = Math.max(1, document.body.scrollHeight - innerHeight);
      prog.style.width = (Math.min(1, scrollY / max) * 100).toFixed(2) + '%';
    };
    onProg(); addEventListener('scroll', onProg, {passive:true}); addEventListener('resize', onProg);
  }

  /* ToC builder (articles) */
  const toc = $('[data-toc] nav');
  if (toc) {
    const hs = $$('.post__body h2, .post__body h3');
    hs.forEach(h => {
      if (!h.id) h.id = h.textContent.toLowerCase().trim().replace(/[^\wáéíóúüñ]+/gi,'-');
      const a = document.createElement('a'); a.href = `#${h.id}`; a.textContent = h.textContent; toc.appendChild(a);
    });
    // Reading time
    const rt = document.querySelector('[data-reading-time]');
    const body = document.querySelector('.post__body');
    if (rt && body) {
      const words = body.textContent.trim().split(/\s+/).length;
      const mins = Math.max(1, Math.ceil(words / 200));
      rt.textContent = `${mins} min · Por Mentes en Movimiento`;
    }
  }

  /* Validate serverless form */
  const form = document.querySelector('[data-validate]');
  if (form) {
    form.addEventListener('submit', (e) => {
      let ok = true;
      const setErr = (id, msg) => { const p = form.querySelector(`[data-err-for="${id}"]`); if (p) p.textContent = msg || ''; };
      ['nombre','email','mensaje'].forEach(id => setErr(id,''));
      const nombre = form.nombre.value.trim();
      const email = form.email.value.trim();
      const mensaje = form.mensaje.value.trim();
      if (!nombre) { setErr('nombre','Añade tu nombre.'); ok=false; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setErr('email','Email no válido.'); ok=false; }
      if (mensaje.length < 10) { setErr('mensaje','Cuéntanos un poco más.'); ok=false; }
      if (!ok) e.preventDefault();
    });
  }

  /* Dynamic blog cards */
  const homeWrap = document.querySelector('[data-blog-home]');
  const archiveWrap = document.querySelector('[data-blog-archive]');
  if (homeWrap || archiveWrap) {
    const postsPath = base ? 'posts.json' : 'blog/posts.json';
    fetch(postsPath).then(r => r.json()).then(posts => {
      const tpl = (p) => {
        const cover = (base ? '../' : '') + p.cover;
        const href = (base ? '' : 'blog/') + `${p.slug}.html`;
        return `
          <article class="blog-card reveal">
            <a class="blog-card__link" href="${href}">
              <img loading="lazy" src="${cover}" alt="" class="blog-card__img" />
              <div class="blog-card__body">
                <span class="badge">${p.tag}</span>
                <h3>${p.title}</h3>
                <p class="muted">${p.excerpt}</p>
                <p class="meta">${p.minutes} min · Lectura</p>
              </div>
            </a>
          </article>`;
      };
      if (homeWrap) homeWrap.innerHTML = posts.slice(0,3).map(tpl).join('');
      if (archiveWrap) archiveWrap.innerHTML = posts.map(tpl).join('');
      $$('.reveal').forEach(el => el.classList.add('revealed'));
    }).catch(()=>{ /* fallback remains */ });
  }

  /* Instagram loader (3 posts) */
  const instaWrap = document.querySelector('[data-insta]');
  if (instaWrap) {
    const url = (base ? '../' : '') + 'assets/insta.json';
    fetch(url).then(r=>r.json()).then(items=>{
      instaWrap.innerHTML = items.slice(0,3).map(it => `
        <a class="insta-card" href="${it.url}" target="_blank" rel="noopener">
          <img src="${(base ? '../' : '')+it.thumb}" alt="${it.alt || ''}" loading="lazy">
        </a>`).join('');
    }).catch(()=>{ /* keep simple links */ });
  }
})();
