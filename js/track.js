/* جمرة · order tracking + history (orders live in localStorage) */
(() => {
  'use strict';
  const { $, D, img, num, pad2, money, param, store, Cart, toast } = Site;
  const orders = store.get('jamra-orders', []);
  const no = param('o');
  const order = orders.find(o => o.no === no) || (!no && orders[0]);
  const root = $('#trackRoot');
  const toAr = s => String(s).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

  const STEPS = {
    delivery: ['استلمنا الطلب', 'على الشواية', 'في الطريق ليك', 'وصل بالهنا والشفا'],
    pickup: ['استلمنا الطلب', 'على الشواية', 'جاهز للاستلام', 'اتستلم'],
  };
  // timeline (minutes from start): received → cooking → out/ready → done
  function stage(o, now = Date.now()) {
    const start = o.scheduled != null ? scheduledStart(o) : o.createdAt;
    const mins = (now - start) / 60000;
    const marks = o.type === 'pickup' ? [0, 2, o.eta - 2, o.eta + 20] : [0, 2, o.eta * .55, o.eta];
    let s = 0; marks.forEach((m, i) => { if (mins >= m) s = i; });
    if (now < start) s = -1;
    const progress = Math.max(0, Math.min(1, mins / o.eta));
    const left = Math.max(0, Math.ceil(o.eta - mins));
    return { s, progress, left, waiting: now < start, start };
  }
  function scheduledStart(o) {
    const d = new Date(o.createdAt); d.setHours(0, 0, 0, 0);
    let t = d.getTime() + o.scheduled * 60000 - o.eta * 60000;
    if (t < o.createdAt - 12 * 3600e3) t += 24 * 3600e3;
    return t;
  }
  const fmtTime = ms => { const d = new Date(ms); const h = d.getHours(); return `${num(h % 12 || 12)}:${pad2(d.getMinutes())} ${h < 12 ? 'ص' : 'م'}`; };

  if (!order) {
    root.innerHTML = no
      ? `<div class="empty-state big"><svg class="empty-ico"><use href="#logo-mark"/></svg><h2>مش لاقيين طلب رقم <span dir="ltr">${toAr(no.replace(/[^\d]/g, ''))}</span></h2><p>اتأكد من الرقم، أو كلمنا على الرقم الموحد.</p><a href="contact.html" class="btn-ghost">تواصل معانا</a></div>`
      : `<div class="empty-state big"><svg class="empty-ico"><use href="#logo-mark"/></svg><h2>مفيش طلبات لسه</h2><p>أول ما تطلب، هتقدر تتابع طلبك من هنا لحظة بلحظة.</p><a href="menu.html" class="btn-order"><span>اطلب دلوقتي</span><svg><use href="#i-arrow"/></svg></a></div>`;
  } else {
    const branch = D.BRANCHES.find(b => b.id === order.branch);
    const steps = STEPS[order.type];
    root.innerHTML = `
      ${param('new') ? `<div class="success-banner glass"><div class="done-badge sm"><svg><use href="#i-check"/></svg></div><div><b>الطلب اتأكد يا ${order.name.split(' ')[0]}!</b><small>بعتنا الطلب للمطبخ، وهنكلمك على ${toAr(order.phone)} لو احتجنا حاجة.</small></div></div>` : ''}
      <div class="track-layout">
        <section class="track-live glass">
          <div class="track-top">
            <div class="ring" id="ring">
              <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" class="ring-bg"/><circle cx="60" cy="60" r="52" class="ring-fg" id="ringFg"/></svg>
              <div class="ring-txt"><b id="leftMin"></b><small id="leftLbl"></small></div>
            </div>
            <div>
              <span class="eyebrow">طلب رقم #${toAr(order.no)}</span>
              <h2 id="statusTitle"></h2>
              <p class="muted" id="statusSub"></p>
            </div>
          </div>

          <ol class="tsteps" id="tsteps">${steps.map(s => `<li><span class="dot"></span>${s}</li>`).join('')}</ol>

          ${order.type === 'delivery' ? `
          <div class="route">
            <svg viewBox="0 0 600 170" preserveAspectRatio="none" aria-hidden="true">
              <path id="routePath" d="M560 120 C 470 20, 380 160, 300 90 S 140 30, 40 70" class="route-bg"/>
              <path d="M560 120 C 470 20, 380 160, 300 90 S 140 30, 40 70" class="route-fg" id="routeFg"/>
            </svg>
            <span class="route-pin from" style="right:4%;top:58%"><svg><use href="#logo-mark"/></svg></span>
            <span class="route-pin to" style="left:3%;top:30%">🏠</span>
            <span class="rider" id="rider">🛵</span>
          </div>` : `
          <div class="pickup-card"><svg><use href="#i-pin"/></svg><div><b>${branch.name}</b><small>${branch.addr}، ${branch.city}</small></div>
            <a class="btn-ghost sm" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}">الاتجاهات</a></div>`}
        </section>

        <aside class="track-receipt receipt-paper">
          <div class="receipt-head"><svg class="brand-mark"><use href="#logo-mark"/></svg><b>جمرة · FIRE KITCHEN</b><small>${new Date(order.createdAt).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })} · ${fmtTime(order.createdAt)}</small></div>
          <div class="receipt-rows">
            ${order.lines.map(l => `<p><span>${toAr(l.qty)}× ${D.ITEMS[l.id] ? D.ITEMS[l.id].name : 'صنف'}${l.extras.length ? `<small>+ ${l.extras.join('، ')}</small>` : ''}</span><span>${money(l.unit * l.qty)}</span></p>`).join('')}
          </div>
          <div class="receipt-rows">
            <p><span>المجموع</span><span>${money(order.totals.sub)}</span></p>
            <p><span>${order.type === 'pickup' ? 'استلام' : 'التوصيل'}</span><span>${order.totals.fee ? money(order.totals.fee) : 'مجاني'}</span></p>
            ${order.totals.disc ? `<p><span>خصم <span dir="ltr">${order.totals.coupon}</span></span><span>− ${money(order.totals.disc)}</span></p>` : ''}
          </div>
          <div class="receipt-total"><span>الإجمالي</span><span>${money(order.totals.total)}</span></div>
          <div class="receipt-rows meta">
            <p><span>${order.type === 'pickup' ? 'الفرع' : 'العنوان'}</span><span>${order.type === 'pickup' ? branch.name : order.address}</span></p>
            <p><span>الدفع</span><span>${order.pay}</span></p>
          </div>
          <div class="barcode" aria-hidden="true"></div>
          <div class="receipt-btns">
            <button class="btn-order sm" id="reorder"><span>اطلب نفس الطلب تاني</span></button>
          </div>
        </aside>
      </div>`;

    const ringFg = $('#ringFg'), C = 2 * Math.PI * 52;
    ringFg.style.strokeDasharray = C;
    const path = $('#routePath'), rider = $('#rider'), routeFg = $('#routeFg');
    const L = path ? path.getTotalLength() : 0;
    if (routeFg) routeFg.style.strokeDasharray = L;

    function tick() {
      const t = stage(order);
      ringFg.style.strokeDashoffset = C * (1 - t.progress);
      [...$('#tsteps').children].forEach((li, i) => { li.classList.toggle('on', i <= t.s); li.classList.toggle('now', i === t.s); });
      if (t.waiting) {
        $('#leftMin').textContent = fmtTime(t.start + order.eta * 60000).split(' ')[0];
        $('#leftLbl').textContent = 'الميعاد';
        $('#statusTitle').textContent = 'طلبك متجدول';
        $('#statusSub').textContent = `هنبدأ نجهزه الساعة ${fmtTime(t.start)}`;
      } else {
        const done = t.s === 3;
        $('#leftMin').textContent = done ? '✓' : num(t.left);
        $('#leftLbl').textContent = done ? 'تم' : 'دقيقة';
        $('#statusTitle').textContent = steps[t.s];
        $('#statusSub').textContent = done ? 'بالهنا والشفا! قيّم طلبك على جوالك.' :
          order.type === 'delivery' ? `الوصول المتوقع ${fmtTime(t.start + order.eta * 60000)}` : `هيبقى جاهز حوالي ${fmtTime(t.start + (order.eta - 2) * 60000)} في ${branch.name}`;
      }
      if (path) {
        const k = Math.max(0, Math.min(1, (t.progress - .55) / .45)); // rider moves during the "on the way" leg
        const pt = path.getPointAtLength(L * k);
        const box = path.ownerSVGElement.viewBox.baseVal, svg = path.ownerSVGElement.getBoundingClientRect();
        rider.style.left = (pt.x / box.width) * svg.width + 'px';
        rider.style.top = (pt.y / box.height) * svg.height + 'px';
        routeFg.style.strokeDashoffset = L * (1 - k);
      }
    }
    tick(); setInterval(tick, 1000); addEventListener('resize', tick);

    $('#reorder').addEventListener('click', () => {
      order.lines.forEach(l => { if (D.ITEMS[l.id]) Cart.add(l.id, { qty: l.qty, extras: l.extras, note: l.note }); });
      toast('ضفنا نفس الأصناف لطلبك'); Site.openDrawer();
    });
    if (param('new')) history.replaceState(null, '', `track.html?o=${order.no}`);
  }

  // history
  $('#historyList').innerHTML = orders.length ? orders.map(o => {
    const t = stage(o);
    const label = t.waiting ? 'متجدول' : STEPS[o.type][t.s];
    return `<a class="h-item glass ${order && o.no === order.no ? 'is-current' : ''}" href="track.html?o=${o.no}">
      <div class="h-imgs">${o.lines.slice(0, 3).map(l => D.ITEMS[l.id] ? `<img src="${img(D.ITEMS[l.id].img, 100)}" alt="">` : '').join('')}</div>
      <div class="h-body"><b>طلب #${toAr(o.no)}</b><small>${new Date(o.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })} · ${o.type === 'pickup' ? 'استلام' : 'توصيل'} · ${num(o.lines.reduce((a, l) => a + l.qty, 0))} صنف</small></div>
      <span class="status ${t.s === 3 ? 'closed' : 'open'}"><i></i>${label}</span>
      <b class="h-total">${money(o.totals.total)}</b>
    </a>`;
  }).join('') : '<p class="muted">مفيش طلبات سابقة على الجهاز ده.</p>';

  $('#lookup').addEventListener('submit', e => {
    e.preventDefault();
    const v = $('#lookupInput').value.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\D/g, '');
    if (v) location.href = `track.html?o=${v}`;
  });
})();
