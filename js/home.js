/* =========================================================
   جمرة · home page (hero plates, story video, menu book,
   offers, favourites, reviews)
   ========================================================= */
(() => {
  'use strict';
  const { $, $$, D, reduced, img, num, money, addToCart, offerCard, reviewCard, countdown } = Site;
  const { MENU, ITEMS, OFFERS, REVIEWS } = D;

  /* ---------------- HERO: dishes only ---------------- */
  const HERO_DISHES = ['b1', 'p1', 'z1', 'g1'];
  const plates = $('#plates');
  let heroIdx = -1, heroCurrent = null, heroTimer;
  HERO_DISHES.forEach(id => { const im = new Image(); im.src = img(ITEMS[id].img, 900); });
  function showDish(i) {
    const it = ITEMS[HERO_DISHES[i]];
    const el = document.createElement('div');
    el.className = 'plate';
    el.innerHTML = `<div class="glass-plate"></div><div class="spin"><img src="${img(it.img, 900)}" alt=""></div><div class="glass-shine"></div>`;
    plates.appendChild(el);
    const prev = heroCurrent;
    if (prev) {
      prev.animate([
        { transform: 'translateY(0) rotate(0) scale(1)', opacity: 1 },
        { transform: 'translateY(115%) rotate(110deg) scale(.75)', opacity: 0 },
      ], { duration: reduced ? 1 : 750, easing: 'cubic-bezier(.55,0,.75,.2)', fill: 'forwards' })
        .onfinish = () => prev.remove();
    }
    el.animate([
      { transform: 'translateY(-125%) rotate(-150deg) scale(.7)', opacity: 0 },
      { transform: 'translateY(-60%) rotate(-80deg) scale(.85)', opacity: 1, offset: .35 },
      { transform: 'translateY(5%) rotate(6deg) scale(1.03, .97)', offset: .7 },
      { transform: 'translateY(-2%) rotate(-2deg) scale(.99, 1.01)', offset: .85 },
      { transform: 'translateY(0) rotate(0) scale(1)', opacity: 1 },
    ], { duration: reduced ? 1 : 1150, delay: prev && !reduced ? 220 : 0, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'both' });
    heroCurrent = el; heroIdx = i;
  }
  const heroLoop = () => showDish((heroIdx + 1) % HERO_DISHES.length);
  const startHero = () => { clearInterval(heroTimer); if (!reduced) heroTimer = setInterval(heroLoop, 3800); };
  heroLoop(); startHero();
  document.addEventListener('visibilitychange', () => (document.hidden ? clearInterval(heroTimer) : startHero()));

  /* ---------------- STORY VIDEO ---------------- */
  const reel = $('#reel');
  if (reel) {
    if (reduced) { reel.removeAttribute('autoplay'); reel.pause(); }
    new IntersectionObserver(([e]) => {
      if (reduced) return;
      e.isIntersecting ? reel.play().catch(() => {}) : reel.pause();
    }, { threshold: .2 }).observe(reel);
  }

  /* ---------------- MENU BOOK ---------------- */
  const book = $('#book'), pageR = $('#pageR'), pageL = $('#pageL');
  const ribbons = $('#ribbons');
  const mqSingle = matchMedia('(max-width: 820px)');
  let page = 0, flipping = false;

  const rightHTML = (c, i) => `
    <div class="pg-photo"><img src="${img(c.cover, 900)}" alt="${c.name}" draggable="false"></div>
    <span class="pg-stamp">${c.stamp}</span>
    <div class="pg-photo-text">
      <span class="pg-num">صفحة ${num(i * 2 + 1)}</span>
      <h3>${c.name}</h3>
      <p>${c.line}</p>
    </div>`;
  const leftHTML = (c, i) => `
    <div class="pg-items">
      <div class="pg-items-head"><h4>${c.icon} ${c.name}</h4><span>الأسعار بالريال</span></div>
      ${c.items.map(it => `
        <div class="item" data-id="${it.id}" role="button" tabindex="0" aria-label="أضف ${it.name} — ${money(it.price)}">
          <img class="item-img" src="${img(it.img, 220)}" alt="" loading="lazy" draggable="false">
          <div class="item-body"><b>${it.name}${it.tag ? `<span class="item-tag">${it.tag}</span>` : ''}</b><small>${it.desc}</small></div>
          <div class="item-side"><span class="item-price">${num(it.price)}</span><span class="item-add" aria-hidden="true"><svg><use href="#i-plus"/></svg></span></div>
        </div>`).join('')}
      <div class="pg-foot"><span>جمرة · FIRE KITCHEN</span><span>صفحة ${num(i * 2 + 2)}</span></div>
    </div>`;

  ribbons.innerHTML = MENU.map((c, i) => `
    <button class="ribbon" role="tab" data-i="${i}" aria-selected="${i === 0}">
      <span class="ribbon-img"><img src="${img(c.thumb, 200)}" alt="" draggable="false"></span>
      <span>${c.name}</span>
    </button>`).join('');

  book.insertAdjacentHTML('beforeend', `
    <button class="corner corner-next" id="cornerNext" aria-label="الصفحة الجاية"></button>
    <button class="corner corner-prev" id="cornerPrev" aria-label="الصفحة اللي فاتت"></button>`);
  const cornerNext = $('#cornerNext'), cornerPrev = $('#cornerPrev');

  function syncUI() {
    $$('.ribbon', ribbons).forEach((b, i) => b.setAttribute('aria-selected', i === page));
    $('#pageIndicator').textContent = `${num(page + 1)} من ${num(MENU.length)}`;
    cornerPrev.hidden = page === 0;
    cornerNext.hidden = page === MENU.length - 1;
    const active = $$('.ribbon', ribbons)[page];
    if (active && ribbons.scrollWidth > ribbons.clientWidth) {
      ribbons.scrollTo({ left: active.offsetLeft - ribbons.clientWidth / 2 + active.offsetWidth / 2, behavior: 'smooth' });
    }
  }
  function renderBook() {
    pageR.innerHTML = rightHTML(MENU[page], page);
    pageL.innerHTML = leftHTML(MENU[page], page);
    syncUI();
  }
  MENU.forEach(c => { const im = new Image(); im.src = img(c.cover, 900); });

  // two-page spread: Arabic books turn the LEFT page over to the right
  function buildLeaf(fwd, to) {
    const leaf = document.createElement('div');
    leaf.className = 'leaf ' + (fwd ? 'from-left' : 'from-right');
    const under = fwd ? pageL : pageR;
    const oldUnder = under.innerHTML;
    leaf.innerHTML = `
      <div class="leaf-face front"><div class="page ${fwd ? 'page-left' : 'page-right'}">${under.innerHTML}</div><i class="leaf-shade"></i></div>
      <div class="leaf-face back"><div class="page ${fwd ? 'page-right' : 'page-left'}">${fwd ? rightHTML(MENU[to], to) : leftHTML(MENU[to], to)}</div><i class="leaf-shade"></i></div>`;
    book.appendChild(leaf);
    under.innerHTML = fwd ? leftHTML(MENU[to], to) : rightHTML(MENU[to], to);
    return {
      set(p) {
        leaf.style.transform = `rotateY(${(fwd ? 1 : -1) * p * 180}deg)`;
        const s = Math.sin(p * Math.PI) * .7;
        $$('.leaf-shade', leaf).forEach(x => { x.style.opacity = s; });
      },
      commit() {
        if (fwd) pageR.innerHTML = rightHTML(MENU[to], to); else pageL.innerHTML = leftHTML(MENU[to], to);
        leaf.remove(); page = to; syncUI(); flipping = false;
      },
      cancel() { under.innerHTML = oldUnder; leaf.remove(); flipping = false; },
    };
  }
  function tween(from, to, dur, onStep, done) {
    if (reduced) { onStep(to); done(); return; }
    const t0 = performance.now();
    const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    (function step(now) {
      const k = Math.min(1, (now - t0) / dur);
      onStep(from + (to - from) * ease(k));
      k < 1 ? requestAnimationFrame(step) : done();
    })(t0);
  }
  // single page (mobile): page turns around its edge
  function singleTurn(fwd) {
    const pages = [pageR, pageL];
    const origin = fwd ? 'right center' : 'left center';
    return {
      set(p) { pages.forEach(el => { el.style.transformOrigin = origin; el.style.transform = `rotateY(${(fwd ? 1 : -1) * p * 90}deg)`; el.style.opacity = 1 - p * .6; }); },
      reset() { pages.forEach(el => { el.style.transform = ''; el.style.opacity = ''; }); },
      swapIn(to) {
        page = to; renderBook();
        pages.forEach(el => { el.style.transformOrigin = fwd ? 'left center' : 'right center'; });
        tween(1, 0, 420, p => pages.forEach(el => { el.style.transform = `rotateY(${(fwd ? -1 : 1) * p * 90}deg)`; el.style.opacity = 1 - p * .6; }),
          () => { this.reset(); flipping = false; });
      },
    };
  }
  function flipTo(to) {
    if (flipping || to === page || to < 0 || to >= MENU.length) return;
    const fwd = to > page;
    if (reduced) { page = to; renderBook(); return; }
    flipping = true;
    if (mqSingle.matches) { const t = singleTurn(fwd); tween(0, 1, 360, p => t.set(p), () => t.swapIn(to)); return; }
    const L = buildLeaf(fwd, to);
    tween(0, 1, 1000, p => L.set(p), () => L.commit());
  }

  // drag the page with your finger / mouse
  let drag = null, suppressClick = false;
  book.addEventListener('pointerdown', e => {
    if (flipping || e.button > 0) return;
    const r = book.getBoundingClientRect();
    drag = { x0: e.clientX, y0: e.clientY, w: r.width, side: e.clientX < r.left + r.width / 2 ? 'left' : 'right', id: e.pointerId, started: false, p: 0 };
  });
  book.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.started) {
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy)) return;
      const fwd = mqSingle.matches ? dx > 0 : drag.side === 'left';
      const to = page + (fwd ? 1 : -1);
      if (to < 0 || to >= MENU.length) { drag = null; return; }
      drag.started = true; drag.fwd = fwd; drag.to = to; flipping = true;
      drag.ctl = mqSingle.matches ? singleTurn(fwd) : buildLeaf(fwd, to);
      book.classList.add('dragging');
      try { book.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    }
    const span = mqSingle.matches ? drag.w * .8 : drag.w;
    drag.p = Math.max(0, Math.min(1, (drag.fwd ? dx : -dx) / span));
    drag.ctl.set(drag.p);
  });
  const endDrag = e => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null;
    if (!d.started) return;
    book.classList.remove('dragging');
    suppressClick = true; setTimeout(() => { suppressClick = false; }, 60);
    const go = d.p > .28;
    if (mqSingle.matches) {
      if (go) tween(d.p, 1, 260 * (1 - d.p) + 80, p => d.ctl.set(p), () => d.ctl.swapIn(d.to));
      else tween(d.p, 0, 260, p => d.ctl.set(p), () => { d.ctl.reset(); flipping = false; });
    } else {
      if (go) tween(d.p, 1, 700 * (1 - d.p) + 150, p => d.ctl.set(p), () => d.ctl.commit());
      else tween(d.p, 0, 500 * d.p + 100, p => d.ctl.set(p), () => d.ctl.cancel());
    }
  };
  book.addEventListener('pointerup', endDrag);
  book.addEventListener('pointercancel', endDrag);

  cornerNext.addEventListener('click', () => { if (!suppressClick) flipTo(page + 1); });
  cornerPrev.addEventListener('click', () => { if (!suppressClick) flipTo(page - 1); });
  ribbons.addEventListener('click', e => { const b = e.target.closest('.ribbon'); if (b) flipTo(+b.dataset.i); });
  ribbons.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    flipTo(page + (e.key === 'ArrowLeft' ? 1 : -1)); // RTL
    setTimeout(() => { const b = $$('.ribbon', ribbons)[page]; b && b.focus(); }, 0);
  });

  const pickItem = el => {
    addToCart(el.dataset.id, $('.item-img', el));
    el.classList.add('added');
    setTimeout(() => el.classList.remove('added'), 900);
  };
  book.addEventListener('click', e => {
    if (suppressClick || flipping) return;
    const it = e.target.closest('#pageL .item'); if (it) pickItem(it);
  });
  book.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('item')) { e.preventDefault(); pickItem(e.target); }
  });
  mqSingle.addEventListener('change', () => { if (!flipping) renderBook(); });
  renderBook();

  /* ---------------- OFFERS / FAVS / REVIEWS ---------------- */
  $('#offerGrid').innerHTML = OFFERS.map(offerCard).join('');
  countdown($('#offers'));

  const FAVS = [
    { id: 'b2', note: 'طلبوه ١٢٠٠ مرة الأسبوع ده' },
    { id: 'p2', note: 'اختيار الشيف' },
    { id: 'z1', note: 'الكلاسيكية اللي مبتخيبش' },
    { id: 'g1', note: 'للي بيحب اللحمة بجد' },
  ];
  $('#favGrid').innerHTML = FAVS.map((f, i) => {
    const it = ITEMS[f.id];
    return `<article class="fav glass reveal" style="--d:${i * .08}s" data-card>
      <a href="dish.html?id=${it.id}" aria-label="${it.name}"><img class="fav-img" src="${img(it.img, 400)}" alt="${it.name}" loading="lazy"></a>
      <span class="fav-rank"><svg><use href="#i-star"/></svg> ${f.note}</span>
      <h3><a href="dish.html?id=${it.id}">${it.name}</a></h3>
      <p>${it.desc}</p>
      <div class="fav-row"><b>${money(it.price)}</b><button class="add-mini" data-add="${it.id}" aria-label="أضف ${it.name}"><svg><use href="#i-plus"/></svg></button></div>
    </article>`;
  }).join('');

  // two identical halves → translateX(50%) loops seamlessly
  $('#reviewsA').innerHTML = REVIEWS.map(reviewCard).join('').repeat(2);
})();
