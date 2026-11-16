/* جمرة · table reservation — date & time via flatpickr */
(() => {
  'use strict';
  const { $, $$, D, num, pad2, param, store } = Site;
  const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

  const st = {
    branch: (D.BRANCHES.find(b => b.id === param('b')) || D.BRANCHES[0]).id,
    date: today(), guests: 2, time: null,
  };
  const branch = () => D.BRANCHES.find(x => x.id === st.branch);
  const hourLabel = h => { const hh = h % 24; return `${num(hh % 12 || 12)} ${hh < 12 ? 'ص' : 'م'}`; };
  const timeLabel = m => { const h = Math.floor(m / 60) % 24; return `${num(h % 12 || 12)}:${pad2(m % 60)} ${h < 12 ? 'ص' : 'م'}`; };
  const hash = s => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

  // is minute-of-day `m` inside opening hours? (close may pass midnight, e.g. 26 = 2am)
  function inHours(b, m) {
    const after = m >= b.open * 60;
    const early = b.close > 24 && m < (b.close - 24) * 60;
    return after || early;
  }
  // the real moment of the booking: times after midnight belong to the next calendar day
  function moment(b, date, m) {
    const d = new Date(date);
    if (b.close > 24 && m < b.open * 60) d.setDate(d.getDate() + 1);
    d.setHours(Math.floor(m / 60), m % 60, 0, 0);
    return d;
  }
  function checkTime() {
    const b = branch(), hint = $('#timeHint');
    hint.classList.remove('ok', 'bad');
    if (st.time == null) { hint.textContent = `مواعيد ${b.name}: ${hourLabel(b.open)} – ${hourLabel(b.close)}`; return false; }
    if (!inHours(b, st.time)) { hint.textContent = `الفرع مقفول الساعة دي. المواعيد ${hourLabel(b.open)} – ${hourLabel(b.close)}`; hint.classList.add('bad'); return false; }
    if (moment(b, st.date, st.time) < new Date(Date.now() + 60 * 60000)) { hint.textContent = 'لازم الحجز يكون بعد ساعة على الأقل من دلوقتي'; hint.classList.add('bad'); return false; }
    // deterministic "fully booked" slots so the demo feels real
    if (hash(`${st.branch}-${st.date.toDateString()}-${st.time}`) % 7 === 0) { hint.textContent = 'الوقت ده محجوز بالكامل، جرّب قبله أو بعده بنص ساعة'; hint.classList.add('bad'); return false; }
    hint.textContent = '✓ الوقت متاح'; hint.classList.add('ok');
    return true;
  }

  // ---- branches ----
  $('#branchPick').innerHTML = D.BRANCHES.map(b => `
    <label class="pick"><input type="radio" name="branch" value="${b.id}"${b.id === st.branch ? ' checked' : ''}>
      <span><b>${b.name}</b><small>${b.city} · ${hourLabel(b.open)} – ${hourLabel(b.close)}</small></span></label>`).join('');

  // ---- flatpickr: inline calendar + time dropdown ----
  const fpLocale = (window.flatpickr && flatpickr.l10ns && flatpickr.l10ns.ar) || 'default';
  const datePicker = flatpickr('#datePicker', {
    inline: true, locale: fpLocale, minDate: 'today', maxDate: new Date().fp_incr(60),
    defaultDate: st.date, disableMobile: true, monthSelectorType: 'static',
    onChange: d => { if (d[0]) { st.date = d[0]; checkTime(); renderTicket(); } },
  });
  const timePicker = flatpickr('#timePicker', {
    enableTime: true, noCalendar: true, locale: fpLocale, disableMobile: true,
    dateFormat: 'H:i', time_24hr: false, minuteIncrement: 15, defaultHour: 20, defaultMinute: 0,
    formatDate: d => timeLabel(d.getHours() * 60 + d.getMinutes()),
    onChange: d => { st.time = d[0] ? d[0].getHours() * 60 + d[0].getMinutes() : null; checkTime(); renderTicket(); },
    onReady: (_, __, fp) => fp.calendarContainer.classList.add('jamra-time'),
  });
  datePicker.calendarContainer.classList.add('jamra-cal');

  function renderTicket() {
    const b = branch(), d = st.date;
    const area = $('[name=area]:checked').value;
    $('#ticketBody').innerHTML = `
      <div><dt>الفرع</dt><dd>${b.name} · ${b.city}</dd></div>
      <div><dt>اليوم</dt><dd>${DAYS[d.getDay()]} ${num(d.getDate())} ${MONTHS[d.getMonth()]}</dd></div>
      <div><dt>الوقت</dt><dd>${st.time != null ? timeLabel(st.time) : '<span class="muted">اختار وقت</span>'}</dd></div>
      <div><dt>الأشخاص</dt><dd>${num(st.guests)} ${st.guests > 2 && st.guests < 11 ? 'أشخاص' : 'شخص'}</dd></div>
      <div><dt>الجلسة</dt><dd>${area}</dd></div>`;
  }

  const form = $('#reserveForm');
  form.addEventListener('change', e => {
    if (e.target.name === 'branch') { st.branch = e.target.value; checkTime(); renderTicket(); }
    else if (e.target.name === 'area') renderTicket();
  });
  const setGuests = g => { st.guests = Math.max(1, Math.min(12, g)); $('#guests').textContent = num(st.guests); $('#gMinus').disabled = st.guests <= 1; $('#gPlus').disabled = st.guests >= 12; renderTicket(); };
  $('#gPlus').addEventListener('click', () => setGuests(st.guests + 1));
  $('#gMinus').addEventListener('click', () => setGuests(st.guests - 1));

  const normPhone = s => s.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[\s()-]/g, '').replace(/^(\+|00)966/, '0');
  form.addEventListener('input', e => { e.target.classList.remove('invalid'); $('#rError').textContent = ''; });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const err = $('#rError');
    $$('.invalid', form).forEach(x => x.classList.remove('invalid'));
    let msg = '', focus = null;
    if (st.time == null) { msg = 'اختار الساعة اللي تناسبك'; focus = $('.time-input'); }
    else if (!checkTime()) { msg = $('#timeHint').textContent; focus = $('.time-input'); }
    else if (form.name.value.trim().length < 2) { msg = 'اكتب اسمك'; focus = form.name; }
    else if (!/^05\d{8}$/.test(normPhone(form.phone.value))) { msg = 'رقم الجوال لازم يكون ١٠ أرقام ويبدأ بـ 05'; focus = form.phone; }
    if (msg) {
      err.textContent = msg;
      if (focus) { focus.classList.add('invalid'); focus.scrollIntoView({ block: 'center', behavior: 'smooth' }); if (focus.focus && focus.tagName === 'INPUT') focus.focus({ preventScroll: true }); }
      return;
    }
    err.textContent = '';
    const b = branch();
    const code = 'JR-' + (1000 + hash(Date.now() + form.phone.value) % 9000);
    const booking = { code, branch: st.branch, guests: st.guests, time: st.time, area: $('[name=area]:checked').value, name: form.name.value.trim(), phone: normPhone(form.phone.value), occasion: form.occasion.value, notes: form.notes.value.trim(), at: moment(b, st.date, st.time).toISOString(), createdAt: Date.now() };
    store.set('jamra-bookings', [booking, ...store.get('jamra-bookings', [])].slice(0, 20));
    $('#bookCode').textContent = code;
    $('#doneSum').innerHTML = $('#ticketBody').innerHTML;
    modalEl.hidden = false;
    requestAnimationFrame(() => modalEl.classList.add('on'));
    $('.modal-card a', modalEl).focus();
  });

  const modalEl = $('#doneModal');
  const closeModal = () => { modalEl.classList.remove('on'); setTimeout(() => { modalEl.hidden = true; }, 300); };
  modalEl.addEventListener('click', e => { if (e.target === modalEl) closeModal(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !modalEl.hidden) closeModal(); });

  setGuests(2);
  checkTime();
  renderTicket();
  void timePicker;
})();
