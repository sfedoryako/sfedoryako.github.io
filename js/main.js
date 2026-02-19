async function loadComponent(selector, path) {
  const target = document.querySelector(selector);
  if (!target) return;
  try {
    const res = await fetch(path);
    target.innerHTML = await res.text();
  } catch (e) {
    console.warn(`Failed to load ${path}`, e);
  }
}

function initMobileMenu() {
  const btn = document.getElementById('burgerBtn');
  const nav = document.getElementById('mainNav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });
}

function initCatalogFilter() {
  const filter = document.getElementById('catalogFilter');
  const cards = document.querySelectorAll('[data-category]');
  if (!filter || !cards.length) return;
  filter.addEventListener('change', () => {
    const value = filter.value;
    cards.forEach((card) => {
      card.style.display = value === 'all' || card.dataset.category === value ? 'block' : 'none';
    });
  });
}

function initCalc() {
  const form = document.getElementById('economyCalc');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const area = Number(form.area.value) || 0;
    const width = Number(form.width.value) || 0;
    const workType = form.work.value;

    const fuelSavePerHa = workType === 'spray' ? 1.2 : workType === 'fert' ? 1.6 : 1.4;
    const chemSavePct = workType === 'spray' ? 0.15 : workType === 'fert' ? 0.12 : 0.08;
    const speedFactor = Math.max(1, width / 24);

    const fuel = Math.round(area * fuelSavePerHa * speedFactor);
    const chem = Math.round(area * 1800 * chemSavePct);
    const total = fuel * 72 + chem;
    const payback = Math.max(4, Math.round(950000 / (total / 12)));

    document.getElementById('calcResult').innerHTML = `
      <div class="card">
        <h3>Предварительный экономический эффект</h3>
        <p>Экономия ГСМ: <strong>${fuel.toLocaleString('ru-RU')} л/сезон</strong></p>
        <p>Экономия СЗР/удобрений: <strong>${chem.toLocaleString('ru-RU')} ₽/сезон</strong></p>
        <p>Оценочная окупаемость: <strong>${payback} месяцев</strong></p>
        <a class="btn btn-accent" href="/contact/index.html">Получить точный расчёт</a>
      </div>`;
  });
}

(async function bootstrap() {
  await loadComponent('#headerComponent', '/components/header.html');
  await loadComponent('#footerComponent', '/components/footer.html');
  initMobileMenu();
  initCatalogFilter();
  initCalc();
})();
