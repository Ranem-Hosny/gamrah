/* =========================================================
   جمرة · core — shared layout, cart, routing transitions
   Every page loads: data.js → core.js → <page>.js
   ========================================================= */
window.Site = (() => {
  'use strict';
  const D = window.JAMRA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const img = (id, w = 400) => `https://images.unsplash.com/photo-${id}?w=${w}&q=78&auto=format&fit=crop`;
  const face = (id, w = 120) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${w}&q=80&auto=format&fit=crop&crop=faces`;
  const num = n => Number(n).toLocaleString('ar-EG');
  const pad2 = n => Number(n).toLocaleString('ar-EG', { minimumIntegerDigits: 2, useGrouping: false });
  const money = n => `${num(Math.round(n * 100) / 100)} ر.س`;
  const param = k => new URLSearchParams(location.search).get(k);
  const store = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } },
  };
  const page = document.body.dataset.page || 'home';

  /* ---------------- LAYOUT ---------------- */
  const SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <linearGradient id="g-fire" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#c3161c"/><stop offset=".55" stop-color="#ff6b1a"/><stop offset="1" stop-color="#ffc35a"/></linearGradient>
    <linearGradient id="g-fire-core" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff8a2a"/><stop offset="1" stop-color="#fff0c2"/></linearGradient></defs>
    <symbol id="i-cart" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L20.5 8H6.2M9.5 20a1 1 0 1 0 0-.01M17 20a1 1 0 1 0 0-.01"/></symbol>
    <symbol id="i-plus" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" d="M12 5v14M5 12h14"/></symbol>
    <symbol id="i-minus" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" d="M5 12h14"/></symbol>
    <symbol id="i-close" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/></symbol>
    <symbol id="i-arrow" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M19 12H5m6-6-6 6 6 6"/></symbol>
    <symbol id="i-flame" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c1 3.6 5 5.6 5 10.6a5 5 0 0 1-10 0c0-2.7 1.4-3.9 2.3-5.8.4 1.9 1.2 2.7 1.9 3.1C10.8 6.8 11.2 4.5 12 2z"/></symbol>
    <symbol id="i-clock" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></g></symbol>
    <symbol id="i-star" viewBox="0 0 24 24"><path fill="currentColor" d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1-4.5-4.2 6.1-.8z"/></symbol>
    <symbol id="i-pin" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></g></symbol>
    <symbol id="i-phone" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></symbol>
    <symbol id="i-mail" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></g></symbol>
    <symbol id="i-chat" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M4 19.5 5.3 16A8 8 0 1 1 8 18.7z"/></symbol>
    <symbol id="i-search" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></g></symbol>
    <symbol id="i-calendar" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/></g></symbol>
    <symbol id="i-users" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/></g></symbol>
    <symbol id="i-bike" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17" r="3"/><circle cx="18.5" cy="17" r="3"/><path d="M5.5 17h6l3-7h3l1 7M9 10h5M14 6h3"/></g></symbol>
    <symbol id="i-bag" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2" stroke-linecap="round"/></g></symbol>
    <symbol id="i-copy" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></g></symbol>
    <symbol id="i-insta" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6" fill="currentColor"/></g></symbol>
    <symbol id="i-fb" viewBox="0 0 24 24"><path fill="currentColor" d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4a21 21 0 0 0-2.4-.1c-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21z"/></symbol>
    <symbol id="i-tiktok" viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 3c.4 2.2 1.8 3.6 4 3.8v3a7.4 7.4 0 0 1-4-1.3v6.4a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v3.1a2.6 2.6 0 1 0 1.7 2.4V3z"/></symbol>
    <symbol id="i-x" viewBox="0 0 24 24"><path fill="currentColor" d="M17.8 3h3.2l-7 8 8.2 10h-6.4l-5-6.3L5 21H1.8l7.5-8.6L1.5 3H8l4.5 5.8zm-1.1 16.1h1.8L7.4 4.8H5.5z"/></symbol>
    <symbol id="i-snap" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" d="M12 3.2c3 0 5 2.3 5 5.3v2.3l1.7-.6c.6-.2 1 .6.5 1l-1.9 1.1c.5 1.6 1.8 2.9 3.3 3.4.5.2.4.8-.1 1-1 .3-1.9.4-2.2 1.2-.2.5-.8.6-1.5.5-1-.2-1.8.1-2.6.8-.6.5-1.3.8-2.2.8s-1.6-.3-2.2-.8c-.8-.7-1.6-1-2.6-.8-.7.1-1.3 0-1.5-.5-.3-.8-1.2-.9-2.2-1.2-.5-.2-.6-.8-.1-1 1.5-.5 2.8-1.8 3.3-3.4l-1.9-1.1c-.5-.4-.1-1.2.5-1l1.7.6V8.5c0-3 2-5.3 5-5.3z"/></symbol>
    <symbol id="i-yt" viewBox="0 0 24 24"><rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path fill="currentColor" d="m10 9 5.2 3-5.2 3z"/></symbol>
    <symbol id="i-wa" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M3.5 20.5 4.8 16A8.5 8.5 0 1 1 8 19.2z"/><path d="M9 8.5c0 3.3 2.7 6.5 6.3 6.5l.9-1.6-1.8-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-1.8z" fill="currentColor" stroke="none"/></g></symbol>
    <symbol id="i-check" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="m5 12.5 4.5 4.5L19 7.5"/></symbol>
    <symbol id="logo-mark" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="29" fill="none" stroke="url(#g-fire)" stroke-width="2.5" stroke-dasharray="150 12 4 12"/>
      <path d="M32 9c3.4 10 14.5 15 14.5 29.5a14.5 14.5 0 0 1-29 0c0-7.6 4-11 6.5-16.4 1.1 5.4 3.4 7.6 5.4 8.8C27.7 19.4 28.9 14 32 9z" fill="url(#g-fire)"/>
      <path d="M32.4 28c1.6 4.8 6.6 7 6.6 12.7a7 7 0 0 1-14 0c0-3.3 1.8-5 3-7.4.6 2.4 1.6 3.3 2.4 3.9-.3-3.7.4-6.4 2-9.2z" fill="url(#g-fire-core)"/>
      <circle cx="47" cy="14" r="2" fill="#ffc35a"/><circle cx="16" cy="20" r="1.4" fill="#ff6b1a"/>
    </symbol></svg>`;

  // social accounts (placeholders — replace with the restaurant's real handles)
  const SOCIALS = [
    { name: 'إنستجرام', icon: 'i-insta', handle: '@jamra.sa', url: 'https://instagram.com/', followers: '١٢٨ ألف' },
    { name: 'تيك توك', icon: 'i-tiktok', handle: '@jamra.sa', url: 'https://tiktok.com/', followers: '٢١٠ ألف' },
    { name: 'سناب شات', icon: 'i-snap', handle: 'jamra.sa', url: 'https://snapchat.com/', followers: '٨٥ ألف' },
    { name: 'إكس', icon: 'i-x', handle: '@jamra_sa', url: 'https://x.com/', followers: '٤٣ ألف' },
    { name: 'يوتيوب', icon: 'i-yt', handle: 'جمرة', url: 'https://youtube.com/', followers: '١٩ ألف' },
    { name: 'واتساب', icon: 'i-wa', handle: '+966 11 555 0199', url: 'https://wa.me/966115550199', followers: 'رد خلال دقايق' },
  ];
  const PROMO = [
    '🔥 بوكس العيلة بـ ١٢٩ ر.س بدل ١٦٨',
    'استخدم كود <b dir="ltr">JAMRA10</b> وخد خصم ١٠٪',
    '🛵 توصيل مجاني لأي طلب فوق ١٢٠ ر.س',
    '🍕 بيتزا ١+١ كل ثلاثاء',
    'اطلب أول مرة بكود <b dir="ltr">WELCOME15</b>',
  ];

  const LINKS = [
    ['index.html', 'الرئيسية', 'home'], ['menu.html', 'المنيو', 'menu'], ['offers.html', 'العروض', 'offers'],
    ['branches.html', 'الفروع', 'branches'], ['about.html', 'حكايتنا', 'about'], ['contact.html', 'تواصل', 'contact'],
  ];
  const NAV = `
  <div class="promo" id="promo" role="region" aria-label="عروض">
    <a class="promo-track" href="offers.html" tabindex="-1" aria-hidden="true">
      ${[0, 1].map(() => PROMO.map(t => `<span>${t}</span><i>✦</i>`).join('')).join('')}
    </a>
    <a class="sr-only" href="offers.html">${PROMO.join(' · ')}</a>
    <button class="promo-close" id="promoClose" aria-label="اقفل شريط العروض"><svg><use href="#i-close"/></svg></button>
  </div>
  <a class="skip" href="#main">انتقل للمحتوى</a>
  <nav class="nav" id="nav" aria-label="القائمة الرئيسية">
    <a href="index.html" class="brand" aria-label="جمرة — الرئيسية">
      <svg class="brand-mark"><use href="#logo-mark"/></svg>
      <span class="brand-text"><b>جمرة</b><small>FIRE KITCHEN</small></span>
    </a>
    <ul class="nav-links" id="navLinks">
      ${LINKS.map(([h, t, k]) => `<li><a href="${h}"${k === page ? ' class="active" aria-current="page"' : ''}>${t}</a></li>`).join('')}
      <li class="nav-links-extra"><a href="reserve.html">احجز طاولة</a></li>
      <li class="nav-links-extra"><a href="track.html">تتبع طلبك</a></li>
    </ul>
    <div class="nav-actions">
      <button class="cart-btn" id="cartBtn" aria-label="عرض الطلب">
        <svg><use href="#i-cart"/></svg><span class="cart-count" id="cartCount">0</span>
      </button>
      <a href="reserve.html" class="nav-reserve${page === 'reserve' ? ' active' : ''}"><svg><use href="#i-calendar"/></svg>احجز</a>
      <a href="menu.html" class="nav-order">اطلب</a>
      <button class="burger-toggle" id="menuToggle" aria-label="فتح القائمة" aria-expanded="false" aria-controls="navLinks"><span></span><span></span></button>
    </div>
  </nav>`;

  const FOOTER = `
  <footer class="footer">
    <svg class="footer-flames" viewBox="0 0 1440 110" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 110V70c40 0 50-40 70-60 10 30 30 40 50 40s30-30 50-48c14 30 40 52 70 52 26 0 36-24 54-50 16 34 34 56 66 56s46-34 66-64c18 40 40 60 72 60 30 0 44-26 60-46 14 26 38 44 68 44s40-22 58-52c20 36 42 56 72 56s44-30 62-58c16 38 40 54 70 54 28 0 40-20 56-40 16 26 36 40 62 40s42-28 58-56c18 36 42 58 74 58 30 0 46-30 62-50 14 22 30 34 54 34 26 0 38-20 54-44 12 26 26 40 46 44v84z" fill="var(--coal)"/>
    </svg>
    <div class="container footer-grid">
      <div class="footer-call">
        <h2>لسه <em>جعان؟</em></h2>
        <p>الشواية ولعانة والطلب بيوصلك سخن. افتح المنيو واختار.</p>
        <a href="menu.html" class="btn-order"><span>افتح المنيو</span><svg><use href="#i-arrow"/></svg></a>
        <div class="coals">
          ${SOCIALS.map(s => `<a href="${s.url}" class="coal" target="_blank" rel="noopener" aria-label="${s.name}" title="${s.name}"><svg><use href="#${s.icon}"/></svg></a>`).join('')}
        </div>
      </div>
      <div class="receipt" aria-label="بيانات المطعم">
        <div class="receipt-head">
          <svg class="brand-mark"><use href="#logo-mark"/></svg>
          <b>جمرة · FIRE KITCHEN</b>
          <small>فاتورة رقم #٢٠١٤ — من يوم ما ولّعنا</small>
        </div>
        <div class="receipt-rows">
          <p><span>العنوان</span><span>حي الملقا، الرياض</span></p>
          <p><span>المواعيد</span><span>١ م – ٢ ص</span></p>
          <p><span>التليفون</span><span dir="ltr">+966 11 555 0199</span></p>
          <p><span>التوصيل</span><span>مجاني فوق ١٢٠ ر.س</span></p>
        </div>
        <div class="receipt-total"><span>الإجمالي</span><span>ذكرى حلوة × ∞</span></div>
        <div class="barcode" aria-hidden="true"></div>
        <small class="receipt-thanks">شكراً إنك جيت · ارجع تاني ❤</small>
      </div>
    </div>
    <nav class="container footer-links" aria-label="روابط الموقع">
      ${[['menu.html', 'المنيو'], ['offers.html', 'العروض'], ['branches.html', 'الفروع'], ['reserve.html', 'احجز طاولة'], ['track.html', 'تتبع طلبك'], ['about.html', 'حكايتنا'], ['contact.html', 'تواصل معانا']]
        .map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}
    </nav>
    <div class="footer-giant" aria-hidden="true">جمرة</div>
    <div class="footer-bottom container">
      <small>© ٢٠٢٦ جمرة. كل الحقوق محفوظة.</small>
      <small>الرياض · جدة · الدمام</small>
    </div>
  </footer>`;

  const DRAWER = `
  <div class="scrim" id="scrim"></div>
  <aside class="drawer glass-strong" id="drawer" aria-label="طلبك" aria-hidden="true">
    <header class="drawer-head">
      <h3>طلبك</h3>
      <button class="icon-btn" id="closeDrawer" aria-label="إغلاق"><svg><use href="#i-close"/></svg></button>
    </header>
    <div class="drawer-step">
      <div class="cart-items" id="cartItems"></div>
      <div class="cart-empty" id="cartEmpty">
        <svg class="empty-ico"><use href="#logo-mark"/></svg>
        <b>الطلب لسه فاضي</b>
        <p>افتح المنيو ودوس على أي صنف يتضاف هنا.</p>
        <a href="menu.html" class="btn-ghost">افتح المنيو</a>
      </div>
      <footer class="drawer-foot" id="cartFoot">
        <div class="sum-row"><span>المجموع</span><span id="subTotal"></span></div>
        <div class="sum-row"><span>التوصيل</span><span id="delivery"></span></div>
        <div class="free-bar"><i id="freeBar"></i></div>
        <small class="free-note" id="freeNote"></small>
        <div class="sum-row total"><span>الإجمالي</span><span id="grandTotal"></span></div>
        <a href="checkout.html" class="btn-order wide"><span>كمّل الطلب</span><svg><use href="#i-arrow"/></svg></a>
      </footer>
    </div>
  </aside>
  <button class="order-bar" id="orderBar" aria-label="عرض الطلب">
    <span class="ob-count" id="obCount">0</span><span>عرض الطلب</span><b id="obTotal"></b>
  </button>
  <div class="toast" id="toast" role="status"></div>
  <div class="curtain" id="curtain" aria-hidden="true"><svg class="curtain-logo"><use href="#logo-mark"/></svg></div>`;

  document.body.insertAdjacentHTML('afterbegin', SPRITE + NAV);
  document.body.insertAdjacentHTML('beforeend', (document.body.dataset.noFooter ? '' : FOOTER) + DRAWER);

  /* ---------------- NAV ---------------- */
  const nav = $('#nav'), navLinks = $('#navLinks'), toggle = $('#menuToggle');
  // promo strip: visible at the top of the page, slides away on scroll, can be dismissed for the session
  let promoClosed = false;
  try { promoClosed = sessionStorage.getItem('jamra-promo') === 'off'; } catch { /* ignore */ }
  if (!promoClosed) document.body.classList.add('has-promo');
  $('#promoClose').addEventListener('click', () => {
    document.body.classList.remove('has-promo');
    try { sessionStorage.setItem('jamra-promo', 'off'); } catch { /* ignore */ }
  });
  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 30);
    document.body.classList.toggle('promo-away', scrollY > 30);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  toggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  navLinks.addEventListener('click', e => { if (e.target.closest('a')) { navLinks.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); } });

  /* ---------------- REVEAL ---------------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  const observeReveal = (root = document) => $$('.reveal:not(.in)', root).forEach(el => io.observe(el));

  /* ---------------- EMBERS (any canvas.embers) ---------------- */
  function embers(cv) {
    if (!cv || reduced) return;
    const ctx = cv.getContext('2d');
    let W, H, running = true;
    const parts = [];
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = cv.offsetWidth; H = cv.offsetHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = init => ({
      x: Math.random() * W, y: init ? Math.random() * H : H + 10, r: Math.random() * 2.2 + .5,
      vy: -(Math.random() * 1.2 + .35), sway: Math.random() * 6.3, sw: Math.random() * .02 + .005,
      life: 1, decay: Math.random() * .004 + .0015, hue: 18 + Math.random() * 25,
    });
    resize(); addEventListener('resize', resize);
    const n = Math.round(Math.min(80, W / 18));
    for (let i = 0; i < n; i++) parts.push(spawn(true));
    new IntersectionObserver(([e]) => { const was = running; running = e.isIntersecting; if (running && !was) loop(); }).observe(cv);
    function loop() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter';
      for (const p of parts) {
        p.sway += p.sw; p.x += Math.sin(p.sway) * .6; p.y += p.vy; p.life -= p.decay;
        if (p.life <= 0 || p.y < -10) Object.assign(p, spawn(false));
        const a = Math.max(p.life, 0) * (.6 + Math.random() * .4);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `hsla(${p.hue + 15},100%,75%,${a})`);
        g.addColorStop(.4, `hsla(${p.hue},100%,55%,${a * .5})`);
        g.addColorStop(1, 'hsla(10,100%,50%,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 7); ctx.fill();
      }
      requestAnimationFrame(loop);
    }
    loop();
  }
  $$('canvas.embers').forEach(embers);

  /* ---------------- CART STORE ---------------- */
  const CART_KEY = 'jamra-cart-v2';
  const FREE_AT = 120, FEE = 12;
  let lines = store.get(CART_KEY, []);
  if (!Array.isArray(lines)) lines = [];
  // migrate the old {id: qty} cart from the landing page version
  const old = store.get('jamra-cart-sa', null);
  if (old && !Array.isArray(old) && !lines.length) {
    lines = Object.entries(old).map(([id, qty]) => ({ key: id + '|', id, qty, extras: [], note: '' }));
    try { localStorage.removeItem('jamra-cart-sa'); } catch { /* ignore */ }
  }
  lines = lines.filter(l => D.ITEMS[l.id] && l.qty > 0);

  const extraPrice = (item, name) => {
    const e = (D.EXTRAS[item.catKey] || []).find(x => x[0] === name);
    return e ? e[1] : 0;
  };
  const unitPrice = l => { const it = D.ITEMS[l.id]; return it.price + (l.extras || []).reduce((s, n) => s + extraPrice(it, n), 0); };
  const Cart = {
    get lines() { return lines; },
    count: () => lines.reduce((a, l) => a + l.qty, 0),
    subtotal: () => lines.reduce((s, l) => s + unitPrice(l) * l.qty, 0),
    unitPrice,
    add(id, { qty = 1, extras = [], note = '' } = {}) {
      const key = id + '|' + [...extras].sort().join(',') + (note ? '|' + note : '');
      const ex = lines.find(l => l.key === key);
      if (ex) ex.qty += qty; else lines.push({ key, id, qty, extras: [...extras], note });
      this.save();
    },
    setQty(key, q) {
      const l = lines.find(x => x.key === key); if (!l) return;
      l.qty = q; if (l.qty <= 0) lines = lines.filter(x => x !== l);
      this.save();
    },
    clear() { lines = []; this.save(); },
    save() { store.set(CART_KEY, lines); renderCart(); dispatchEvent(new CustomEvent('cart:change')); },
  };

  const COUPON_KEY = 'jamra-coupon';
  function pricing({ type = 'delivery', coupon = store.get(COUPON_KEY, null) } = {}) {
    const sub = Cart.subtotal();
    const fee = type === 'pickup' || sub === 0 || sub >= FREE_AT ? 0 : FEE;
    let disc = 0, cp = null;
    if (coupon) {
      cp = D.COUPONS.find(c => c.code === coupon);
      if (cp && sub >= cp.min) disc = cp.type === 'pct' ? Math.round(sub * cp.value) / 100 : Math.min(cp.value, sub);
      else cp = null;
    }
    return { sub, fee, disc, coupon: cp, total: Math.max(0, sub + fee - disc) };
  }

  /* ---------------- DRAWER ---------------- */
  const cartBtn = $('#cartBtn'), drawer = $('#drawer'), scrim = $('#scrim'), bar = $('#orderBar');
  function renderCart() {
    const c = Cart.count(), p = pricing();
    $('#cartCount').textContent = num(c);
    $('#cartCount').classList.toggle('on', c > 0);
    $('#obCount').textContent = num(c);
    $('#obTotal').textContent = money(p.sub + p.fee);
    bar.classList.toggle('on', c > 0 && !drawer.classList.contains('open') && page !== 'checkout');
    $('#cartItems').innerHTML = lines.map(l => {
      const it = D.ITEMS[l.id];
      return `<div class="c-item" data-key="${l.key}">
        <a href="${l.id[0] === 'o' ? 'offers.html' : 'dish.html?id=' + l.id}"><img src="${img(it.img, 160)}" alt=""></a>
        <div><b>${it.name}</b>${l.extras.length ? `<span class="c-extras">+ ${l.extras.join('، ')}</span>` : ''}<small>${money(unitPrice(l) * l.qty)}</small></div>
        <div class="qty">
          <button data-q="1" aria-label="زوّد ${it.name}"><svg><use href="#i-plus"/></svg></button>
          <span>${num(l.qty)}</span>
          <button data-q="-1" aria-label="قلّل ${it.name}"><svg><use href="#i-minus"/></svg></button>
        </div></div>`;
    }).join('');
    $('#cartEmpty').classList.toggle('on', c === 0);
    $('#cartFoot').hidden = c === 0;
    $('#subTotal').textContent = money(p.sub);
    $('#delivery').textContent = p.fee ? money(p.fee) : 'مجاني';
    $('#grandTotal').textContent = money(p.sub + p.fee);
    $('#freeBar').style.width = Math.min(100, p.sub / FREE_AT * 100) + '%';
    $('#freeNote').textContent = p.sub >= FREE_AT ? 'التوصيل عليك مجاني 🎉' : `فاضل ${money(FREE_AT - p.sub)} والتوصيل يبقى مجاني`;
  }
  $('#cartItems').addEventListener('click', e => {
    const b = e.target.closest('[data-q]'); if (!b) return;
    const key = b.closest('.c-item').dataset.key;
    const l = lines.find(x => x.key === key);
    if (l) Cart.setQty(key, l.qty + +b.dataset.q);
  });
  let lastFocus = null;
  function openDrawer() {
    lastFocus = document.activeElement;
    drawer.classList.add('open'); scrim.classList.add('on');
    drawer.setAttribute('aria-hidden', 'false'); renderCart();
    setTimeout(() => $('#closeDrawer').focus(), 50);
  }
  function closeDrawer() {
    drawer.classList.remove('open'); scrim.classList.remove('on');
    drawer.setAttribute('aria-hidden', 'true'); renderCart();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  cartBtn.addEventListener('click', openDrawer);
  bar.addEventListener('click', openDrawer);
  $('#closeDrawer').addEventListener('click', closeDrawer);
  scrim.addEventListener('click', closeDrawer);
  addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer(); });

  /* ---------------- TOAST ---------------- */
  let toastT;
  function toast(html) {
    const t = $('#toast'); t.innerHTML = html; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2000);
  }

  /* ---------------- FLY TO CART ---------------- */
  function flyToCart(srcImg, cb) {
    const r = srcImg.getBoundingClientRect();
    const target = (bar.classList.contains('on') && innerWidth <= 1120) ? $('.ob-count', bar) : cartBtn;
    const t = target.getBoundingClientRect();
    const size = Math.min(Math.max(Math.min(r.width, r.height), 70), 160);
    const x0 = r.left + r.width / 2 - size / 2, y0 = r.top + r.height / 2 - size / 2;
    const dx = t.left + t.width / 2 - (x0 + size / 2), dy = t.top + t.height / 2 - (y0 + size / 2);
    const f = document.createElement('img');
    f.className = 'flyer'; f.src = srcImg.currentSrc || srcImg.src; f.alt = '';
    Object.assign(f.style, { left: x0 + 'px', top: y0 + 'px', width: size + 'px', height: size + 'px' });
    document.body.appendChild(f);
    const lift = Math.min(160, Math.abs(dy) * .45 + 80);
    const anim = f.animate([
      { transform: 'translate(0,0) scale(1) rotate(0deg)', offset: 0 },
      { transform: 'translate(0,-34px) scale(1.35) rotate(-12deg)', offset: .18 },
      { transform: `translate(${dx * .45}px, ${Math.min(dy * .45, 0) - lift}px) scale(.9) rotate(160deg)`, offset: .55 },
      { transform: `translate(${dx}px, ${dy}px) scale(.16) rotate(380deg)`, offset: 1 },
    ], { duration: 1050, easing: 'cubic-bezier(.45,0,.25,1)', fill: 'forwards' });
    let alive = true;
    const trail = () => {
      if (!alive) return;
      const fr = f.getBoundingClientRect();
      const s = document.createElement('i'); s.className = 'spark';
      s.style.left = fr.left + fr.width / 2 + 'px'; s.style.top = fr.top + fr.height / 2 + 'px';
      document.body.appendChild(s);
      s.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${(Math.random() - .5) * 40}px, ${Math.random() * 30 + 10}px) scale(0)`, opacity: 0 }],
      { duration: 600, easing: 'ease-out' }).onfinish = () => s.remove();
      setTimeout(trail, 40);
    };
    setTimeout(trail, 180);
    anim.onfinish = () => { alive = false; f.remove(); cb(); };
  }

  function addToCart(id, srcImg, opts) {
    if (!D.ITEMS[id]) return;
    const done = () => {
      Cart.add(id, opts);
      cartBtn.classList.remove('bump'); void cartBtn.offsetWidth; cartBtn.classList.add('bump');
      toast(`اتضاف للطلب: <b>${D.ITEMS[id].name}</b>`);
    };
    if (srcImg && !reduced) flyToCart(srcImg, done); else done();
  }
  // any element with data-add="<id>" adds to cart, flying the nearest card image
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-add]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const card = b.closest('[data-card]');
    addToCart(b.dataset.add, card && $('img', card));
  });

  /* ---------------- SHARED RENDERERS ---------------- */
  const dishCard = it => `
    <article class="dish-card glass" data-card>
      <a class="dish-media" href="dish.html?id=${it.id}" aria-label="${it.name}">
        <img src="${img(it.img, 500)}" alt="${it.name}" loading="lazy">
        ${it.tag ? `<span class="dish-tag-pill">${it.tag}</span>` : ''}
      </a>
      <div class="dish-body">
        <a href="dish.html?id=${it.id}" class="dish-name">${it.name}</a>
        <p>${it.desc}</p>
        <div class="dish-meta"><span><svg><use href="#i-clock"/></svg>${num(it.time)} د</span><span>${num(it.cal)} سعرة</span></div>
        <div class="dish-row">
          <b>${money(it.price)}</b>
          <button class="add-mini" data-add="${it.id}" aria-label="أضف ${it.name}"><svg><use href="#i-plus"/></svg></button>
        </div>
      </div>
    </article>`;

  const offerCard = (o, i = 0) => `
    <article class="offer ${o.big ? 'big' : ''} reveal" style="--d:${i * .07}s" data-card>
      <img src="${img(o.img, o.big ? 1000 : 600)}" alt="${o.name}" loading="lazy">
      <span class="offer-badge"><small>خصم</small>${num(Math.round((1 - o.price / o.old) * 100))}٪</span>
      <span class="offer-when">${o.when}</span>
      <h3>${o.name}</h3>
      <p>${o.desc}</p>
      <div class="offer-row glass">
        <span class="offer-price"><b>${money(o.price)}</b><s>${num(o.old)}</s></span>
        <button class="offer-add" data-add="${o.id}"><svg><use href="#i-plus"/></svg> أضف العرض</button>
      </div>
    </article>`;

  const reviewCard = r => `<figure class="review glass" style="margin:0">
    <div class="review-top"><img class="review-av" src="${face(r.p)}" alt="${r.n}" loading="lazy">
      <div><b>${r.n}</b><span>${r.w}</span><small>★★★★★</small></div></div>
    <p>${r.t}</p></figure>`;

  function countdown(root = document) {
    const H = $('[data-cd=h]', root), M = $('[data-cd=m]', root), S = $('[data-cd=s]', root);
    if (!H) return;
    const tick = () => {
      const now = new Date(), end = new Date(now); end.setHours(24, 0, 0, 0);
      let s = Math.max(0, Math.floor((end - now) / 1000));
      H.textContent = pad2(Math.floor(s / 3600)); s %= 3600;
      M.textContent = pad2(Math.floor(s / 60)); S.textContent = pad2(s % 60);
    };
    tick(); setInterval(tick, 1000);
  }

  // branch open/closed (close hour may exceed 24 → after midnight)
  function branchStatus(b, d = new Date()) {
    const h = d.getHours() + d.getMinutes() / 60;
    const open = (h >= b.open && h < b.close) || (h + 24 >= b.open && h + 24 < b.close);
    const fmt = x => { const hh = x % 24; return `${num(hh % 12 || 12)} ${hh < 12 ? 'ص' : 'م'}`; };
    return { open, label: open ? `مفتوح دلوقتي · يقفل ${fmt(b.close)}` : `مقفول · يفتح ${fmt(b.open)}`, hours: `${fmt(b.open)} – ${fmt(b.close)}` };
  }

  /* ---------------- PAGE TRANSITIONS (routing) ---------------- */
  const curtain = $('#curtain');
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$/.test(url.pathname)) return;
    const samePage = url.pathname === location.pathname && url.search === location.search;
    if (samePage) {
      if (url.hash) { // in-page anchor
        const t = document.getElementById(url.hash.slice(1));
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); history.replaceState(null, '', url.hash); }
      }
      return;
    }
    if (reduced) return;
    e.preventDefault();
    curtain.style.setProperty('--x', e.clientX + 'px');
    curtain.style.setProperty('--y', e.clientY + 'px');
    curtain.classList.add('on');
    setTimeout(() => { location.href = url.href; }, 520);
  });
  addEventListener('pageshow', e => { if (e.persisted) curtain.classList.remove('on'); });
  // the arrival animation runs from CSS; remove the class once done so it never replays
  setTimeout(() => document.documentElement.classList.remove('page-enter'), 1100);

  renderCart();
  // Page scripts render cards AFTER core runs (and the browser may paint in between),
  // so watch the DOM and register every .reveal element whenever it appears.
  observeReveal();
  new MutationObserver(muts => {
    for (const m of muts) for (const n of m.addedNodes) {
      if (n.nodeType !== 1) continue;
      if (n.matches('.reveal:not(.in)')) io.observe(n);
      n.querySelectorAll && n.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));
    }
  }).observe(document.body, { childList: true, subtree: true });

  return { $, $$, D, reduced, img, face, num, pad2, money, param, store, page, Cart, pricing, addToCart, flyToCart, toast, openDrawer, observeReveal, embers, dishCard, offerCard, reviewCard, countdown, branchStatus, COUPON_KEY, SOCIALS };
})();
