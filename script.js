// ---------- Dark / light toggle (remembers choice, otherwise follows device) ----------
(function(){
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const isDark = () => root.getAttribute('data-theme') === 'dark';
  // Moon icon sa light mode, sun icon sa dark mode (CSS ang nagpapalit ng icon)
  function sync(){
    btn.setAttribute('aria-pressed', isDark());
    btn.setAttribute('aria-label', isDark() ? 'Switch to light mode' : 'Switch to dark mode');
  }
  sync();
  btn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    sync();
  });
})();

// ---------- Burger menu (phones) ----------
(function(){
  const nav = document.querySelector('nav');
  const links = nav && nav.querySelector('.links');
  if (!nav || !links) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'menu-toggle';
  btn.setAttribute('aria-label', 'Open menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<svg class="i-burger" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
                + '<svg class="i-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  nav.appendChild(btn);
  function setOpen(open){
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  btn.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  links.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 760) setOpen(false); });
})();

// ---------- Project search + filters (projects.html) ----------
const search = document.getElementById('search');
const selects = document.querySelectorAll('.filters select');
// Auto-add any category / technology / year / type found in the projects (so new projects show up in the filters)
selects.forEach(sel => {
  const have = new Set([...sel.options].map(o => o.value || o.text));
  const found = [...document.querySelectorAll('.prow')].map(p => p.dataset[sel.dataset.key]).filter(Boolean);
  [...new Set(found)].sort().forEach(v => { if (!have.has(v)) sel.add(new Option(v, v)); });
});
function applyFilters(){
  const q = search ? search.value.toLowerCase() : '';
  let shown = 0;
  document.querySelectorAll('.prow').forEach(p => {
    const okText = p.innerText.toLowerCase().includes(q);
    const okSel = [...selects].every(s => !s.value || s.value.startsWith('All') || p.dataset[s.dataset.key] === s.value);
    const show = okText && okSel;
    p.style.display = show ? '' : 'none';
    if (show) shown++;
  });
  const empty = document.getElementById('empty');
  if (empty) empty.style.display = shown ? 'none' : 'block';
}
if (search) search.addEventListener('input', applyFilters);
selects.forEach(s => s.addEventListener('change', applyFilters));

// ---------- Contact form: Send Message opens Gmail compose, already filled in (contact.html) ----------
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target.elements;
    const to = 'maiguemarjorie03@gmail.com';
    const subject = f.subject.value;
    const body = `From: ${f.name.value} (${f.email.value})\n\n${f.message.value}`;
    const gmail = 'https://mail.google.com/mail/?view=cm&fs=1'
      + '&to=' + encodeURIComponent(to)
      + '&su=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(body);
    const win = window.open(gmail, '_blank');
    // Kung na-block ang popup, gamitin ang default email app
    if (!win) location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

// ---------- "View Details" popup (projects.html) ----------
const dlg = document.getElementById('detailsModal');
const box = dlg ? dlg.querySelector('.modal-box') : null;
function closeModal(){ dlg.classList.remove('open'); dlg.setAttribute('aria-hidden','true'); }
if (dlg) {
  document.getElementById('dClose').addEventListener('click', closeModal);
  dlg.addEventListener('click', e => { if (e.target === dlg) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}
document.querySelectorAll('[data-details]').forEach(b => b.addEventListener('click', () => {
  const row = b.closest('.prow');
  document.getElementById('dImg').src = row.querySelector('img').src;
  document.getElementById('dTitle').textContent = row.querySelector('h4').textContent;
  document.getElementById('dMeta').textContent = row.querySelector('small').textContent;
  document.getElementById('dDesc').textContent = row.querySelector('.right p').textContent;
  document.getElementById('dTag').textContent = row.querySelector('.gimp').textContent;
  // MM Logo: ipakita lahat ng logo versions (Badge, Vertical, Horizontal, Icon)
  const g = document.getElementById('dGallery'), big = document.getElementById('dImg');
  g.innerHTML = '';
  if (row.dataset.gallery) {
    JSON.parse(row.dataset.gallery).forEach(it => {
      const fig = document.createElement('figure');
      fig.innerHTML = `<img src="${it.src}" alt="${it.label}"><figcaption>${it.label}</figcaption>`;
      g.appendChild(fig);
    });
    big.style.display = 'none'; g.style.display = 'grid'; box.classList.add('wide');
    g.classList.toggle('single', JSON.parse(row.dataset.gallery).length === 1);
  } else {
    big.style.display = ''; g.style.display = 'none'; box.classList.remove('wide');
  }
  dlg.classList.add('open'); dlg.setAttribute('aria-hidden','false');
}));
