import './style.css';
import mockCsv from '../mock-customers.csv?raw';

(function () {
  'use strict';

  /* ---------- Constants ---------- */
  var FIELDS = ['id', 'name', 'phone', 'email', 'city', 'lastPurchaseDate', 'totalPurchases', 'lastProduct', 'satisfaction', 'openTickets'];
  var TEXT_FIELDS = ['id', 'name', 'phone', 'email', 'city'];
  var PRODUCTS = ['entry', 'interior', 'safe_room', 'sliding', 'security', 'accessories'];
  var RISK_MAX = 2;          // satisfaction <= 2 is "at risk"
  var ACTIVE_DAYS = 365;     // purchased within the last 365 days = active
  var STORE_KEY = 'crd.customers.v1';
  var LANG_KEY = 'crd.lang';
  var AT_BATCH = 10;           // Airtable accepts up to 10 records per write request

  /* ---------- Translations ---------- */
  var I18N = {
    he: {
      subtitle: 'מעקב שביעות רצון וזיהוי לקוחות בסיכון נטישה',
      reset: 'איפוס נתונים',
      resetTitle: 'איפוס לנתוני הדוגמה',
      resetBody: 'כל הלקוחות הנוכחיים יוחלפו בנתוני הדוגמה. מומלץ לייצא CSV לפני כן. להמשיך?',
      resetOk: 'איפוס',
      'kpi.total': 'סה"כ לקוחות', 'kpi.active': 'לקוחות פעילים', 'kpi.avg': 'ממוצע שביעות רצון', 'kpi.tickets': 'פניות פתוחות',
      subTotalRisk: '{n} בסיכון', subTotalNone: 'אין לקוחות בסיכון',
      subActive: 'רכשו ב-365 הימים האחרונים', subAvg: 'מתוך 5', subTickets: 'בכל הלקוחות',
      searchLabel: 'חיפוש', searchPh: 'חיפוש לפי שם, מזהה, טלפון, אימייל או עיר',
      fRisk: 'רמת סיכון', fActivity: 'פעילות', fTickets: 'פניות פתוחות', fProduct: 'מוצר אחרון',
      all: 'הכל', riskYes: 'בסיכון (≤2)', riskNo: 'לא בסיכון', actYes: 'פעילים', actNo: 'לא פעילים', tixYes: 'עם פניות פתוחות', tixNo: 'בלי פניות',
      clearFilters: 'נקה סינונים', import: 'ייבוא CSV', export: 'ייצוא CSV', add: 'הוספת לקוח',
      'col.id': 'מזהה', 'col.name': 'שם', 'col.phone': 'טלפון', 'col.email': 'אימייל', 'col.city': 'עיר',
      'col.lastPurchaseDate': 'רכישה אחרונה', 'col.totalPurchases': 'סך רכישות', 'col.lastProduct': 'מוצר אחרון',
      'col.satisfaction': 'שביעות רצון', 'col.openTickets': 'פניות פתוחות', 'col.actions': 'פעולות',
      sortBy: 'מיון לפי {col}',
      count: 'מציג {n} מתוך {m} לקוחות',
      emptyAll: 'אין לקוחות עדיין', emptyAllHint: 'הוסיפו לקוח או ייבאו קובץ CSV.',
      emptyFilter: 'לא נמצאו לקוחות', emptyFilterHint: 'נסו לשנות את החיפוש או לנקות את הסינונים.',
      atRisk: 'בסיכון', inactive: 'לא פעיל',
      edit: 'עריכה', del: 'מחיקה', editAria: 'עריכת {name}', delAria: 'מחיקת {name}',
      addTitle: 'הוספת לקוח', editTitle: 'עריכת לקוח', save: 'שמירה', cancel: 'ביטול', optional: '(אופציונלי)',
      select: 'בחרו…', sat1: '1 (נמוך)', sat2: '2', sat3: '3', sat4: '4', sat5: '5 (גבוה)',
      'prod.entry': 'דלת כניסה', 'prod.interior': 'דלת פנים', 'prod.safe_room': 'דלת ממ"ד', 'prod.sliding': 'דלת הזזה', 'prod.security': 'דלת פלדלת', 'prod.accessories': 'אביזרים ומנעולים',
      eRequired: 'שדה חובה', ePhone: 'ספרות, מקפים ורווחים בלבד', eEmail: 'כתובת אימייל לא תקינה',
      eDate: 'תאריך לא תקין', eDateFuture: 'התאריך לא יכול להיות בעתיד',
      eNum: 'יש להזין מספר', eMin: 'המספר חייב להיות 0 או יותר', eInt: 'יש להזין מספר שלם',
      eSat: 'יש לבחור מספר שלם בין 1 ל-5', eProduct: 'סוג מוצר לא מוכר',
      eId: 'מזהה לא תקין (אותיות, ספרות, מקף וקו תחתון, עד 30 תווים)',
      delTitle: 'מחיקת לקוח', delBody: 'למחוק את {name}? פעולה זו אינה הפיכה.', delOk: 'מחיקה',
      impTitle: 'סיכום ייבוא', impFailTitle: 'הייבוא נכשל',
      impNew: '{n} לקוחות חדשים יתווספו', impUpd: '{n} לקוחות קיימים יתעדכנו (לפי מזהה)', impRej: '{n} שורות נדחו',
      impUpdList: 'מזהים שיתעדכנו:', impRejList: 'שורות שנדחו:', impConfirm: 'אישור ייבוא',
      impNothing: 'אין שורות תקינות לייבוא.', close: 'סגירה',
      missingHeaders: 'חסרות עמודות בקובץ: {list}', emptyFile: 'הקובץ ריק', readErr: 'לא ניתן לקרוא את הקובץ',
      row: 'שורה {n}', dupInFile: 'מזהה כפול בקובץ (מופיע לראשונה בשורה {row})',
      tAdded: 'הלקוח נוסף', tUpdated: 'הלקוח עודכן', tDeleted: 'הלקוח נמחק',
      tImported: '{a} נוספו, {u} עודכנו, {r} נדחו', tExported: 'יוצאו {n} לקוחות', tReset: 'הנתונים אופסו לנתוני הדוגמה',
      footer: 'הנתונים נשמרים בדפדפן זה בלבד. מומלץ לייצא CSV באופן קבוע כגיבוי.',
      storageOff: 'שמירה בדפדפן אינה זמינה: השינויים יאבדו ברענון הדף. ייצאו CSV כדי לשמור אותם.',
      refresh: 'רענון מ-Airtable', retry: 'ניסיון חוזר',
      modeLocal: 'נתוני דוגמה מקומיים', modeAt: 'מחובר ל-Airtable',
      atErrAuth: 'לשרת אין הרשאה לגשת ל-Airtable: הטוקן לא תקין, חסרה לו הרשאה, או ששם הטבלה שגוי (Airtable מחזיר את אותה שגיאה בכל המקרים)', atErrNotFound: 'הבסיס או הטבלה לא נמצאו',
      atErrNetwork: 'אין חיבור ל-Airtable. בדקו את האינטרנט ונסו שוב', atErrGeneric: 'שגיאה לא ידועה מ-Airtable',
      loading: 'טוען נתונים…', loadFailed: 'לא ניתן לטעון מ-Airtable: {msg}',
      tRefreshed: 'הנתונים רועננו מ-Airtable', tIdsFixed: 'הוקצו מזהים ל-{n} רשומות ב-Airtable',
      tSaveFail: 'השמירה ב-Airtable נכשלה: {msg}',
      footerAt: 'הנתונים נשמרים ב-Airtable ונגישים דרך השרת. הטוקן נשמר בצד השרת בלבד.'
    },
    en: {
      subtitle: 'Track customer satisfaction and spot churn risk',
      reset: 'Reset data',
      resetTitle: 'Reset to sample data',
      resetBody: 'All current customers will be replaced with the sample data. Consider exporting a CSV first. Continue?',
      resetOk: 'Reset',
      'kpi.total': 'Total customers', 'kpi.active': 'Active customers', 'kpi.avg': 'Average satisfaction', 'kpi.tickets': 'Open tickets',
      subTotalRisk: '{n} at risk', subTotalNone: 'No customers at risk',
      subActive: 'Purchased in the last 365 days', subAvg: 'out of 5', subTickets: 'Across all customers',
      searchLabel: 'Search', searchPh: 'Search by name, ID, phone, email or city',
      fRisk: 'Risk level', fActivity: 'Activity', fTickets: 'Open tickets', fProduct: 'Last product',
      all: 'All', riskYes: 'At risk (≤2)', riskNo: 'Not at risk', actYes: 'Active', actNo: 'Inactive', tixYes: 'With open tickets', tixNo: 'Without',
      clearFilters: 'Clear filters', import: 'Import CSV', export: 'Export CSV', add: 'Add customer',
      'col.id': 'ID', 'col.name': 'Name', 'col.phone': 'Phone', 'col.email': 'Email', 'col.city': 'City',
      'col.lastPurchaseDate': 'Last purchase', 'col.totalPurchases': 'Total purchases', 'col.lastProduct': 'Last product',
      'col.satisfaction': 'Satisfaction', 'col.openTickets': 'Open tickets', 'col.actions': 'Actions',
      sortBy: 'Sort by {col}',
      count: 'Showing {n} of {m} customers',
      emptyAll: 'No customers yet', emptyAllHint: 'Add a customer or import a CSV file.',
      emptyFilter: 'No customers found', emptyFilterHint: 'Try changing the search or clearing the filters.',
      atRisk: 'At risk', inactive: 'Inactive',
      edit: 'Edit', del: 'Delete', editAria: 'Edit {name}', delAria: 'Delete {name}',
      addTitle: 'Add customer', editTitle: 'Edit customer', save: 'Save', cancel: 'Cancel', optional: '(optional)',
      select: 'Select…', sat1: '1 (low)', sat2: '2', sat3: '3', sat4: '4', sat5: '5 (high)',
      'prod.entry': 'Entry door', 'prod.interior': 'Interior door', 'prod.safe_room': 'Safe-room door', 'prod.sliding': 'Sliding door', 'prod.security': 'Steel security door', 'prod.accessories': 'Accessories and locks',
      eRequired: 'Required', ePhone: 'Digits, hyphens and spaces only', eEmail: 'Invalid email address',
      eDate: 'Invalid date', eDateFuture: 'Date cannot be in the future',
      eNum: 'Enter a number', eMin: 'Must be 0 or more', eInt: 'Enter a whole number',
      eSat: 'Must be a whole number from 1 to 5', eProduct: 'Unknown product type',
      eId: 'Invalid ID (letters, digits, hyphen, underscore; up to 30 characters)',
      delTitle: 'Delete customer', delBody: 'Delete {name}? This action cannot be undone.', delOk: 'Delete',
      impTitle: 'Import summary', impFailTitle: 'Import failed',
      impNew: '{n} new customers will be added', impUpd: '{n} existing customers will be updated (matched by ID)', impRej: '{n} rows rejected',
      impUpdList: 'IDs to be updated:', impRejList: 'Rejected rows:', impConfirm: 'Confirm import',
      impNothing: 'There are no valid rows to import.', close: 'Close',
      missingHeaders: 'Missing columns in file: {list}', emptyFile: 'The file is empty', readErr: 'Could not read the file',
      row: 'Row {n}', dupInFile: 'Duplicate ID in file (first seen in row {row})',
      tAdded: 'Customer added', tUpdated: 'Customer updated', tDeleted: 'Customer deleted',
      tImported: '{a} added, {u} updated, {r} rejected', tExported: 'Exported {n} customers', tReset: 'Data reset to sample data',
      footer: 'Data is stored in this browser only. Export a CSV regularly as a backup.',
      storageOff: 'Browser storage is unavailable: changes will be lost when the page is refreshed. Export a CSV to keep them.',
      refresh: 'Refresh from Airtable', retry: 'Retry',
      modeLocal: 'Local sample data', modeAt: 'Connected to Airtable',
      atErrAuth: 'The server cannot access Airtable: the token is invalid, lacks permission, or the table name is wrong (Airtable returns the same error for all three)', atErrNotFound: 'Base or table not found',
      atErrNetwork: 'Cannot reach Airtable. Check your connection and try again', atErrGeneric: 'Unknown error from Airtable',
      loading: 'Loading data…', loadFailed: 'Could not load from Airtable: {msg}',
      tRefreshed: 'Data refreshed from Airtable', tIdsFixed: 'Assigned IDs to {n} records in Airtable',
      tSaveFail: 'Saving to Airtable failed: {msg}',
      footerAt: 'Data is stored in Airtable and reached through the server. The token stays on the server.'
    }
  };

  /* ---------- State ---------- */
  var lang = 'he';
  var customers = [];
  var storageOk = true;
  var filters = { q: '', risk: 'all', activity: 'all', tickets: 'all', product: 'all' };
  var sort = { key: 'satisfaction', dir: 'asc' };   // dir: 'asc' | 'desc' | null (null = original order)
  var editingId = null;
  var pendingImport = null;
  var at = null;               // { proxy: true } when the server provides Airtable access, otherwise null (local sample data)
  var loading = true, loadError = '';   // loading stays true until we know whether the server provides Airtable

  /* ---------- Helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function t(key, params) {
    var s = (I18N[lang] && I18N[lang][key] != null) ? I18N[lang][key] : key;
    if (params) s = s.replace(/\{(\w+)\}/g, function (m, k) { return params[k] != null ? params[k] : m; });
    return s;
  }
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function locale() { return lang === 'he' ? 'he-IL' : 'en-GB'; }
  function fmtInt(n) { return new Intl.NumberFormat(locale()).format(n); }
  function fmtMoney(n) { return new Intl.NumberFormat(locale(), { style: 'currency', currency: 'ILS', maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(n); }
  function fmtDate(iso) {
    var ts = parseISO(iso);
    if (ts == null) return iso;
    return new Intl.DateTimeFormat(locale(), { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(ts));
  }

  /* ---------- Dates ---------- */
  function todayUTC() { var d = new Date(); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()); }
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function parseISO(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3], ts = Date.UTC(y, mo - 1, d), dt = new Date(ts);
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
    return ts;
  }
  function daysSince(iso) { return Math.round((todayUTC() - parseISO(iso)) / 86400000); }
  function isActive(c) { return daysSince(c.lastPurchaseDate) <= ACTIVE_DAYS; }
  function isAtRisk(c) { return c.satisfaction != null && c.satisfaction <= RISK_MAX; }

  /* ---------- Products ---------- */
  function productLabel(key) { return key ? t('prod.' + key) : '—'; }
  function normalizeProduct(raw) {
    var v = String(raw == null ? '' : raw).trim().toLowerCase();
    if (!v) return null;
    if (PRODUCTS.indexOf(v) !== -1) return v;
    var langs = ['he', 'en'];
    for (var i = 0; i < PRODUCTS.length; i++) {
      for (var j = 0; j < langs.length; j++) {
        if (I18N[langs[j]]['prod.' + PRODUCTS[i]].toLowerCase() === v) return PRODUCTS[i];
      }
    }
    return null;
  }

  /* ---------- Validation (shared by the form and CSV import) ---------- */
  // Returns { errors: { field: messageKey }, value: normalizedCustomer }
  function validateCustomer(raw, opts) {
    var errors = {}, v = {};
    function str(k) { return String(raw[k] == null ? '' : raw[k]).trim(); }

    v.id = str('id');
    if (opts && opts.checkId && v.id && !/^[A-Za-z0-9_-]{1,30}$/.test(v.id)) errors.id = 'eId';

    v.name = str('name');
    if (!v.name) errors.name = 'eRequired';

    v.phone = str('phone');
    if (!v.phone) errors.phone = 'eRequired';
    else if (!/^[0-9\- ]+$/.test(v.phone) || !/[0-9]/.test(v.phone)) errors.phone = 'ePhone';

    v.email = str('email');
    if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) errors.email = 'eEmail';

    v.city = str('city');

    v.lastPurchaseDate = str('lastPurchaseDate');
    if (!v.lastPurchaseDate) errors.lastPurchaseDate = 'eRequired';
    else {
      var ts = parseISO(v.lastPurchaseDate);
      if (ts == null) errors.lastPurchaseDate = 'eDate';
      else if (ts > todayUTC()) errors.lastPurchaseDate = 'eDateFuture';
    }

    var tp = str('totalPurchases');
    if (tp === '') errors.totalPurchases = 'eRequired';
    else if (!/^-?\d+(\.\d+)?$/.test(tp)) errors.totalPurchases = 'eNum';
    else if (Number(tp) < 0) errors.totalPurchases = 'eMin';
    v.totalPurchases = Number(tp);

    var prodRaw = str('lastProduct');
    if (!prodRaw) errors.lastProduct = 'eRequired';
    else {
      var p = normalizeProduct(prodRaw);
      if (!p) errors.lastProduct = 'eProduct'; else v.lastProduct = p;
    }

    var sat = str('satisfaction');
    if (sat === '') errors.satisfaction = 'eRequired';
    else if (!/^\d+$/.test(sat) || Number(sat) < 1 || Number(sat) > 5) errors.satisfaction = 'eSat';
    v.satisfaction = Number(sat);

    var ot = str('openTickets');
    if (ot === '') ot = '0';
    if (!/^-?\d+(\.\d+)?$/.test(ot)) errors.openTickets = 'eNum';
    else if (!/^-?\d+$/.test(ot)) errors.openTickets = 'eInt';
    else if (Number(ot) < 0) errors.openTickets = 'eMin';
    v.openTickets = Number(ot);

    return { errors: errors, value: v };
  }

  /* ---------- CSV ---------- */
  function parseCSV(text) {
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    var firstLine = text.split(/\r\n|\n|\r/)[0] || '';
    var delim = (firstLine.split(';').length > firstLine.split(',').length) ? ';' : ',';
    var rows = [], row = [], field = '', inQ = false, i = 0, n = text.length;
    while (i < n) {
      var c = text[i];
      if (inQ) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
          inQ = false; i++; continue;
        }
        field += c; i++; continue;
      }
      if (c === '"' && field === '') { inQ = true; i++; continue; }
      if (c === delim) { row.push(field); field = ''; i++; continue; }
      if (c === '\r' || c === '\n') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field); rows.push(row); row = []; field = ''; i++; continue;
      }
      field += c; i++;
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    return rows;
  }
  function csvEscape(value, neutralize) {
    var s = String(value == null ? '' : value);
    if (neutralize && /^[=+\-@\t\r]/.test(s)) s = "'" + s;          // CSV injection guard
    if (/[",\r\n]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  }
  function toCSV(list) {
    var lines = [FIELDS.join(',')];
    list.forEach(function (c) {
      lines.push(FIELDS.map(function (f) { return csvEscape(c[f], TEXT_FIELDS.indexOf(f) !== -1); }).join(','));
    });
    return lines.join('\r\n') + '\r\n';
  }
  function unguard(v) { return /^'[=+\-@\t\r]/.test(v) ? v.slice(1) : v; }

  /* ---------- Storage ---------- */
  function mockCustomers() {
    var rows = parseCSV(mockCsv);
    var head = rows.shift().map(function (h) { return h.trim(); });
    var out = [];
    rows.forEach(function (r) {
      if (r.every(function (x) { return x === ''; })) return;
      var raw = {};
      head.forEach(function (h, i) { raw[h] = r[i]; });
      var res = validateCustomer(raw, { checkId: true });
      if (!Object.keys(res.errors).length) out.push(res.value);
    });
    return out;
  }
  function loadCustomers() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORE_KEY));
      if (Array.isArray(saved)) return saved;
    } catch (e) { /* fall through to seed */ }
    return mockCustomers();
  }
  function persist() {
    if (at) return;    // data lives in Airtable; keep it out of browser storage
    try { localStorage.setItem(STORE_KEY, JSON.stringify(customers)); storageOk = true; }
    catch (e) { storageOk = false; renderFooter(); }
  }
  function nextId(extraIds) {
    var max = 0;
    customers.forEach(function (c) { var m = /^C-(\d+)$/.exec(c.id); if (m) max = Math.max(max, +m[1]); });
    (extraIds || []).forEach(function (id) { var m = /^C-(\d+)$/.exec(id); if (m) max = Math.max(max, +m[1]); });
    return 'C-' + String(max + 1).padStart(4, '0');
  }

  /* ---------- Rendering ---------- */
  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.title = 'Customer Retention Dashboard';
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) { el.placeholder = t(el.getAttribute('data-i18n-placeholder')); });
    $('langHe').setAttribute('aria-pressed', String(lang === 'he'));
    $('langEn').setAttribute('aria-pressed', String(lang === 'en'));
    buildSelects();
    renderAll();
  }
  function setOptions(sel, items) {
    var cur = sel.value;
    sel.innerHTML = items.map(function (o) { return '<option value="' + esc(o.value) + '">' + esc(o.label) + '</option>'; }).join('');
    if (items.some(function (o) { return o.value === cur; })) sel.value = cur;
  }
  function buildSelects() {
    var all = { value: 'all', label: t('all') };
    setOptions($('fRisk'), [all, { value: 'risk', label: t('riskYes') }, { value: 'ok', label: t('riskNo') }]);
    setOptions($('fActivity'), [all, { value: 'active', label: t('actYes') }, { value: 'inactive', label: t('actNo') }]);
    setOptions($('fTickets'), [all, { value: 'with', label: t('tixYes') }, { value: 'without', label: t('tixNo') }]);
    var prods = PRODUCTS.map(function (p) { return { value: p, label: productLabel(p) }; });
    setOptions($('fProduct'), [all].concat(prods));
    setOptions($('f_lastProduct'), [{ value: '', label: t('select') }].concat(prods));
    setOptions($('f_satisfaction'), [{ value: '', label: t('select') }].concat([1, 2, 3, 4, 5].map(function (n) { return { value: String(n), label: t('sat' + n) }; })));
    $('fRisk').value = filters.risk; $('fActivity').value = filters.activity;
    $('fTickets').value = filters.tickets; $('fProduct').value = filters.product;
  }

  function renderKPIs() {
    var total = customers.length;
    var active = customers.filter(isActive).length;
    var risk = customers.filter(isAtRisk).length;
    var rated = customers.filter(function (c) { return c.satisfaction != null; });
    var avg = rated.length ? rated.reduce(function (s, c) { return s + c.satisfaction; }, 0) / rated.length : null;
    var tix = customers.reduce(function (s, c) { return s + c.openTickets; }, 0);
    var avgTxt = avg == null ? '—' : new Intl.NumberFormat(locale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(avg);
    var cards = [
      { label: t('kpi.total'), value: fmtInt(total), sub: risk ? t('subTotalRisk', { n: fmtInt(risk) }) : t('subTotalNone'), subClass: risk ? ' risk' : '' },
      { label: t('kpi.active'), value: fmtInt(active), sub: t('subActive') },
      { label: t('kpi.avg'), value: avgTxt, sub: t('subAvg') },
      { label: t('kpi.tickets'), value: fmtInt(tix), sub: t('subTickets'), cls: tix > 0 ? ' warn' : '' }
    ];
    $('kpis').innerHTML = cards.map(function (c) {
      return '<div class="kpi' + (c.cls || '') + '"><div class="kpi-label">' + esc(c.label) + '</div><div class="kpi-value">' + esc(c.value) +
        '</div><div class="kpi-sub' + (c.subClass || '') + '">' + esc(c.sub) + '</div></div>';
    }).join('');
  }

  function matches(c) {
    var q = filters.q.trim().toLowerCase();
    if (q) {
      var hay = [c.name, c.id, c.phone, c.email, c.city].join('\n').toLowerCase();
      var qd = q.replace(/\D/g, '');
      if (hay.indexOf(q) === -1 && !(qd && c.phone.replace(/\D/g, '').indexOf(qd) !== -1)) return false;
    }
    if (filters.risk === 'risk' && !isAtRisk(c)) return false;
    if (filters.risk === 'ok' && isAtRisk(c)) return false;
    if (filters.activity === 'active' && !isActive(c)) return false;
    if (filters.activity === 'inactive' && isActive(c)) return false;
    if (filters.tickets === 'with' && c.openTickets <= 0) return false;
    if (filters.tickets === 'without' && c.openTickets > 0) return false;
    if (filters.product !== 'all' && c.lastProduct !== filters.product) return false;
    return true;
  }
  function compare(a, b, key) {
    if (key === 'satisfaction' || key === 'openTickets' || key === 'totalPurchases') return (a[key] == null ? 99 : a[key]) - (b[key] == null ? 99 : b[key]);
    if (key === 'lastPurchaseDate') return a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
    if (key === 'lastProduct') return productLabel(a[key]).localeCompare(productLabel(b[key]), locale());
    return String(a[key]).localeCompare(String(b[key]), locale(), { numeric: true, sensitivity: 'base' });
  }
  function visibleRows() {
    var rows = customers.filter(matches);
    if (!sort.dir) return rows;
    var m = sort.dir === 'asc' ? 1 : -1;
    return rows.map(function (c, i) { return [c, i]; }).sort(function (x, y) {
      var r = compare(x[0], y[0], sort.key);
      return r === 0 ? x[1] - y[1] : r * m;
    }).map(function (p) { return p[0]; });
  }

  function renderHead() {
    var cols = FIELDS.slice();
    var numeric = { totalPurchases: 1, openTickets: 1 };
    $('thead').innerHTML = cols.map(function (k) {
      var active = sort.dir && sort.key === k;
      var arrow = active ? (sort.dir === 'asc' ? '▲' : '▼') : '';
      var label = t('col.' + k);
      return '<th class="' + (numeric[k] ? 'num' : '') + '" scope="col" aria-sort="' + (active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none') + '">' +
        '<button type="button" class="sort" data-sort="' + k + '" aria-label="' + esc(t('sortBy', { col: label })) + '">' + esc(label) +
        ' <span class="arrow" aria-hidden="true">' + arrow + '</span></button></th>';
    }).join('') + '<th class="plain" scope="col">' + esc(t('col.actions')) + '</th>';
  }

  function renderTable() {
    var rows = visibleRows();
    $('count').textContent = t('count', { n: fmtInt(rows.length), m: fmtInt(customers.length) });
    if (loading || loadError) {
      $('tbody').innerHTML = '<tr><td colspan="' + (FIELDS.length + 1) + '" class="empty">' +
        (loading ? '<strong>' + esc(t('loading')) + '</strong>'
                 : '<div class="load-error">' + esc(t('loadFailed', { msg: loadError })) + '</div><button type="button" class="btn" data-action="retry">' + esc(t('retry')) + '</button>') +
        '</td></tr>';
      return;
    }
    if (!rows.length) {
      var none = customers.length === 0;
      $('tbody').innerHTML = '<tr><td colspan="' + (FIELDS.length + 1) + '" class="empty"><strong>' + esc(none ? t('emptyAll') : t('emptyFilter')) + '</strong>' +
        esc(none ? t('emptyAllHint') : t('emptyFilterHint')) +
        (none ? '' : '<br><button type="button" class="btn" data-action="clear">' + esc(t('clearFilters')) + '</button>') + '</td></tr>';
      return;
    }
    $('tbody').innerHTML = rows.map(function (c) {
      var risk = isAtRisk(c), active = isActive(c);
      var dots = '';
      for (var i = 1; i <= 5; i++) dots += '<i class="' + (c.satisfaction != null && i <= c.satisfaction ? 'on' : '') + '"></i>';
      return '<tr class="' + (risk ? 'risk' : '') + '" data-id="' + esc(c.id) + '">' +
        '<td class="mono">' + esc(c.id) + '</td>' +
        '<td class="name">' + esc(c.name) + '</td>' +
        '<td class="nowrap"><bdi dir="ltr">' + esc(c.phone) + '</bdi></td>' +
        '<td><bdi dir="ltr">' + esc(c.email) + '</bdi></td>' +
        '<td class="nowrap">' + esc(c.city) + '</td>' +
        '<td class="nowrap">' + esc(fmtDate(c.lastPurchaseDate)) + (active ? '' : '<span class="tag">' + esc(t('inactive')) + '</span>') + '</td>' +
        '<td class="num nowrap">' + esc(fmtMoney(c.totalPurchases)) + '</td>' +
        '<td class="nowrap">' + esc(productLabel(c.lastProduct)) + '</td>' +
        '<td class="nowrap"><span class="sat"><b>' + (c.satisfaction == null ? '—' : c.satisfaction) + '</b><span class="dots" aria-hidden="true">' + dots + '</span></span>' +
          (risk ? '<span class="badge">' + esc(t('atRisk')) + '</span>' : '') + '</td>' +
        '<td class="num' + (c.openTickets > 0 ? ' tix-pos' : '') + '">' + esc(fmtInt(c.openTickets)) + '</td>' +
        '<td><div class="actions">' +
          '<button type="button" class="btn small" data-action="edit" aria-label="' + esc(t('editAria', { name: c.name })) + '">' + esc(t('edit')) + '</button>' +
          '<button type="button" class="btn small" data-action="delete" aria-label="' + esc(t('delAria', { name: c.name })) + '">' + esc(t('del')) + '</button>' +
        '</div></td></tr>';
    }).join('');
  }
  function renderFooter() {
    $('footer').innerHTML = esc(at ? t('footerAt') : t('footer')) + (storageOk || at ? '' : '<span class="warn-text">' + esc(t('storageOff')) + '</span>');
  }
  function renderMode() {
    var chip = $('modeChip');
    chip.textContent = at ? t('modeAt') : t('modeLocal');
    chip.classList.toggle('on', !!at);
    $('btnRefresh').hidden = !at;
    $('btnReset').hidden = !!at;
  }
  function renderAll() { renderMode(); renderKPIs(); renderHead(); renderTable(); renderFooter(); }

  /* ---------- Toasts ---------- */
  function toast(msg, isError) {
    var el = document.createElement('div');
    el.className = 'toast' + (isError ? ' error' : '');
    el.textContent = msg;
    $('toasts').appendChild(el);
    setTimeout(function () { el.remove(); }, 4000);
  }

  /* ---------- Airtable ---------- */
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function errMsg(err) {
    if (err && err.network) return t('atErrNetwork');
    if (err && (err.status === 401 || err.status === 403)) return t('atErrAuth');
    if (err && err.status === 404) return t('atErrNotFound');
    return (err && err.message) || t('atErrGeneric');
  }
  // The browser only talks to this site's own /api/customers. The server (vite.config.js) adds the Airtable token from .env.
  function atRequest(_unused, method, path, body) {
    return fetch('api/customers' + (path || ''), {
      method: method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      return r.text().then(function (txt) {
        var j = null;
        try { j = txt ? JSON.parse(txt) : null; } catch (x) { j = null; }
        if (!r.ok) {
          var m = j && j.error && (typeof j.error === 'string' ? j.error : (j.error.message || j.error.type));
          var e = new Error(m || ('HTTP ' + r.status)); e.status = r.status; throw e;
        }
        if (j === null) throw new Error('Unexpected response from the server');   // e.g. an HTML page instead of JSON
        return j;
      });
    }, function () { var e = new Error('network'); e.network = true; throw e; });
  }
  function fromRecord(rec) {
    var f = rec.fields || {};
    function str(v) { return v == null ? '' : String(v).trim(); }
    var sat = f.satisfaction, tix = parseInt(f.openTickets, 10), tp = Number(f.totalPurchases);
    return {
      id: str(f.id), name: str(f.name), phone: str(f.phone), email: str(f.email), city: str(f.city),
      lastPurchaseDate: parseISO(f.lastPurchaseDate) != null ? String(f.lastPurchaseDate) : '',
      totalPurchases: isFinite(tp) ? tp : 0,
      lastProduct: normalizeProduct(f.lastProduct) || '',
      satisfaction: (Number.isInteger(sat) && sat >= 1 && sat <= 5) ? sat : null,
      openTickets: tix > 0 ? tix : 0,
      _rid: rec.id
    };
  }
  function toFields(c) {
    return {
      name: c.name, id: c.id, phone: c.phone, email: c.email || null, city: c.city || null,
      lastPurchaseDate: c.lastPurchaseDate || null, totalPurchases: c.totalPurchases,
      lastProduct: c.lastProduct || null, satisfaction: c.satisfaction, openTickets: c.openTickets
    };
  }
  function atLoadAll(cfg) {
    var out = [];
    function page(offset) {
      return atRequest(cfg, 'GET', '?pageSize=100' + (offset ? '&offset=' + encodeURIComponent(offset) : '')).then(function (j) {
        (j.records || []).forEach(function (r) { out.push(fromRecord(r)); });
        return j.offset ? page(j.offset) : out;
      });
    }
    return page(null);
  }
  function batches(list) {
    var out = [];
    for (var i = 0; i < list.length; i += AT_BATCH) out.push(list.slice(i, i + AT_BATCH));
    return out;
  }
  function runBatches(list, fn) {          // sequential, with a pause to stay under Airtable's 5 requests/second limit
    var results = [];
    return batches(list).reduce(function (p, b, i) {
      return p.then(function () { return (i ? sleep(250) : null); }).then(function () { return fn(b); }).then(function (r) { results = results.concat(r); });
    }, Promise.resolve()).then(function () { return results; });
  }
  function atCreate(list) {
    return runBatches(list, function (b) {
      return atRequest(at, 'POST', '', { records: b.map(function (c) { return { fields: toFields(c) }; }) }).then(function (j) { return j.records; });
    });
  }
  function atPatch(records) {              // records: [{ id: recordId, fields: {...} }]
    return runBatches(records, function (b) { return atRequest(at, 'PATCH', '', { records: b }).then(function (j) { return j.records; }); });
  }
  function atUpdate(list) {
    return atPatch(list.map(function (c) { return { id: c._rid, fields: toFields(c) }; }));
  }
  function atDelete(rid) { return atRequest(at, 'DELETE', '/' + encodeURIComponent(rid)); }

  function withBusy(btn, promise) {
    btn.disabled = true; btn.setAttribute('aria-busy', 'true');
    function done() { btn.disabled = false; btn.removeAttribute('aria-busy'); }
    promise.then(done, done);
    return promise;
  }
  // Records created by hand in Airtable have no customer ID yet: give them one so they can be edited and merged.
  function fixMissingIds() {
    var missing = customers.filter(function (c) { return !c.id; });
    if (!missing.length) return Promise.resolve();
    missing.forEach(function (c) { c.id = nextId(); });
    return atPatch(missing.map(function (c) { return { id: c._rid, fields: { id: c.id } }; })).then(function () {
      toast(t('tIdsFixed', { n: fmtInt(missing.length) }));
    }, function (err) { toast(t('tSaveFail', { msg: errMsg(err) }), true); });
  }
  function atReload(announce) {
    loading = true; loadError = ''; renderAll();
    return atLoadAll(at).then(function (list) {
      customers = list; loading = false; renderAll();
      if (announce) toast(t('tRefreshed'));
      return fixMissingIds().then(renderAll);
    }, function (err) {
      loading = false; loadError = errMsg(err); renderAll();
    });
  }
  // Asks the server whether it has Airtable credentials (from .env). On a static host there is no server: answer is "no".
  function checkProxy() {
    var ctl = new AbortController();
    var timer = setTimeout(function () { ctl.abort(); }, 4000);
    return fetch('api/status', { signal: ctl.signal }).then(function (r) { return r.ok ? r.json() : {}; }).then(function (j) {
      clearTimeout(timer); return !!(j && j.configured === true);
    }, function () { clearTimeout(timer); return false; });
  }

  /* ---------- Dialogs ---------- */
  function backdropClose(dlg) {
    dlg.addEventListener('mousedown', function (e) { if (e.target === dlg) dlg.close(); });
  }
  function confirmDialog(opts) {
    return new Promise(function (resolve) {
      var dlg = $('dlgConfirm');
      $('confTitle').textContent = opts.title;
      $('confBody').textContent = opts.body;
      $('confOk').textContent = opts.okLabel;
      var done = false;
      function finish(v) { if (done) return; done = true; cleanup(); if (dlg.open) dlg.close(); resolve(v); }
      function ok() { finish(true); }
      function cancel() { finish(false); }
      function cleanup() {
        $('confOk').removeEventListener('click', ok);
        $('confCancel').removeEventListener('click', cancel);
        dlg.removeEventListener('close', cancel);
      }
      $('confOk').addEventListener('click', ok);
      $('confCancel').addEventListener('click', cancel);
      dlg.addEventListener('close', cancel);
      dlg.showModal();
      $('confCancel').focus();
    });
  }

  /* Add / edit */
  var FORM_FIELDS = ['name', 'phone', 'email', 'city', 'lastPurchaseDate', 'totalPurchases', 'lastProduct', 'satisfaction', 'openTickets'];
  function clearErrors() {
    FORM_FIELDS.forEach(function (f) {
      var e = $('e_' + f); if (e) e.textContent = '';
      $('f_' + f).removeAttribute('aria-invalid');
    });
  }
  function openCustomer(c) {
    editingId = c ? c.id : null;
    clearErrors();
    $('custTitle').textContent = t(c ? 'editTitle' : 'addTitle');
    $('idRow').hidden = !c;
    $('f_id').value = c ? c.id : '';
    FORM_FIELDS.forEach(function (f) {
      var v = c ? c[f] : (f === 'openTickets' ? 0 : '');
      $('f_' + f).value = v == null ? '' : String(v);
    });
    $('f_lastPurchaseDate').max = todayISO();
    $('dlgCustomer').showModal();
    $('f_name').focus();
  }
  function submitCustomer(e) {
    e.preventDefault();
    clearErrors();
    var raw = {};
    FORM_FIELDS.forEach(function (f) { raw[f] = $('f_' + f).value; });
    var res = validateCustomer(raw);
    var keys = Object.keys(res.errors);
    if (keys.length) {
      var first = null;
      FORM_FIELDS.forEach(function (f) {
        if (res.errors[f]) {
          $('e_' + f).textContent = t(res.errors[f]);
          $('f_' + f).setAttribute('aria-invalid', 'true');
          if (!first) first = $('f_' + f);
        }
      });
      if (first) first.focus();
      return;
    }
    var v = res.value;
    var existing = editingId ? customers.find(function (c) { return c.id === editingId; }) : null;
    v.id = editingId || nextId();
    function commit() {
      if (editingId) {
        var idx = customers.indexOf(existing);
        if (idx !== -1) customers[idx] = v;
        toast(t('tUpdated'));
      } else {
        customers.push(v);
        toast(t('tAdded'));
      }
      persist();
      $('dlgCustomer').close();
      renderAll();
    }
    if (!at) { commit(); return; }
    var job = existing
      ? (v._rid = existing._rid, atUpdate([v]))
      : atCreate([v]).then(function (recs) { v._rid = recs[0].id; });
    withBusy($('custSubmit'), job).then(commit, function (err) { toast(t('tSaveFail', { msg: errMsg(err) }), true); });
  }

  /* Delete */
  function deleteCustomer(id) {
    var c = customers.find(function (x) { return x.id === id; });
    if (!c) return;
    confirmDialog({ title: t('delTitle'), body: t('delBody', { name: c.name }), okLabel: t('delOk') }).then(function (yes) {
      if (!yes) return;
      function done() { customers = customers.filter(function (x) { return x !== c; }); persist(); renderAll(); toast(t('tDeleted')); }
      if (!at) { done(); return; }
      atDelete(c._rid).then(done, function (err) { toast(t('tSaveFail', { msg: errMsg(err) }), true); });
    });
  }

  /* Reset */
  function resetData() {
    confirmDialog({ title: t('resetTitle'), body: t('resetBody'), okLabel: t('resetOk') }).then(function (yes) {
      if (!yes) return;
      customers = mockCustomers();
      persist(); renderAll(); toast(t('tReset'));
    });
  }

  /* ---------- Import / export ---------- */
  function exportCSV() {
    var csv = '﻿' + toCSV(customers);
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'customers-' + todayISO() + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    toast(t('tExported', { n: fmtInt(customers.length) }));
  }

  function showImportDialog(title, bodyHtml, canConfirm) {
    $('impTitle').textContent = title;
    $('impBody').innerHTML = bodyHtml;
    $('impOk').hidden = !canConfirm;
    $('impCancel').textContent = canConfirm ? t('cancel') : t('close');
    var dlg = $('dlgImport');
    if (!dlg.open) dlg.showModal();
  }

  function analyzeImport(text) {
    var rows = parseCSV(text);
    while (rows.length && rows[rows.length - 1].every(function (x) { return x.trim() === ''; })) rows.pop();
    if (!rows.length) return { fatal: t('emptyFile') };
    var headers = rows[0].map(function (h) { return h.replace(/^﻿/, '').trim().toLowerCase(); });
    var colOf = {}, missing = [];
    FIELDS.forEach(function (f) {
      var i = headers.indexOf(f.toLowerCase());
      if (i === -1) missing.push(f); else colOf[f] = i;
    });
    if (missing.length) return { fatal: t('missingHeaders', { list: missing.join(', ') }) };

    var existing = {};
    customers.forEach(function (c) { existing[c.id] = true; });
    var seen = {}, adds = [], updates = [], rejected = [];
    for (var r = 1; r < rows.length; r++) {
      var rec = rows[r];
      if (rec.every(function (x) { return x.trim() === ''; })) continue;
      var rowNo = r + 1;                                    // header is row 1, as in a spreadsheet
      var raw = {};
      FIELDS.forEach(function (f) { raw[f] = unguard(String(rec[colOf[f]] == null ? '' : rec[colOf[f]])); });
      var res = validateCustomer(raw, { checkId: true });
      var reasons = Object.keys(res.errors).map(function (f) { return t('col.' + f) + ': ' + t(res.errors[f]); });
      var id = res.value.id;
      if (!reasons.length && id) {
        if (seen[id]) reasons.push(t('dupInFile', { row: seen[id] }));
        else seen[id] = rowNo;
      }
      if (reasons.length) { rejected.push({ row: rowNo, reasons: reasons }); continue; }
      if (id && existing[id]) updates.push(res.value); else adds.push(res.value);
    }
    return { adds: adds, updates: updates, rejected: rejected };
  }

  function list(items) { return '<ul class="summary-list">' + items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>'; }

  function handleImportFile(file) {
    var reader = new FileReader();
    reader.onerror = function () { toast(t('readErr'), true); };
    reader.onload = function () {
      var res = analyzeImport(String(reader.result));
      pendingImport = null;
      if (res.fatal) { showImportDialog(t('impFailTitle'), '<p>' + esc(res.fatal) + '</p>', false); return; }
      var html = '<div class="summary-block"><h3>' + esc(t('impNew', { n: fmtInt(res.adds.length) })) + '</h3></div>' +
        '<div class="summary-block"><h3>' + esc(t('impUpd', { n: fmtInt(res.updates.length) })) + '</h3>' +
        (res.updates.length ? '<div class="hint">' + esc(t('impUpdList')) + '</div>' + list(res.updates.map(function (c) { return '<bdi dir="ltr">' + esc(c.id) + '</bdi> — ' + esc(c.name); })) : '') + '</div>' +
        '<div class="summary-block' + (res.rejected.length ? ' bad' : '') + '"><h3>' + esc(t('impRej', { n: fmtInt(res.rejected.length) })) + '</h3>' +
        (res.rejected.length ? '<div class="hint">' + esc(t('impRejList')) + '</div>' + list(res.rejected.map(function (x) { return '<strong>' + esc(t('row', { n: x.row })) + '</strong>: ' + esc(x.reasons.join('; ')); })) : '') + '</div>';
      var can = res.adds.length + res.updates.length > 0;
      if (!can) html += '<p>' + esc(t('impNothing')) + '</p>';
      pendingImport = can ? res : null;
      showImportDialog(t('impTitle'), html, can);
    };
    reader.readAsText(file, 'UTF-8');
  }

  function applyImport() {
    var res = pendingImport;
    if (!res) return;
    var existingById = {};
    customers.forEach(function (c) { existingById[c.id] = c; });
    res.updates.forEach(function (c) { if (existingById[c.id]) c._rid = existingById[c.id]._rid; });
    var taken = res.adds.map(function (c) { return c.id; }).filter(Boolean);
    res.adds.forEach(function (c) { if (!c.id) { c.id = nextId(taken); taken.push(c.id); } });
    function commit() {
      var byId = {};
      res.updates.forEach(function (c) { byId[c.id] = c; });
      customers = customers.map(function (c) { return byId[c.id] ? byId[c.id] : c; });
      res.adds.forEach(function (c) { customers.push(c); });
      persist();
      $('dlgImport').close();
      renderAll();
      toast(t('tImported', { a: fmtInt(res.adds.length), u: fmtInt(res.updates.length), r: fmtInt(res.rejected.length) }));
      pendingImport = null;
    }
    if (!at) { commit(); return; }
    var job = atUpdate(res.updates).then(function () { return atCreate(res.adds); }).then(function (recs) {
      res.adds.forEach(function (c, i) { c._rid = recs[i].id; });
    });
    withBusy($('impOk'), job).then(commit, function (err) {
      toast(t('tSaveFail', { msg: errMsg(err) }), true);
      pendingImport = null; $('dlgImport').close();
      atReload(false);               // some batches may have been written: resync with Airtable
    });
  }

  /* ---------- Events ---------- */
  function setLang(l) {
    lang = l;
    try { localStorage.setItem(LANG_KEY, l); } catch (e) { /* ignore */ }
    applyLang();
  }
  function clearFilters() {
    filters = { q: '', risk: 'all', activity: 'all', tickets: 'all', product: 'all' };
    $('q').value = '';
    $('fRisk').value = 'all'; $('fActivity').value = 'all'; $('fTickets').value = 'all'; $('fProduct').value = 'all';
    renderTable();
  }

  function init() {
    try { var l = localStorage.getItem(LANG_KEY); if (l === 'he' || l === 'en') lang = l; } catch (e) { storageOk = false; }
    try { localStorage.setItem('crd.probe', '1'); localStorage.removeItem('crd.probe'); } catch (e) { storageOk = false; }
    customers = [];

    $('langHe').addEventListener('click', function () { setLang('he'); });
    $('langEn').addEventListener('click', function () { setLang('en'); });
    $('btnReset').addEventListener('click', resetData);
    $('btnRefresh').addEventListener('click', function () { withBusy($('btnRefresh'), atReload(true)); });
    $('btnAdd').addEventListener('click', function () { openCustomer(null); });
    $('btnExport').addEventListener('click', exportCSV);
    $('btnImport').addEventListener('click', function () { $('fileInput').click(); });
    $('btnClear').addEventListener('click', clearFilters);
    $('fileInput').addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (f) handleImportFile(f);
      e.target.value = '';
    });

    $('q').addEventListener('input', function (e) { filters.q = e.target.value; renderTable(); });
    [['fRisk', 'risk'], ['fActivity', 'activity'], ['fTickets', 'tickets'], ['fProduct', 'product']].forEach(function (p) {
      $(p[0]).addEventListener('change', function (e) { filters[p[1]] = e.target.value; renderTable(); });
    });

    $('thead').addEventListener('click', function (e) {
      var b = e.target.closest('[data-sort]');
      if (!b) return;
      var k = b.getAttribute('data-sort');
      if (sort.key !== k || !sort.dir) sort = { key: k, dir: 'asc' };
      else if (sort.dir === 'asc') sort.dir = 'desc';
      else sort = { key: k, dir: null };
      renderHead(); renderTable();
      var again = document.querySelector('[data-sort="' + k + '"]'); if (again) again.focus();
    });
    $('tbody').addEventListener('click', function (e) {
      var b = e.target.closest('[data-action]');
      if (!b) return;
      var action = b.getAttribute('data-action');
      if (action === 'clear') { clearFilters(); return; }
      if (action === 'retry') { atReload(false); return; }
      var tr = b.closest('tr'); var id = tr && tr.getAttribute('data-id');
      var c = customers.find(function (x) { return x.id === id; });
      if (!c) return;
      if (action === 'edit') openCustomer(c);
      if (action === 'delete') deleteCustomer(id);
    });

    $('custForm').addEventListener('submit', submitCustomer);
    $('custCancel').addEventListener('click', function () { $('dlgCustomer').close(); });
    $('impCancel').addEventListener('click', function () { pendingImport = null; $('dlgImport').close(); });
    $('impOk').addEventListener('click', applyImport);
    $('dlgImport').addEventListener('close', function () { pendingImport = null; });
    ['dlgCustomer', 'dlgConfirm', 'dlgImport'].forEach(function (id) { backdropClose($(id)); });

    applyLang();                         // shows "Loading..." until we know where the data comes from
    checkProxy().then(function (connected) {
      if (connected) { at = { proxy: true }; return atReload(false); }
      loading = false;
      customers = loadCustomers();       // no server access to Airtable: local sample data
      if (storageOk) persist();
      renderAll();
    });
  }

  init();
})();
