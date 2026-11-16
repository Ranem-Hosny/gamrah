/* جمرة · dish detail page — dish.html?id=b2 */
(() => {
  'use strict';
  const { $, $$, D, img, num, money, param, addToCart, dishCard, observeReveal } = Site;
  const it = D.ITEMS[param('id')];
  const layout = $('#dishLayout');

  if (!it || it.catKey === 'offer') {
    document.title = 'الصنف مش موجود · جمرة';
    layout.innerHTML = `<div class="empty-state dish-missing">
      <svg class="empty-ico"><use href="#logo-mark"/></svg>
      <h1>الصنف ده مش موجود</h1>
      <p>ممكن يكون اتشال من المنيو أو الرابط فيه غلطة.</p>
      <a href="menu.html" class="btn-order"><span>افتح المنيو</span><svg><use href="#i-arrow"/></svg></a>
    </div>`;
    $('#related').hidden = true;
    return;
  }

  const cat = D.MENU.find(c => c.key === it.catKey);
  const extras = D.EXTRAS[it.catKey] || [];
  // stable pseudo rating per dish
  const seed = [...it.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const rating = (4.6 + (seed % 4) / 10).toFixed(1);
  const votes = 120 + (seed * 37) % 900;

  document.title = `${it.name} · جمرة`;
  $('#dishBg').style.backgroundImage = `url(${img(it.img, 1200)})`;

  layout.innerHTML = `
    <div class="dish-visual">
      <div class="dish-plate"><img id="dishImg" src="${img(it.img, 900)}" alt="${it.name}"></div>
    </div>
    <div class="dish-info glass">
      <nav class="crumbs" aria-label="مسار الصفحة"><a href="index.html">الرئيسية</a><span aria-hidden="true">/</span><a href="menu.html?cat=${cat.key}">${cat.name}</a><span aria-hidden="true">/</span><span aria-current="page">${it.name}</span></nav>
      <h1>${it.name}${it.tag ? ` <span class="item-tag">${it.tag}</span>` : ''}</h1>
      <div class="dish-rating"><span class="stars">★★★★★</span><b>${num(rating)}</b><small>(${num(votes)} تقييم)</small></div>
      <p class="dish-desc">${it.desc}. ${cat.line}</p>
      <ul class="dish-facts">
        <li><svg><use href="#i-clock"/></svg>${num(it.time)} دقيقة تحضير</li>
        <li><svg><use href="#i-flame"/></svg>${num(it.cal)} سعرة</li>
        ${it.spicy ? '<li>🌶 حار</li>' : ''}${it.veg ? '<li>🌱 نباتي</li>' : ''}
      </ul>

      ${extras.length ? `<fieldset class="extras">
        <legend>زوّد على طلبك</legend>
        ${extras.map(([n, p], i) => `<label class="extra"><input type="checkbox" value="${n}" data-p="${p}"><span class="extra-box"><svg><use href="#i-check"/></svg></span><span class="extra-name">${n}</span><span class="extra-price">${p ? '+ ' + money(p) : 'مجاناً'}</span></label>`).join('')}
      </fieldset>` : ''}

      <label class="field note-field">ملاحظة للمطبخ <input id="note" maxlength="80" placeholder="مثلاً: من غير بصل"></label>

      <div class="dish-buy">
        <div class="stepper" aria-label="الكمية">
          <button id="qtyPlus" aria-label="زوّد"><svg><use href="#i-plus"/></svg></button>
          <output id="qty">١</output>
          <button id="qtyMinus" aria-label="قلّل"><svg><use href="#i-minus"/></svg></button>
        </div>
        <button class="btn-order wide" id="addBtn"><span>أضف للطلب · <b id="lineTotal"></b></span><svg><use href="#i-cart"/></svg></button>
      </div>
    </div>`;

  let qty = 1;
  const chosen = () => $$('.extra input:checked', layout);
  function update() {
    const unit = it.price + chosen().reduce((s, x) => s + +x.dataset.p, 0);
    $('#qty').textContent = num(qty);
    $('#lineTotal').textContent = money(unit * qty);
    $('#qtyMinus').disabled = qty <= 1;
  }
  $('#qtyPlus').addEventListener('click', () => { qty = Math.min(20, qty + 1); update(); });
  $('#qtyMinus').addEventListener('click', () => { qty = Math.max(1, qty - 1); update(); });
  layout.addEventListener('change', update);
  $('#addBtn').addEventListener('click', () => {
    addToCart(it.id, $('#dishImg'), { qty, extras: chosen().map(x => x.value), note: $('#note').value.trim() });
    qty = 1; chosen().forEach(x => { x.checked = false; }); $('#note').value = ''; update();
  });
  update();

  // related: same category + one dessert + one drink
  const pool = [...cat.items.filter(x => x.id !== it.id),
    ...D.MENU.find(c => c.key === 'dessert').items.slice(0, 1),
    ...D.MENU.find(c => c.key === 'drinks').items.slice(0, 1)]
    .filter(x => x.id !== it.id).slice(0, 4).map(x => D.ITEMS[x.id]);
  $('#relatedGrid').innerHTML = pool.map(dishCard).join('');
  observeReveal();
})();
