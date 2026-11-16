/* جمرة · branches page */
(() => {
  'use strict';
  const { $, $$, D, img, branchStatus, observeReveal, param } = Site;
  const cities = ['الكل', ...new Set(D.BRANCHES.map(b => b.city))];
  let city = 'الكل';
  let selected = (D.BRANCHES.find(b => b.id === param('b')) || D.BRANCHES[0]).id;

  $('#cityFilter').innerHTML = cities.map(c => `<button class="chip" data-city="${c}" role="tab">${c}</button>`).join('');

  function render() {
    $$('#cityFilter .chip').forEach(b => b.setAttribute('aria-selected', b.dataset.city === city));
    const list = D.BRANCHES.filter(b => city === 'الكل' || b.city === city);
    $('#branchList').innerHTML = list.map((b, i) => {
      const s = branchStatus(b);
      return `<article class="branch glass reveal ${b.id === selected ? 'is-selected' : ''}" style="--d:${i * .06}s" data-id="${b.id}" tabindex="0" aria-label="${b.name}">
        <img src="${img(b.img, 500)}" alt="" loading="lazy">
        <div class="branch-body">
          <div class="branch-top"><span class="eyebrow">${b.city}</span><span class="status ${s.open ? 'open' : 'closed'}"><i></i>${s.label}</span></div>
          <h3>${b.name}${b.main ? ' <span class="item-tag">الفرع الرئيسي</span>' : ''}</h3>
          <p><svg><use href="#i-pin"/></svg>${b.addr}</p>
          <p><svg><use href="#i-clock"/></svg>يومياً ${s.hours}</p>
          <p><svg><use href="#i-phone"/></svg><a href="tel:${b.phone.replace(/\s/g, '')}" dir="ltr">${b.phone}</a></p>
          <ul class="feats">${b.feats.map(f => `<li>${f}</li>`).join('')}</ul>
          <div class="branch-actions">
            <a class="btn-ghost sm" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}">الاتجاهات</a>
            <a class="btn-order sm" href="reserve.html?b=${b.id}"><span>احجز هنا</span></a>
          </div>
        </div>
      </article>`;
    }).join('');
    observeReveal($('#branchList'));
    showMap();
  }

  function showMap() {
    const b = D.BRANCHES.find(x => x.id === selected);
    $('#map').src = `https://maps.google.com/maps?q=${b.lat},${b.lng}&z=14&hl=ar&output=embed`;
    $('#mapLabel').innerHTML = `<svg><use href="#logo-mark"/></svg><div><b>${b.name}</b><small>${b.addr}، ${b.city}</small></div>`;
  }

  $('#cityFilter').addEventListener('click', e => {
    const c = e.target.closest('[data-city]'); if (!c) return;
    city = c.dataset.city;
    const first = D.BRANCHES.find(b => city === 'الكل' || b.city === city);
    if (first && !(city === 'الكل' || D.BRANCHES.find(b => b.id === selected).city === city)) selected = first.id;
    render();
  });
  const pick = el => {
    if (!el || el.dataset.id === selected) return;
    selected = el.dataset.id;
    $$('.branch').forEach(x => x.classList.toggle('is-selected', x.dataset.id === selected));
    showMap();
    if (innerWidth <= 920) $('.map-wrap').scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  $('#branchList').addEventListener('click', e => { if (!e.target.closest('a')) pick(e.target.closest('.branch')); });
  $('#branchList').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.classList.contains('branch')) pick(e.target); });

  render();
  setInterval(() => $$('.branch').forEach(el => {
    const s = branchStatus(D.BRANCHES.find(b => b.id === el.dataset.id));
    const st = $('.status', el); st.className = `status ${s.open ? 'open' : 'closed'}`; st.innerHTML = `<i></i>${s.label}`;
  }), 60000);
})();
