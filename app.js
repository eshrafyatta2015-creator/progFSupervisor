'use strict';

/* ============================== config ============================== */

const CFG = {
  listsCSV: 'https://docs.google.com/spreadsheets/d/1P2X7VK_ZnSqhrLtVJbDTwnjJqoVuNWaK-7i3EqvN6Gg/export?format=csv',
  programsCSV: 'https://docs.google.com/spreadsheets/d/16Sw_4TjAM0fhYKicxyZE0EzGoT98ZnlMSxYKxU3ILLk/export?format=csv',
  formBase: 'https://docs.google.com/forms/d/1PbG2agJLSR50yK0k5LKaY9umi_1UlCfAraOB8BF-WOY/formResponse',

  entrySupervisor: '1693725572',
  entrySchool: {
    sun: '1829173884', mon: '1461268196', tue: '2066013452',
    wed: '1336415727', thu: '382860391', sat: '1194598788',
  },
  entryActivity: {
    sun: '336812853', mon: '1907752307', tue: '1339851092',
    wed: '458079306', thu: '1861795443', sat: '785934006',
  },
  entryNotes: '1329670988',
  entryCode: '1840616412',
  entryType: '1627151443',

  phSupervisor: 'اسم المشرف',
  phSchool: 'اسم المدرسة',
  phActivity: 'الفعاليات',
  phType: 'نوع البرنامج',

  appName: 'AppEshrafPro',
  displayName: 'الإشراف والتأهيل التربوي',
  headerLine1: 'مديرية التربية والتعليم يطا',
  titleSupervisor: 'المشرف التربوي',
  titleSupervisorMarked: '✓ المشرف التربوي',
  titleSupervisorSearch: '🔍 اختر المشرف',
  titleNotes: '📝 ملاحظات البرنامج',
  titleType: '🎯 نوع البرنامج',
  titleResults: '🔍 نتائج البحث',
  periodMagicRow: '(اخترمن القائمة)اسم المشرف',

  days: [
    { key: 'sun', label: 'الاحــــــــد ', short: 'الأحد', err: '⚠ ادخل برنامج الاحد',
      schoolTitle: '🔍 اختر مدرسة الأحد', activityTitle: '🔍 اختر فعالية الأحد' },
    { key: 'mon', label: 'الاثنيــــــن', short: 'الاثنين', err: '⚠ ادخل برنامج الاثنين',
      schoolTitle: '🔍 اختر مدرسة الاثنين', activityTitle: '🔍 اختر فعالية الاثنين' },
    { key: 'tue', label: 'الثـــــلاثاء', short: 'الثلاثاء', err: '⚠ ادخل برنامج الثلاثاء',
      schoolTitle: '🔍 اختر مدرسة الثلاثاء', activityTitle: '🔍 اختر فعالية الثلاثاء' },
    { key: 'wed', label: 'الاربعـــاء', short: 'الاربعاء', err: '⚠ ادخل برنامج الاربعاء',
      schoolTitle: '🔍 اختر مدرسة الاربعاء', activityTitle: '🔍 اختر فعالية الاربعاء' },
    { key: 'thu', label: 'الخميـــس', short: 'الخميس', err: '⚠ ادخل برنامج الخميس',
      schoolTitle: '🔍 اختر مدرسة الخميس', activityTitle: '🔍 اختر فعالية الخميس' },
    { key: 'sat', label: 'الســــــبت', short: 'السبت', err: '⚠ ادخل برنامج السبت',
      schoolTitle: '🔍 اختر مدرسة السبت', activityTitle: '🔍 اختر فعالية السبت' },
  ],

  status: {
    searchStart: '🔍 جارٍ البحث...',
    noResults: 'لا توجد نتائج مطابقة للبحث',
    foundResults: '✓ تم العثور على النتائج',
    saved: '✓ تم حفظ البرنامج بنجاح',
    supervisorPicked: '✓ تم اختيار المشرف',
    schoolPicked: '✓ تم اختيار المدرسة',
    activityPicked: '✓ تم اختيار الفعالية',
    offline: '⚠ لا يوجد اتصال بالإنترنت، حاول مرة أخرى.',
    loadFailed: '⚠ تعذر تحميل البيانات، حاول مرة أخرى.',
  },
  err: {
    supervisor: '⚠ ادخل اسم المشرف',
    notes: '⚠ ادخل الملاحظات',
    code: '⚠ ادخل الكود الخاص بك',
    type: '⚠ ادخل نوع البرنامج',
    supervisorSearch: '⚠ ادخل اسم المشرف للبحث',
    alreadyPlanned: '⚠ تم ارسال برنامج التخطيط سابقا',
    doubleSent: '⚠ تم ارسال البرنامج مرتين يرجى مراجعة القسم',
    offline: '⚠ لا يوجد اتصال بالإنترنت، حاول مرة أخرى.',
    generic: '⚠ حدث خطأ أثناء الحفظ، حاول مرة أخرى.',
  },
};

