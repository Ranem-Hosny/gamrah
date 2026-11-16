/* جمرة · menu page — one category at a time + search across all
   State lives in the URL: menu.html?cat=pizza&q=…&sort=asc&f=spicy */
(() => {
  'use strict';
  const { $, $$, D, img, num, param, dishCard } = Site;
  const { MENU } = D;

  const state = {
    cat: MENU.some(c => c.key === param('cat')) ? param('cat') : MENU[0].key,
    q: param('q') || '',
    sort: param('sort') || '',
    flags: new Set((param('f') || '').split(',').filter(Boolean)),
  };

  const chips = $('#catChips'), out = $('#menuResults');
  const search = $('#search'), sort = $('#sort');
  search.value = state.q; sort.value = state.sort;
  $$('.toggle').forEach(t => t.setAttribute('aria-pressed', state.flags.has(t.dataset.flag)));

  const norm = s => s.replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').toLowerCase();
  const searching = () => state.q.trim().length > 0;

  function filterItems(items) {
    const q = norm(state.q.trim());
    let list = items.map(i => D.ITEMS[i.id]).filter(it =>
      (!q || norm(it.name + ' ' + it.desc).includes(q)) && [...state.flags].every(f => it[f]));
    if (state.sort === 'asc') list.sort((a, b) => a.price - b.price);
    if (state.sort === 'desc') list.sort((a, b) => b.price - a.price);
    if (state.sort === 'pop') list.sort((a, b) => (b.pop || 0) - (a.pop || 0));
    return list;
  }

  function syncURL() {
    const p = new URLSearchParams();
    p.set('cat', state.cat);
    if (state.q) p.set('q', state.q);
    if (state.sort) p.set('sort', state.sort);
    if (state.flags.size) p.set('f', [...state.flags].join(','));
    history.replaceState(null, '', location.pathname + '?' + p);
  }

  function renderSide() {
    chips.innerHTML = MENU.map(c => {
      const n = filterItems(c.items).length;
      const on = !searching() && c.key === state.cat;
      return `<button class="side-cat" data-cat="${c.key}" role="tab" aria-selected="${on}"${n ? '' : ' data-empty'}>
        <img src="${img(c.thumb, 120)}" alt="">
        <span>${c.name}</span>
        <b>${num(n)}</b>
      </button>`;
    }).join('');
  }

  const grid = items => `<div class="dish-grid">${items.map(dishCard).join('')}</div>`;
  const empty = (msg) => `
    <div class="empty-state">
      <svg class="empty-ico"><use href="#logo-mark"/></svg>
      <h3>${msg}</h3>
      <p>جرّب كلمة تانية، أو شيل الفلاتر.</p>
      <button class="btn-ghost" id="resetFilters">شيل الفلاتر</button>
    </div>`;

  function renderCategory() {
    const i = MENU.findIndex(c => c.key === state.cat), c = MENU[i];
    const items = filterItems(c.items);
    const prev = MENU[i - 1], next = MENU[i + 1];
    const navBtn = (x, dir) => x ? `
      <button class="cat-step ${dir}" data-cat="${x.key}">
        <img src="${img(x.thumb, 120)}" alt="">
        <span><small>${dir === 'next' ? 'القسم الجاي' : 'القسم اللي فات'}</small><b>${x.name}</b></span>
        <svg${dir === 'prev' ? ' style="transform:scaleX(-1)"' : ''}><use href="#i-arrow"/></svg>
      </button>` : '<span></span>';
    return `
      <header class="cat-banner">
        <img src="${img(c.cover, 1100)}" alt="">
        <span class="cat-stamp">${c.stamp}</span>
        <div class="cat-banner-text">
          <span class="eyebrow">${c.icon} ${num(i + 1)} من ${num(MENU.length)}</span>
          <h2>${c.name}</h2>
          <p>${c.line}</p>
        </div>
        <span class="cat-count"><b>${num(items.length)}</b> ${items.length > 2 && items.length < 11 ? 'أصناف' : 'صنف'}</span>
      </header>
      ${items.length ? grid(items) : empty('مفيش أصناف بالفلاتر دي هنا')}
      <nav class="cat-steps" aria-label="التنقل بين الأقسام">${navBtn(prev, 'prev')}${navBtn(next, 'next')}</nav>`;
  }

  function renderSearch() {
    let total = 0;
    const groups = MENU.map(c => {
      const items = filterItems(c.items); total += items.length;
      return items.length ? `<div class="search-group"><h3 class="group-title"><img src="${img(c.thumb, 80)}" alt="">${c.name}<small>${num(items.length)}</small></h3>${grid(items)}</div>` : '';
    }).join('');
    return `<header class="search-head"><h2>نتايج "${state.q.replace(/[<>&"]/g, '')}"</h2><span>${num(total)} صنف</span>
      <button class="text-link" id="clearSearch">امسح البحث</button></header>` + (total ? groups : empty('مفيش أكلة بالاسم ده'));
  }

  function render(animate = true) {
    renderSide();
    out.innerHTML = searching() ? renderSearch() : renderCategory();
    if (animate && !Site.reduced) out.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)' });
    syncURL();
  }

  const toTop = () => {
    const top = $('.menu-page').getBoundingClientRect().top + scrollY - 100;
    if (scrollY > top) scrollTo({ top, behavior: Site.reduced ? 'auto' : 'smooth' });
  };
  const goCat = key => {
    state.cat = key;
    if (searching()) { state.q = ''; search.value = ''; }
    render(); toTop();
  };

  chips.addEventListener('click', e => { const b = e.target.closest('.side-cat'); if (b) goCat(b.dataset.cat); });
  out.addEventListener('click', e => {
    const s = e.target.closest('.cat-step'); if (s) return goCat(s.dataset.cat);
    if (e.target.id === 'clearSearch') { state.q = ''; search.value = ''; render(); }
    if (e.target.id === 'resetFilters') {
      state.q = ''; state.sort = ''; state.flags.clear();
      search.value = ''; sort.value = ''; $$('.toggle').forEach(x => x.setAttribute('aria-pressed', 'false'));
      render();
    }
  });
  let t;
  search.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { state.q = search.value; render(false); }, 200); });
  sort.addEventListener('change', () => { state.sort = sort.value; render(false); });
  $$('.toggle').forEach(b => b.addEventListener('click', () => {
    const f = b.dataset.flag;
    state.flags.has(f) ? state.flags.delete(f) : state.flags.add(f);
    b.setAttribute('aria-pressed', state.flags.has(f)); render(false);
  }));
  // keyboard: arrows move between categories (RTL)
  chips.addEventListener('keydown', e => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    const i = MENU.findIndex(c => c.key === state.cat);
    const d = (e.key === 'ArrowDown' || e.key === 'ArrowLeft') ? 1 : -1;
    const n = MENU[Math.max(0, Math.min(MENU.length - 1, i + d))];
    goCat(n.key); $(`.side-cat[data-cat="${n.key}"]`, chips).focus();
  });

  render(false);
})();
