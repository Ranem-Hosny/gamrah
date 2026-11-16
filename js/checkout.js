/* جمرة · checkout — delivery or pickup, coupon, payment → track.html */
(() => {
  'use strict';
  const { $, $$, D, img, num, pad2, money, Cart, pricing, store, toast, COUPON_KEY } = Site;
  const root = $('#checkoutRoot');
  const st = { type: 'delivery', when: 'asap' };

  const timeLabel = m => { const h = Math.floor(m / 60) % 24, mm = m % 60; return `${num(h % 12 || 12)}:${pad2(mm)} ${h < 12 ? 'ص' : 'م'}`; };
  function laterSlots() {
    const d = new Date(), start = Math.ceil((d.getHours() * 60 + d.getMinutes() + 60) / 30) * 30;
    return Array.from({ length: 10 }, (_, i) => start + i * 30);
  }

  function emptyState() {
    root.innerHTML = `<div class="empty-state big">
      <svg class="empty-ico"><use href="#logo-mark"/></svg>
      <h2>طلبك لسه فاضي</h2>
      <p>ضيف أكل من المنيو الأول وبعدين ارجع هنا.</p>
      <a href="menu.html" class="btn-order"><span>افتح المنيو</span><svg><use href="#i-arrow"/></svg></a>
      <a href="track.html" class="text-link">أو تابع طلب سابق</a>
    </div>`;
  }

  function build() {
    if (!Cart.count()) return emptyState();
    root.innerHTML = `
    <div class="checkout-layout">
      <form class="co-form" id="coForm" novalidate>
        <section class="co-card glass">
          <h2>تحب تستلم إزاي؟</h2>
          <div class="seg big" role="radiogroup" aria-label="طريقة الاستلام">
            <label><input type="radio" name="type" value="delivery" checked><span><svg><use href="#i-bike"/></svg>توصيل<small>٢٥–٤٠ دقيقة</small></span></label>
            <label><input type="radio" name="type" value="pickup"><span><svg><use href="#i-bag"/></svg>استلام من الفرع<small>جاهز في ١٥–٢٠ دقيقة</small></span></label>
          </div>

          <div class="co-delivery" id="coDelivery">
            <div class="field-row">
              <label class="field">المدينة
                <select name="city">${[...new Set(D.BRANCHES.map(b => b.city))].map(c => `<option>${c}</option>`).join('')}</select>
              </label>
              <label class="field">الحي<input name="district" placeholder="مثلاً: الملقا" autocomplete="address-level3"></label>
            </div>
            <label class="field">الشارع ورقم المبنى<input name="street" placeholder="الشارع، رقم المبنى، الدور، الشقة" autocomplete="street-address"></label>
            <label class="field">ملاحظة للمندوب<input name="driverNote" placeholder="مثلاً: البوابة الخلفية"></label>
          </div>

          <div class="co-pickup" id="coPickup" hidden>
            <div class="branch-pick">
              ${D.BRANCHES.map((b, i) => `<label class="pick"><input type="radio" name="branch" value="${b.id}"${i === 0 ? ' checked' : ''}><span><b>${b.name}</b><small>${b.addr}، ${b.city}</small></span></label>`).join('')}
            </div>
          </div>
        </section>

        <section class="co-card glass">
          <h2>إمتى؟</h2>
          <div class="seg" role="radiogroup" aria-label="وقت الطلب">
            <label><input type="radio" name="when" value="asap" checked><span>أسرع وقت</span></label>
            <label><input type="radio" name="when" value="later"><span>وقت محدد</span></label>
          </div>
          <div class="slots compact" id="laterSlots" hidden>
            ${laterSlots().map((m, i) => `<label class="slot"><input type="radio" name="slot" value="${m}"${i === 0 ? ' checked' : ''}><span>${timeLabel(m)}</span></label>`).join('')}
          </div>
        </section>

        <section class="co-card glass">
          <h2>بياناتك</h2>
          <div class="field-row">
            <label class="field">الاسم<input name="name" autocomplete="name" placeholder="اسمك"></label>
            <label class="field">رقم الجوال<input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="05xxxxxxxx" dir="ltr"></label>
          </div>
        </section>

        <section class="co-card glass">
          <h2>الدفع</h2>
          <div class="pay-cards" role="radiogroup" aria-label="طريقة الدفع">
            <label><input type="radio" name="pay" value="كاش عند الاستلام" checked><span>💵<b>كاش</b><small>عند الاستلام</small></span></label>
            <label><input type="radio" name="pay" value="شبكة عند الاستلام"><span>💳<b>شبكة</b><small>مدى / فيزا عند الاستلام</small></span></label>
            <label class="soon"><input type="radio" name="pay" value="apple" disabled><span><b>Apple Pay</b><small>قريباً</small></span></label>
          </div>
        </section>
      </form>

      <aside class="co-summary glass-strong">
        <h2>ملخص الطلب <small id="sumCount"></small></h2>
        <div class="co-lines" id="coLines"></div>
        <div class="coupon-box" id="couponBox"></div>
        <dl class="co-totals" id="coTotals"></dl>
        <p class="form-error" id="coError" role="alert"></p>
        <button class="btn-order wide" id="placeOrder" form="coForm" type="submit"><span>أكّد الطلب · <b id="coTotalBtn"></b></span><svg><use href="#i-check"/></svg></button>
        <small class="vat-note">الأسعار شاملة ضريبة القيمة المضافة ١٥٪</small>
      </aside>
    </div>`;
    bind();
    renderSummary();
  }

  function renderSummary() {
    if (!Cart.count()) return emptyState();
    const p = pricing({ type: st.type });
    $('#sumCount').textContent = `(${num(Cart.count())} صنف)`;
    $('#coLines').innerHTML = Cart.lines.map(l => {
      const it = D.ITEMS[l.id];
      return `<div class="co-line" data-key="${l.key}">
        <img src="${img(it.img, 140)}" alt="">
        <div><b>${it.name}</b>${l.extras.length ? `<small>+ ${l.extras.join('، ')}</small>` : ''}${l.note ? `<small>“${l.note}”</small>` : ''}</div>
        <div class="co-line-side"><span>${money(Cart.unitPrice(l) * l.qty)}</span>
          <div class="qty sm"><button type="button" data-q="1" aria-label="زوّد"><svg><use href="#i-plus"/></svg></button><span>${num(l.qty)}</span><button type="button" data-q="-1" aria-label="قلّل"><svg><use href="#i-minus"/></svg></button></div>
        </div></div>`;
    }).join('');
    const code = store.get(COUPON_KEY, null);
    $('#couponBox').innerHTML = p.coupon
      ? `<div class="coupon-applied"><span>كوبون <b dir="ltr">${p.coupon.code}</b> متطبق</span><button type="button" id="rmCoupon" class="text-link">شيله</button></div>`
      : `<form class="coupon-form" id="couponForm"><input id="couponInput" placeholder="عندك كوبون؟" dir="ltr" aria-label="كود الكوبون" value="${code && !p.coupon ? code : ''}"><button class="btn-ghost sm">طبّق</button></form>
         ${code && !p.coupon ? `<small class="form-error">الكوبون ${code} محتاج طلب أكبر من ${money((D.COUPONS.find(c => c.code === code) || {}).min || 0)}</small>` : ''}`;
    $('#coTotals').innerHTML = `
      <div><dt>المجموع</dt><dd>${money(p.sub)}</dd></div>
      <div><dt>${st.type === 'pickup' ? 'استلام من الفرع' : 'التوصيل'}</dt><dd>${p.fee ? money(p.fee) : 'مجاني'}</dd></div>
      ${p.disc ? `<div class="disc"><dt>الخصم</dt><dd>− ${money(p.disc)}</dd></div>` : ''}
      <div class="grand"><dt>الإجمالي</dt><dd>${money(p.total)}</dd></div>`;
    $('#coTotalBtn').textContent = money(p.total);
  }

  function bind() {
    const form = $('#coForm');
    form.addEventListener('change', e => {
      if (e.target.name === 'type') {
        st.type = e.target.value;
        $('#coDelivery').hidden = st.type !== 'delivery';
        $('#coPickup').hidden = st.type !== 'pickup';
        renderSummary();
      }
      if (e.target.name === 'when') { st.when = e.target.value; $('#laterSlots').hidden = st.when !== 'later'; }
    });
    $('.co-summary').addEventListener('click', e => {
      const q = e.target.closest('[data-q]');
      if (q) { const key = q.closest('.co-line').dataset.key; const l = Cart.lines.find(x => x.key === key); if (l) Cart.setQty(key, l.qty + +q.dataset.q); }
      if (e.target.id === 'rmCoupon') { store.set(COUPON_KEY, null); renderSummary(); }
    });
    $('.co-summary').addEventListener('submit', e => {
      if (e.target.id !== 'couponForm') return;
      e.preventDefault();
      const code = $('#couponInput').value.trim().toUpperCase();
      const cp = D.COUPONS.find(c => c.code === code);
      if (!cp) { toast('الكود ده مش صحيح'); return; }
      store.set(COUPON_KEY, code); renderSummary();
      if (pricing({ type: st.type }).coupon) toast(`اتطبق كوبون <b dir="ltr">${code}</b>`);
    });
    form.addEventListener('input', e => { e.target.classList.remove('invalid'); $('#coError').textContent = ''; });
    form.addEventListener('submit', submit);
  }

  const normPhone = s => s.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[\s()-]/g, '').replace(/^(\+|00)966/, '0');
  function submit(e) {
    e.preventDefault();
    const f = e.target, err = $('#coError');
    $$('.invalid', f).forEach(x => x.classList.remove('invalid'));
    const bad = [];
    if (st.type === 'delivery') {
      if (f.district.value.trim().length < 2) bad.push([f.district, 'اكتب اسم الحي']);
      if (f.street.value.trim().length < 4) bad.push([f.street, 'اكتب الشارع ورقم المبنى']);
    }
    if (f.name.value.trim().length < 2) bad.push([f.name, 'اكتب اسمك']);
    if (!/^05\d{8}$/.test(normPhone(f.phone.value))) bad.push([f.phone, 'رقم الجوال لازم يكون ١٠ أرقام ويبدأ بـ 05']);
    if (bad.length) {
      bad.forEach(([el]) => el.classList.add('invalid'));
      err.textContent = bad[0][1];
      bad[0][0].scrollIntoView({ block: 'center', behavior: 'smooth' }); bad[0][0].focus({ preventScroll: true });
      return;
    }
    err.textContent = '';
    const p = pricing({ type: st.type });
    const branch = st.type === 'pickup' ? D.BRANCHES.find(b => b.id === f.branch.value) : D.BRANCHES.find(b => b.city === f.city.value);
    const slot = st.when === 'later' ? +f.slot.value : null;
    const order = {
      no: String(Math.floor(10000 + Math.random() * 89999)),
      createdAt: Date.now(),
      type: st.type,
      scheduled: slot,
      eta: st.type === 'pickup' ? 18 : 35,
      name: f.name.value.trim(), phone: normPhone(f.phone.value),
      address: st.type === 'delivery' ? `${f.street.value.trim()}، حي ${f.district.value.trim()}، ${f.city.value}` : null,
      branch: branch.id, pay: f.pay.value,
      lines: Cart.lines.map(l => ({ id: l.id, qty: l.qty, extras: l.extras, note: l.note, unit: Cart.unitPrice(l) })),
      totals: { sub: p.sub, fee: p.fee, disc: p.disc, total: p.total, coupon: p.coupon && p.coupon.code },
    };
    store.set('jamra-orders', [order, ...store.get('jamra-orders', [])].slice(0, 30));
    store.set(COUPON_KEY, null);
    placing = true;                       // keep the form on screen while we leave
    $('#placeOrder').disabled = true;
    Cart.clear();
    location.href = `track.html?o=${order.no}&new=1`;
  }

  let placing = false;
  addEventListener('cart:change', () => { if (placing) return; if ($('#coLines')) renderSummary(); else build(); });
  build();
})();
