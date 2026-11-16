/* جمرة · offers page */
(() => {
  'use strict';
  const { $, $$, D, num, money, offerCard, countdown, store, toast, COUPON_KEY } = Site;

  $('#offerGrid').innerHTML = D.OFFERS.map(offerCard).join('');
  countdown(document);

  const render = () => {
    const active = store.get(COUPON_KEY, null);
    $('#couponGrid').innerHTML = D.COUPONS.map((c, i) => `
      <article class="coupon reveal ${active === c.code ? 'is-active' : ''}" style="--d:${i * .08}s">
        <div class="coupon-val">${c.type === 'pct' ? `${num(c.value)}٪` : `${num(c.value)}<small>ر.س</small>`}<span>خصم</span></div>
        <div class="coupon-body">
          <h3>${c.title}</h3>
          <p>${c.note}${c.min ? ` · الحد الأدنى ${money(c.min)}` : ''}</p>
          <div class="coupon-actions">
            <button class="coupon-code" data-copy="${c.code}" aria-label="انسخ الكود ${c.code}"><span dir="ltr">${c.code}</span><svg><use href="#i-copy"/></svg></button>
            <button class="btn-ghost sm" data-use="${c.code}">${active === c.code ? '✓ متطبق' : 'استخدم الكوبون'}</button>
          </div>
        </div>
      </article>`).join('');
    Site.observeReveal($('#couponGrid'));
  };
  render();

  $('#couponGrid').addEventListener('click', async e => {
    const cp = e.target.closest('[data-copy]');
    if (cp) {
      const code = cp.dataset.copy;
      try { await navigator.clipboard.writeText(code); }
      catch {
        const ta = Object.assign(document.createElement('textarea'), { value: code });
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch { /* ignore */ }
        ta.remove();
      }
      toast(`اتنسخ الكود <b dir="ltr">${code}</b>`);
      return;
    }
    const use = e.target.closest('[data-use]');
    if (use) {
      store.set(COUPON_KEY, use.dataset.use);
      render();
      $$('.coupon', $('#couponGrid')).forEach(x => x.classList.add('in'));
      toast(`الكوبون <b dir="ltr">${use.dataset.use}</b> هيتطبق وقت الدفع`);
    }
  });
})();
