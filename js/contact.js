/* جمرة · contact page — conversational form (chat), FAQ cards, branches */
(() => {
  'use strict';
  const { $, D, img, branchStatus, store, reduced } = Site;
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const toAr = s => String(s).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  const normPhone = s => s.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[\s()-]/g, '').replace(/^(\+|00)966/, '0');

  /* ---------- live status ---------- */
  const anyOpen = D.BRANCHES.some(b => branchStatus(b).open);
  $('#cxStatus').innerHTML = anyOpen
    ? '<i class="live-dot"></i> الفريق شغال دلوقتي · متوسط الرد ٥ دقايق'
    : '<i class="live-dot off"></i> الفريق مش متاح دلوقتي · هنرد عليك أول ما نفتح';

  /* ---------- chat ---------- */
  const body = $('#chatBody'), quick = $('#chatQuick'), form = $('#chatForm'), text = $('#chatText');
  const TOPICS = ['اقتراح', 'شكوى على طلب', 'مناسبة / كاترينج', 'شراكة', 'توظيف'];
  const PROMPT = {
    'اقتراح': 'حلو جداً! قول لنا اقتراحك، بنقرأ كل حاجة 🔥',
    'شكوى على طلب': 'آسفين إن ده حصل 🙏 احكيلنا اللي حصل، ولو فاكر رقم الطلب اكتبه.',
    'مناسبة / كاترينج': 'عندك مناسبة؟ اكتب التاريخ، عدد الضيوف، والمدينة.',
    'شراكة': 'يسعدنا! عرّفنا بنفسك وبفكرة الشراكة.',
    'توظيف': 'أهلاً بيك في الفريق 👨‍🍳 قول لنا الوظيفة اللي بتدور عليها وخبرتك.',
  };
  const STEPS = [
    { key: 'name', ask: () => 'أهلاً بيك في جمرة 👋 اسمك إيه؟', check: v => v.trim().length >= 2 || 'محتاجين اسمك علشان نعرف نرد عليك 🙂', ph: 'اسمك' },
    { key: 'topic', ask: d => `أهلاً يا ${esc(d.name.split(' ')[0])}! تحب تكلمنا في إيه؟`, choices: TOPICS },
    { key: 'msg', ask: d => PROMPT[d.topic], check: v => v.trim().length >= 10 || 'اكتب تفاصيل أكتر شوية (١٠ حروف على الأقل)', ph: 'اكتب رسالتك…', multi: true },
    { key: 'phone', ask: () => 'آخر حاجة: رقم جوالك علشان نرد عليك؟', check: v => /^05\d{8}$/.test(normPhone(v)) || 'الرقم لازم يكون ١٠ أرقام ويبدأ بـ 05', ph: '05xxxxxxxx', ltr: true },
  ];
  let step = 0, data = {}, busy = false;

  const scroll = () => body.scrollTo({ top: body.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
  function bubble(html, who = 'bot', extra = '') {
    const el = document.createElement('div');
    el.className = `msg ${who} ${extra}`;
    el.innerHTML = html;
    body.appendChild(el); scroll(); setTimeout(scroll, 480);
    return el;
  }
  function botSay(html, extra) {
    return new Promise(res => {
      busy = true;
      const typing = bubble('<span class="typing"><i></i><i></i><i></i></span>', 'bot', 'is-typing');
      setTimeout(() => { typing.remove(); bubble(html, 'bot', extra); busy = false; res(); }, reduced ? 0 : 650 + Math.min(900, html.length * 8));
    });
  }
  function setInput(s) {
    quick.innerHTML = '';
    if (!s) { form.hidden = true; return; }
    form.hidden = !!s.choices;
    if (s.choices) quick.innerHTML = s.choices.map(c => `<button type="button" class="qr" data-v="${c}">${c}</button>`).join('');
    else {
      text.placeholder = s.ph || 'اكتب هنا…';
      text.dir = s.ltr ? 'ltr' : 'rtl';
      text.inputMode = s.ltr ? 'tel' : 'text';
      text.value = ''; autoGrow();
      if (matchMedia('(hover: hover)').matches) text.focus({ preventScroll: true });
    }
  }
  async function ask() {
    const s = STEPS[step];
    await botSay(s.ask(data));
    setInput(s);
  }
  async function answer(v) {
    if (busy) return;
    const s = STEPS[step];
    bubble(esc(v).replace(/\n/g, '<br>'), 'me', s.ltr ? 'ltr' : '');
    const ok = s.check ? s.check(v) : true;
    if (ok !== true) { setInput(null); await botSay(ok, 'warn'); setInput(s); return; }
    data[s.key] = s.key === 'phone' ? normPhone(v) : v.trim();
    step++;
    setInput(null);
    if (step < STEPS.length) return ask();
    finish();
  }
  async function finish() {
    const ticket = 'C-' + toAr(Math.floor(1000 + Math.random() * 9000));
    store.set('jamra-messages', [{ ...data, ticket, at: Date.now() }, ...store.get('jamra-messages', [])].slice(0, 20));
    await botSay(`تمام يا ${esc(data.name.split(' ')[0])} ✅ رسالتك وصلت لفريق ${esc(data.topic)}.`);
    await botSay(`<div class="msg-card"><b>رقم المتابعة <bdi dir="ltr">${ticket}</bdi></b><span>${esc(data.topic)}</span><span>هنرد عليك على <bdi dir="ltr">${toAr(data.phone)}</bdi> خلال يوم عمل.</span></div>`, 'card');
    quick.innerHTML = '<button type="button" class="qr" id="again">ابعت رسالة تانية</button><a class="qr ghost" href="menu.html">افتح المنيو</a>';
    form.hidden = true;
  }
  function start() {
    body.innerHTML = ''; data = {}; step = 0; quick.innerHTML = ''; form.hidden = true;
    ask();
  }

  quick.addEventListener('click', e => {
    if (e.target.id === 'again') return start();
    const b = e.target.closest('.qr[data-v]'); if (b) answer(b.dataset.v);
  });
  form.addEventListener('submit', e => { e.preventDefault(); const v = text.value.trim(); if (v) answer(v); });
  const autoGrow = () => { text.style.height = 'auto'; text.style.height = Math.min(120, text.scrollHeight) + 'px'; };
  text.addEventListener('input', autoGrow);
  text.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
  });
  $('#chatRestart').addEventListener('click', start);
  start();

  /* ---------- classic contact form ---------- */
  const cf = $('#contactForm');
  $('#formBranch').insertAdjacentHTML('beforeend', D.BRANCHES.map(b => `<option value="${b.id}">${b.name} · ${b.city}</option>`).join(''));
  const counter = () => { $('#charCount').textContent = `${toAr(cf.msg.value.length)} / ٦٠٠`; };
  cf.msg.addEventListener('input', counter);
  cf.addEventListener('input', e => { e.target.classList.remove('invalid'); $('#cError').textContent = ''; });
  cf.addEventListener('submit', e => {
    e.preventDefault();
    cf.querySelectorAll('.invalid').forEach(x => x.classList.remove('invalid'));
    const bad = [];
    if (cf.name.value.trim().length < 2) bad.push([cf.name, 'اكتب اسمك']);
    if (!/^05\d{8}$/.test(normPhone(cf.phone.value))) bad.push([cf.phone, 'رقم الجوال لازم يكون ١٠ أرقام ويبدأ بـ 05']);
    if (cf.email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cf.email.value.trim())) bad.push([cf.email, 'الإيميل مكتوب غلط']);
    if (cf.msg.value.trim().length < 10) bad.push([cf.msg, 'اكتب رسالتك (١٠ حروف على الأقل)']);
    if (bad.length) { bad.forEach(([el]) => el.classList.add('invalid')); $('#cError').textContent = bad[0][1]; bad[0][0].focus(); return; }
    const ticket = 'C-' + Math.floor(1000 + Math.random() * 9000);
    store.set('jamra-messages', [{ name: cf.name.value.trim(), phone: normPhone(cf.phone.value), email: cf.email.value.trim(), branch: cf.branch.value, topic: cf.topic.value, msg: cf.msg.value.trim(), ticket, at: Date.now(), via: 'form' }, ...store.get('jamra-messages', [])].slice(0, 20));
    $('#cTicket').textContent = ticket;
    cf.classList.add('sent'); $('#cDone').hidden = false;
  });
  $('#cAgain').addEventListener('click', () => { cf.reset(); counter(); cf.classList.remove('sent'); $('#cDone').hidden = true; });

  /* ---------- social grid ---------- */
  $('#socialGrid').innerHTML = Site.SOCIALS.map((s, i) => `
    <a class="social-tile s-${s.icon.slice(2)}" href="${s.url}" target="_blank" rel="noopener" style="--i:${i}">
      <span class="social-ico"><svg><use href="#${s.icon}"/></svg></span>
      <span class="social-txt"><b>${s.name}</b><small dir="${/[a-z@+]/i.test(s.handle) ? 'ltr' : 'rtl'}">${s.handle}</small></span>
      <span class="social-count">${s.followers}</span>
    </a>`).join('');

  /* ---------- FAQ cards ---------- */
  const ICONS = ['🛵', '📍', '💸', '✏️', '🥩', '🧾', '🎉'];
  $('#faqList').innerHTML = D.FAQ.map(([q, a], i) => `
    <details class="faq-card reveal" style="--d:${(i % 2) * .06}s">
      <summary><span class="faq-emo" aria-hidden="true">${ICONS[i] || '🔥'}</span><b>${q}</b><span class="faq-ico" aria-hidden="true"></span></summary>
      <p>${a}</p>
    </details>`).join('');

  /* ---------- branches strip ---------- */
  $('#cxBranches').innerHTML = D.BRANCHES.map((b, i) => {
    const s = branchStatus(b);
    return `<a class="cx-branch reveal" style="--d:${i * .06}s" href="branches.html?b=${b.id}">
      <img src="${img(b.img, 300)}" alt="" loading="lazy">
      <div><small>${b.city}</small><b>${b.name}</b><span class="status ${s.open ? 'open' : 'closed'}"><i></i>${s.label}</span></div>
      <svg><use href="#i-arrow"/></svg>
    </a>`;
  }).join('');
})();
