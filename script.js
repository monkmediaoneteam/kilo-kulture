const $ = (s, r = document) => r.querySelector(s);

// Typical garment weights in grams. Approximate, shown as such on the page.
const GARMENTS = [
  ['Kids T-shirt', 110], ['T-shirt', 180], ['Shirt', 250], ['Kurti', 300], ['Dress', 400],
  ['Kids jeans', 350], ['Trousers', 450], ['Sweatshirt', 550], ['Jeans', 650], ['Jacket', 800],
];
const qty = Object.fromEntries(GARMENTS.map(([n]) => [n, 0]));

$('#items').innerHTML = GARMENTS.map(([n, g]) => `
  <li><span>${n}</span><span class="g">${g} g</span>
    <span class="step" data-n="${n}"><button type="button" aria-label="Remove one ${n}" data-d="-1">&minus;</button><output>0</output><button type="button" aria-label="Add one ${n}" data-d="1">+</button></span>
  </li>`).join('');

const fmt = g => (g / 1000).toFixed(2) + ' kg';

function render() {
  let grams = 0, pieces = 0;
  const lines = [];
  GARMENTS.forEach(([n, g]) => {
    const q = qty[n];
    if (!q) return;
    grams += q * g; pieces += q;
    lines.push(`<li><span>${n} x ${q}</span><span>${fmt(q * g)}</span></li>`);
  });
  document.querySelectorAll('.step').forEach(s => s.querySelector('output').textContent = qty[s.dataset.n]);
  $('#lines').innerHTML = lines.join('') || '<li class="empty"><span>Add a piece to begin</span></li>';
  $('#count').textContent = pieces + (pieces === 1 ? ' piece' : ' pieces');
  $('#kg').textContent = fmt(grams);
  $('#avg').textContent = pieces ? Math.round(grams / pieces) + ' g' : '0 g';
  const rate = parseFloat($('#rate').value);
  $('#amt').textContent = rate > 0 && grams ? '₹' + Math.round(grams / 1000 * rate).toLocaleString('en-IN') : (rate > 0 ? '₹0' : 'Enter a rate');
}

$('#items').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const n = b.closest('.step').dataset.n;
  qty[n] = Math.max(0, qty[n] + Number(b.dataset.d));
  render();
});
$('#rate').addEventListener('input', render);
$('#reset').addEventListener('click', () => { GARMENTS.forEach(([n]) => qty[n] = 0); render(); });
render();

// nav
const nav = $('#nav'), tog = $('.nav__toggle');
tog.addEventListener('click', () => { const o = nav.classList.toggle('open'); tog.setAttribute('aria-expanded', o); });
nav.querySelectorAll('.nav__links a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); tog.setAttribute('aria-expanded', false); }));
$('#yr').textContent = new Date().getFullYear();

// hero model switcher with automatic change
const heroModels = document.querySelectorAll('.hero__model');
const heroCapsules = document.querySelectorAll('.hero__capsule-item');
const heroStage = document.querySelector('.hero__stage');

const MODEL_DATA = {
  women: { label: 'Women', img: 'assets/thumb-women.jpg' },
  men: { label: 'Men', img: 'assets/thumb-men.jpg' },
  children: { label: 'Children', img: 'assets/thumb-kids.jpg' }
};

const MODEL_ORDER = ['women', 'men', 'children'];
let currentModelIndex = 0;
let autoCycleTimer = null;

function switchHeroModel(gender) {
  currentModelIndex = MODEL_ORDER.indexOf(gender);
  if (currentModelIndex === -1) currentModelIndex = 0;
  
  heroModels.forEach(m => {
    m.classList.toggle('is-active', m.dataset.gender === gender);
  });
  const others = Object.keys(MODEL_DATA).filter(k => k !== gender);
  heroCapsules.forEach((b, idx) => {
    const key = others[idx];
    if (key) {
      b.dataset.switch = key;
      b.title = `Switch to ${MODEL_DATA[key].label}`;
      const img = b.querySelector('.hero__capsule-pic');
      if (img) img.src = MODEL_DATA[key].img;
    }
  });
}

function startAutoCycle() {
  stopAutoCycle();
  autoCycleTimer = setInterval(() => {
    currentModelIndex = (currentModelIndex + 1) % MODEL_ORDER.length;
    switchHeroModel(MODEL_ORDER[currentModelIndex]);
  }, 3600); // Automatically changes picture every 3.6 seconds
}

function stopAutoCycle() {
  if (autoCycleTimer) {
    clearInterval(autoCycleTimer);
    autoCycleTimer = null;
  }
}

heroCapsules.forEach(capsule => {
  capsule.addEventListener('click', () => {
    switchHeroModel(capsule.dataset.switch);
    startAutoCycle(); // Reset timer after manual click
  });
});

if (heroStage) {
  heroStage.addEventListener('mouseenter', stopAutoCycle);
  heroStage.addEventListener('mouseleave', startAutoCycle);
}

// Start auto cycle immediately
startAutoCycle();

// lookbook filter
const lookbookCats = document.querySelectorAll('.lookbook__cat');
const lookbookCards = document.querySelectorAll('.lookbook__card');
const lookbookEmpty = document.getElementById('lookbookEmpty');

lookbookCats.forEach(btn => {
  btn.addEventListener('click', () => {
    lookbookCats.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const filter = btn.dataset.filter;
    let visibleCount = 0;
    lookbookCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      if (match) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });
    if (lookbookEmpty) {
      lookbookEmpty.hidden = visibleCount > 0;
    }
  });
});

// reveal
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
document.querySelectorAll('.ledger li,.w li,.tbl tbody tr,.idea__t p,.lookbook__hero-card,.lookbook__card,.faq__media').forEach((el, i) => { el.classList.add('rv'); el.style.transitionDelay = (i % 6) * 50 + 'ms'; io.observe(el); });
