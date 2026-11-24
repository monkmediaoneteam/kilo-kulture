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

// reveal
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
document.querySelectorAll('.ledger li,.w li,.tbl tbody tr,.idea__t p').forEach((el, i) => { el.classList.add('rv'); el.style.transitionDelay = (i % 5) * 60 + 'ms'; io.observe(el); });