const STORE = { lists: 'pwa.lists', programs: 'pwa.programs', lastSup: 'pwa.lastSupervisor', hint: 'pwa.hintDismissed' };

/* ============================== state ============================== */

const state = {
  supervisor: CFG.phSupervisor,
  days: {},
  notes: '',
  code: '',
  type: CFG.phType,
  status: '',
  period: '...',
  schools: [],
  activities: [],
  supervisors: [],
  submissions: [],
  results: [],
  submitCount: 0,
  flagDouble: false,
  submitting: false,
};

function blankDay() {
  return { school: CFG.phSchool, activity: CFG.phActivity };
}
CFG.days.forEach((d) => { state.days[d.key] = blankDay(); });

/* ============================== dom helpers ============================== */

const $ = (id) => document.getElementById(id);

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

/* ============================== csv ============================== */

function csvParse(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 1; } else { inQuotes = false; }
      } else { field += c; }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n') {
      row.push(field); field = ''; rows.push(row); row = [];
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function csvColumn(rows, index) {
  const out = [];
  for (const row of rows) {
    if (row.length >= index) {
      const v = row[index - 1];
      if (v) out.push(v);
    }
  }
  return out;
}

function dedupe(items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    if (!seen.has(it)) { seen.add(it); out.push(it); }
  }
  return out;
}

function stripBom(t) { return t.charCodeAt(0) === 0xfeff ? t.slice(1) : t; }

/* ============================== logic ============================== */

function supervisorValid(v) {
  return v && v !== CFG.phSupervisor && v.trim() !== '';
}

function dayMarked(f) {
  return f.school !== CFG.phSchool && f.activity !== CFG.phActivity
    && f.school !== '' && f.activity !== '';
}

function validationError() {
  if (!supervisorValid(state.supervisor)) return CFG.err.supervisor;
  for (const d of CFG.days) {
    if (!dayMarked(state.days[d.key])) return d.err;
  }
  if (!state.notes || !state.notes.trim()) return CFG.err.notes;
  if (!state.code || !state.code.trim()) return CFG.err.code;
  if (state.type === CFG.phType || !state.type) return CFG.err.type;
  return null;
}

function buildSubmitUrl() {
  const parts = [];
  const add = (k, v) => parts.push('entry.' + k + '=' + encodeURIComponent(v));
  add(CFG.entrySupervisor, state.supervisor);
  for (const d of CFG.days) add(CFG.entrySchool[d.key], state.days[d.key].school);
  for (const d of CFG.days) add(CFG.entryActivity[d.key], state.days[d.key].activity);
  add(CFG.entryNotes, state.notes);
  add(CFG.entryCode, state.code);
  add(CFG.entryType, state.type);
  return CFG.formBase + '?' + parts.join('&');
}

