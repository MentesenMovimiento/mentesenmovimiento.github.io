(() => {
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));
  const base = document.body.getAttribute('data-base') || '';

  /* Header scroll state */
  const header = document.querySelector('[data-header]');
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
    menu.style.flexWrap = 'wrap';
  });

  /* Reveal on scroll */
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
        const client = e.touches ? e.touches[0] : e;
        const x = client.clientX - r.left;
        const y = client.clientY - r.top;
        const rx = ((y / r.height) - .5) * -6;
        const ry = ((x / r.width)  - .5) *  6;
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

  /* Tabs (Enfoque) with keyboard nav + auto-rotate + click zones */
  const tabs = $('[data-tabs]');
  if (tabs) {
    const btns = $$('.tabs__btn', tabs);
    const panels = $$('.tabs__panel', tabs);
    const progress = $('.tabs__progress', tabs);
    const zonePrev = $('.tabs__zone--left', tabs);
    const zoneNext = $('.tabs__zone--right', tabs);
    const autoplayMs = Number(tabs.getAttribute('data-autoplay')) || 6000;

    let idx = 0;
    let timer = null;
    let paused = false;

    const select = (i) => {
      idx = (i + btns.length) % btns.length;
      btns.forEach((b,bi) => {
        const sel = bi===idx;
        b.setAttribute('aria-selected', sel);
        panels[bi].hidden = !sel;
      });
      if (progress) {
        progress.style.transform = `translateX(${idx*100}%)`;
        progress.style.width = (100/btns.length) + '%';
      }
    };

    const next = () => select(idx + 1);
    const prev = () => select(idx - 1);

    const start = () => {
      if (timer) clearInterval(timer);
      if (!paused) timer = setInterval(next, autoplayMs);
    };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };

    // Buttons click / keyboard
    btns.forEach((b,i) => {
      b.addEventListener('click', () => { select(i); start(); }); // reset timer
      b.addEventListener('keydown', (e)=>{
        if (['ArrowRight','ArrowLeft','Home','End'].includes(e.key)) {
          e.preventDefault();
          let ni = i + (e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0);
          if (e.key==='Home') ni = 0; if (e.key==='End') ni = btns.length-1;
          select(ni); btns[ni].focus(); start();
        }
      });
    });

    // Click zones (semi-transparent arrows)
    if (zonePrev) zonePrev.addEventListener('click', ()=>{ prev(); start(); });
    if (zoneNext) zoneNext.addEventListener('click', ()=>{ next(); start(); });

    // Pause on hover/focus within tabs
    const pause = () => { paused = true; stop(); };
    const resume = () => { paused = false; start(); };
    tabs.addEventListener('pointerenter', pause);
    tabs.addEventListener('pointerleave', resume);
    tabs.addEventListener('focusin', pause);
    tabs.addEventListener('focusout', (e)=>{ if(!tabs.contains(e.relatedTarget)) resume(); });

    // Pause when page hidden
    document.addEventListener('visibilitychange', ()=>{ document.hidden ? stop() : start(); });

    select(0);
    start();
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

  /* ToC builder + reading-time (articles) */
  const toc = $('[data-toc] nav');
  if (toc) {
    const hs = $$('.post__body h2, .post__body h3');
    hs.forEach(h => {
      if (!h.id) h.id = h.textContent.toLowerCase().trim().replace(/[^\wáéíóúüñ]+/gi,'-');
      const a = document.createElement('a'); a.href = `#${h.id}`; a.textContent = h.textContent; toc.appendChild(a);
    });
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

  /* Dynamic blog cards: home + archive */
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
    }).catch(()=>{});
  }

  /* Instagram (3 posts) */
  const instaWrap = document.querySelector('[data-insta]');
  if (instaWrap) {
    const url = (base ? '../' : '') + 'assets/insta.json';
    fetch(url).then(r=>r.json()).then(items=>{
      instaWrap.innerHTML = items.slice(0,3).map(it => `
        <a class="insta-card" href="${it.url}" target="_blank" rel="noopener">
          <img src="${(base ? '../' : '')+it.thumb}" alt="${it.alt || ''}" loading="lazy">
        </a>`).join('');
    }).catch(()=>{});
  }

  /* Hide empty service banner if image is missing */
  document.querySelectorAll('.service__media').forEach(el=>{
    const url = getComputedStyle(el).getPropertyValue('--bg-url');
    if(!url || url.trim()==='') el.style.display='none';
  });
})();