function countFor(sup) {
  const s = (sup || '').trim();
  return state.submissions.filter((r) => r.length > 1 && r[1] && r[1].trim() === s).length;
}

function searchRows(sup, code) {
  const s = (sup || '').trim();
  const c = (code || '').trim();
  return state.submissions.filter((r) => r.length > 16 && r[1] && r[1].trim() === s && r[15] && r[15].trim() === c);
}

function applyRestored(row) {
  const idx = [2, 4, 6, 8, 10, 12];
  const idxA = [3, 5, 7, 9, 11, 13];
  CFG.days.forEach((d, i) => {
    state.days[d.key] = {
      school: (row[idx[i]] || CFG.phSchool).trim(),
      activity: (row[idxA[i]] || CFG.phActivity).trim()
    };
  });
  state.notes = (row[14] || '').trim();
  state.type = (row[16] || CFG.phType).trim();
}

function shareText() {
  const lines = [CFG.displayName, CFG.headerLine1, '', CFG.titleSupervisor + ': ' + state.supervisor];
  for (const d of CFG.days) {
    const f = state.days[d.key];
    lines.push(d.label.trim() + ': ' + f.school + ' / ' + f.activity);
  }
  lines.push(CFG.titleNotes + ': ' + state.notes);
  lines.push(CFG.titleType + ': ' + state.type);
  return lines.join('\n');
}

/* ============================== storage ============================== */

function applyLists(text) {
  const rows = csvParse(stripBom(text));
  state.schools = dedupe(csvColumn(rows, 2).map((s) => s.trim()).filter((s) => s && s !== CFG.phSchool && s !== 'اسم المدرسة'));
  state.activities = dedupe(csvColumn(rows, 3).map((s) => s.trim()).filter((s) => s && s !== CFG.phActivity && s !== 'الفعاليات'));
  state.supervisors = dedupe(csvColumn(rows, 4).map((s) => s.trim()).filter((s) => s && s !== CFG.phSupervisor && s !== 'اسم المشرف'));
}

function applyPrograms(text) {
  state.submissions = csvParse(stripBom(text));
  const magic = state.submissions.find((r) => r.length > 2 && r[1] && r[1].trim() === CFG.periodMagicRow);
  if (magic && magic[2]) state.period = magic[2].trim();
}

function restoreCache() {
  const l = localStorage.getItem(STORE.lists);
  if (l) applyLists(l);
  const p = localStorage.getItem(STORE.programs);
  if (p) applyPrograms(p);
  const last = localStorage.getItem(STORE.lastSup);
  if (last && supervisorValid(last)) state.supervisor = last.trim();
}

function rememberSupervisor() {
  localStorage.setItem(STORE.lastSup, supervisorValid(state.supervisor) ? state.supervisor.trim() : '');
}

/* ============================== network ============================== */

async function fetchText(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
    if (!r.ok) throw new Error('http');
    const text = await r.text();
    if (!text) throw new Error('empty');
    return text;
  } finally {
    clearTimeout(timer);
  }
}

function messageFor(e) {
  const name = e && e.name;
  const msg = e && e.message;
  if (name === 'AbortError' || name === 'TypeError' || msg === 'offline') return CFG.err.offline;
  if (msg === 'http' || msg === 'empty') return CFG.status.loadFailed;
  return CFG.err.generic;
}

async function reloadLists(interactive) {
  setLoading(true);
  try {
    const text = await fetchText(CFG.listsCSV);
    applyLists(text);
    localStorage.setItem(STORE.lists, text);
  } catch (e) {
    const cached = localStorage.getItem(STORE.lists);
    if (cached) applyLists(cached);
    if (interactive || !state.schools.length) {
      setStatus(messageFor(e));
      if (interactive) postAlert(state.status);
    }
  } finally {
    setLoading(false);
  }
}

async function reloadPrograms(interactive) {
  setLoading(true);
  try {
    const text = await fetchText(CFG.programsCSV);
    applyPrograms(text);
    localStorage.setItem(STORE.programs, text);
    return true;
  } catch (e) {
    const cached = localStorage.getItem(STORE.programs);
    if (cached) applyPrograms(cached);
    if (interactive || !state.submissions.length) {
      setStatus(messageFor(e));
      if (interactive) postAlert(state.status);
    }
    return false;
  } finally {
    setLoading(false);
  }
}

/* ============================== flows ============================== */

async function afterSupervisorPick() {
  await reloadPrograms(false);
  let count = countFor(state.supervisor);
  let flag = state.flagDouble;
  let resetSup = false;
  if (count === 0) setStatus(CFG.status.supervisorPicked);
  if (flag) { setStatus(CFG.err.doubleSent); postAlert(CFG.err.doubleSent); flag = false; }
  if (count === 1) { setStatus(CFG.err.alreadyPlanned); postAlert(CFG.err.alreadyPlanned); count = 0; }
  if (!flag && count >= 2) {
    count = 0; flag = true; resetSup = true;
    setStatus(CFG.err.doubleSent); postAlert(CFG.err.doubleSent);
  }
  if (resetSup) state.supervisor = CFG.phSupervisor;
  state.submitCount = count;
  state.flagDouble = flag;
  rememberSupervisor();
  renderSupervisor();
}

function pickSchool(dayKey, value) {
  state.days[dayKey].school = value;
  setStatus(CFG.status.schoolPicked);
  renderDays();
}

function pickActivity(dayKey, value) {
  state.days[dayKey].activity = value;
  setStatus(CFG.status.activityPicked);
  renderDays();
}

async function save() {
  const err = validationError();
  if (err) { setStatus(err); postAlert(err); return; }
  const url = buildSubmitUrl();
  state.submitting = true;
  renderSaveBtn();
  try {
    await fetch(url, { mode: 'no-cors', cache: 'no-store', credentials: 'omit' });
    setStatus(CFG.status.saved);
    resetForm();
    rememberSupervisor();
    renderAll();
    await reloadPrograms(false);
    renderPeriod();
  } catch (e) {
    setStatus(messageFor(e));
    postAlert(state.status);
  } finally {
    state.submitting = false;
    renderSaveBtn();
  }
}

function search() {
  if (!supervisorValid(state.supervisor)) {
    setStatus(CFG.err.supervisorSearch);
    postAlert(state.status);
    return;
  }
  if (!state.code || !state.code.trim()) {
    setStatus(CFG.err.code);
    postAlert(state.status);
    return;
  }
  setStatus(CFG.status.searchStart);
  state.results = [];
  renderResults();
  (async () => {
    const fresh = await reloadPrograms(false);
    if (!fresh && !state.submissions.length) return;
    const found = searchRows(state.supervisor, state.code);
    if (found.length) {
      applyRestored(found[found.length - 1]);
      state.results = found;
      setStatus(CFG.status.foundResults);
      renderAll();
    } else {
      state.results = [];
      setStatus(CFG.status.noResults);
      renderResults();
    }
  })();
}

function resetForm() {
  state.supervisor = CFG.phSupervisor;
  CFG.days.forEach((d) => { state.days[d.key] = blankDay(); });
  state.notes = '';
  state.code = '';
  state.type = CFG.phType;
}

/* ============================== ui: status/alert/loading ============================== */

function setStatus(text) {
  state.status = text;
  $('status').textContent = text;
}

let alertQueue = [];
let alertOn = false;

function postAlert(msg) {
  alertQueue.push(msg);
  if (!alertOn) nextAlert();
}

function nextAlert() {
  if (!alertQueue.length) {
    alertOn = false;
    $('alert-layer').classList.add('hidden');
    return;
  }
  alertOn = true;
  $('alert-msg').textContent = alertQueue.shift();
  $('alert-layer').classList.remove('hidden');
}

function setLoading(on) {
  $('loading').classList.toggle('hidden', !on);
}

/* ============================== ui: rendering ============================== */

function setFieldValue(node, value, placeholder) {
  const isPh = value === placeholder || value === '';
  node.textContent = isPh ? placeholder : value;
  node.classList.toggle('is-placeholder', isPh);
}

function renderSupervisor() {
  $('sup-title').textContent = supervisorValid(state.supervisor)
    ? CFG.titleSupervisorMarked : CFG.titleSupervisor;
  setFieldValue($('sup-value'), state.supervisor, CFG.phSupervisor);
}

function renderDays() {
  for (const d of CFG.days) {
    const f = state.days[d.key];
    $('head-' + d.key).textContent = (dayMarked(f) ? '✓ ' : '') + d.label;
    setFieldValue($('school-' + d.key).querySelector('.field-value'), f.school, CFG.phSchool);
    setFieldValue($('activity-' + d.key).querySelector('.field-value'), f.activity, CFG.phActivity);
  }
}

function renderPeriod() { $('period-value').textContent = state.period; }

function renderNotes() {
  const ta = $('notes');
  if (ta.value !== state.notes) ta.value = state.notes;
  $('notes-hint').classList.toggle('hidden', state.notes !== '');
}

function renderCode() {
  const inp = $('code');
  if (inp.value !== state.code) inp.value = state.code;
}

function renderType() { $('type').value = state.type; }

function renderSaveBtn() {
  const b = $('btn-save');
  b.disabled = state.submitting;
  b.textContent = state.submitting ? '…' : '✓ حفظ البرنامج';
}

function renderResults() {
  const wrap = $('results');
  wrap.textContent = '';
  for (const row of state.results) {
    const card = el('div', 'result-row');
    card.appendChild(el('div', 'result-sup', row.length > 1 ? row[1] : ''));
    CFG.days.forEach((d, i) => {
      const s = row[2 + i * 2] || '';
      const a = row[3 + i * 2] || '';
      if (s && s !== CFG.phSchool) {
        card.appendChild(el('div', 'result-line', d.short + ': ' + s + ' — ' + a));
      }
    });
    if (row.length > 14 && row[14]) {
      card.appendChild(el('div', 'result-line', 'ملاحظات: ' + row[14]));
    }
    wrap.appendChild(card);
  }
}

function renderAll() {
  renderSupervisor();
  renderDays();
  renderPeriod();
  renderNotes();
  renderCode();
  renderType();
  renderSaveBtn();
  renderResults();
}

/* ============================== ui: picker sheet ============================== */

let sheetCb = null;
let currentPickerItems = [];

function openPicker(title, items, cb) {
  sheetCb = cb;
  currentPickerItems = items || [];
  $('sheet-title').textContent = title;
  $('sheet-search').value = '';
  renderSheetList(currentPickerItems);
  $('sheet').classList.remove('hidden');
  $('sheet-search').focus();
}

function renderSheetList(items) {
  const q = $('sheet-search').value.trim().toLowerCase();
  const list = $('sheet-list');
  list.textContent = '';
  const filtered = q
    ? (items || []).filter((it) => it.toLowerCase().includes(q))
    : (items || []);
  if (!filtered.length) {
    list.appendChild(el('li', 'sheet-empty', CFG.status.noResults));
    return;
  }
  for (const item of filtered) {
    const li = el('li', '', item);
    li.addEventListener('click', () => {
      const cb = sheetCb;
      closePicker();
      if (cb) cb(item);
    });
    list.appendChild(li);
  }
}

function closePicker() {
  $('sheet').classList.add('hidden');
  sheetCb = null;
}

/* ============================== events ============================== */

function bindEvents() {
  $('sup-field').addEventListener('click', () => {
    openPicker(CFG.titleSupervisorSearch, state.supervisors, (v) => {
      state.supervisor = v;
      renderSupervisor();
      afterSupervisorPick();
    });
  });

  for (const d of CFG.days) {
    $('school-' + d.key).addEventListener('click', () => {
      openPicker(d.schoolTitle, state.schools, (v) => pickSchool(d.key, v));
    });
    $('activity-' + d.key).addEventListener('click', () => {
      openPicker(d.activityTitle, state.activities, (v) => pickActivity(d.key, v));
    });
  }

  $('notes').addEventListener('input', (e) => {
    state.notes = e.target.value;
    $('notes-hint').classList.toggle('hidden', state.notes !== '');
  });
  $('code').addEventListener('input', (e) => { state.code = e.target.value; });
  $('type').addEventListener('change', (e) => { state.type = e.target.value; });

  $('btn-save').addEventListener('click', save);
  $('btn-search').addEventListener('click', search);
  $('btn-refresh').addEventListener('click', async () => {
    await reloadLists(true);
    await reloadPrograms(true);
  });
  $('btn-share').addEventListener('click', async () => {
    const text = shareText();
    if (navigator.share) {
      try {
        await navigator.share({ title: CFG.displayName, text });
      } catch (e) {
        /* user dismissed or cancelled share */
      }
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        postAlert('✓ تم نسخ البرنامج إلى الحافظة');
      } catch (e) {
        /* clipboard write denied */
      }
    }
  });

  $('sheet-close').addEventListener('click', closePicker);
  $('sheet-backdrop').addEventListener('click', closePicker);
  $('sheet-search').addEventListener('input', () => {
    renderSheetList(currentPickerItems);
  });

  $('alert-ok').addEventListener('click', nextAlert);
}

/* ============================== install / sw ============================== */

function setupInstallHint() {
  const hint = $('install-hint');
  const text = $('install-hint-text');
  const btn = $('install-hint-btn');
  const standalone = window.navigator.standalone === true
    || window.matchMedia('(display-mode: standalone)').matches;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  let deferred = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    if (!standalone) {
      text.textContent = 'يمكنك تثبيت التطبيق الآن ليعمل كتطبيق مستقل.';
      btn.classList.remove('hidden');
      hint.classList.remove('hidden');
    }
  });

  if (!standalone && isIOS && !localStorage.getItem(STORE.hint)) {
    text.textContent = 'للتثبيت على شاشة الرئيسية: اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية».';
    btn.classList.add('hidden');
    hint.classList.remove('hidden');
  }

  btn.addEventListener('click', async () => {
    if (deferred) {
      deferred.prompt();
      deferred = null;
      hint.classList.add('hidden');
    }
  });
  $('install-hint-close').addEventListener('click', () => {
    hint.classList.add('hidden');
    localStorage.setItem(STORE.hint, '1');
  });
}

function setupServiceWorker() {
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* offline ok */ });
  }
}

/* ============================== init ============================== */

function buildDays() {
  const wrap = $('days');
  wrap.textContent = '';
  for (const d of CFG.days) {
    const block = el('div', 'day-block');
    const head = el('div', 'day-head', d.label);
    head.id = 'head-' + d.key;
    const school = el('button', 'field day-school');
    school.type = 'button';
    school.id = 'school-' + d.key;
    school.appendChild(el('span', 'field-value is-placeholder', CFG.phSchool));
    school.appendChild(el('span', 'field-icon', '🔍'));
    const activity = el('button', 'field day-activity');
    activity.type = 'button';
    activity.id = 'activity-' + d.key;
    activity.appendChild(el('span', 'field-value is-placeholder', CFG.phActivity));
    activity.appendChild(el('span', 'field-icon', '🔍'));
    block.appendChild(head);
    block.appendChild(school);
    block.appendChild(activity);
    wrap.appendChild(block);
  }
}

function init() {
  buildDays();
  bindEvents();
  restoreCache();
  renderAll();
  (async () => {
    await reloadLists(false);
    await reloadPrograms(false);
    renderAll();
  })();
  setupInstallHint();
  setupServiceWorker();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
