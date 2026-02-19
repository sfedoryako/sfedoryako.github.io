async function injectPartial(selector, path) {
  const target = document.querySelector(selector);
  if (!target) return;
  const response = await fetch(path);
  if (!response.ok) return;
  target.innerHTML = await response.text();
}

function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.site-nav a').forEach((link) => {
    const href = link.getAttribute('href');
    if ((path === '/' && href === '/') || (path.startsWith(href) && href !== '/')) link.classList.add('active');
  });
}

function bindMenu() {
  const btn = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));
  });
}

function bindShrinkHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const handler = () => header.classList.toggle('is-shrink', window.scrollY > 24);
  handler();
  window.addEventListener('scroll', handler, { passive: true });
}

function initReveal() {
  const targets = document.querySelectorAll('.story, .card, .panel, .timeline article, .acc-item');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  targets.forEach((el) => {
    if (el.classList.contains('hero')) return;
    el.classList.add('reveal');
    observer.observe(el);
  });
}

function renderCaseCard(item) {
  return `<article class="card"><h3>${item.title}</h3><p>${item.teaser}</p><p><strong>${item.metric}</strong></p><a class="btn-secondary" href="${item.detailsLink}">Read case</a></article>`;
}

function initCasesFromSource() {
  const data = window.CASES_DATA || [];
  const home = document.querySelector('#homepage-cases');
  if (home) home.innerHTML = data.slice(0, 3).map(renderCaseCard).join('');
  const list = document.querySelector('#cases-page-list');
  if (list) list.innerHTML = data.map(renderCaseCard).join('');
}

function money(value) { return `${Math.round(value).toLocaleString('ru-RU')} ₽`; }

function setCalcConditionalFields(form) {
  const op = form.querySelector('#calc-operation');
  const fertType = form.querySelector('#calc-fert-type');
  const rate = form.querySelector('#calc-rate');
  const fertWrap = form.querySelector('#fert-type-wrap');
  const rateWrap = form.querySelector('#rate-wrap');
  if (!op || !fertType || !rate || !fertWrap || !rateWrap) return;

  const update = () => {
    const isFert = op.value === 'fertilizing';
    fertWrap.style.display = isFert ? '' : 'none';
    fertType.required = isFert;
    if (!isFert) fertType.value = '';

    const showRate = isFert && fertType.value;
    rateWrap.style.display = showRate ? '' : 'none';
    rate.required = showRate;
    if (!showRate) rate.value = '';
  };

  op.addEventListener('change', update);
  fertType.addEventListener('change', update);
  update();
}

function initCalculator() {
  const form = document.querySelector('#payback-form');
  if (!form) return;
  setCalcConditionalFields(form);

  const cropK = { wheat: 1, barley: 0.95, corn: 1.25, sunflower: 1.18, rapeseed: 1.28, soy: 1.08, sugarbeet: 1.34 };
  const opK = { sowing: 0.92, fertilizing: 1.14, spraying: 1.11 };
  const fertK = { nitrogen: 1.05, phosphorus: 1.02, potassium: 1.0, complex: 1.1, '': 1 };

  const out = {
    fert: document.querySelector('#out-fert'), chem: document.querySelector('#out-chem'), fuel: document.querySelector('#out-fuel'),
    total: document.querySelector('#out-total'), roi: document.querySelector('#out-roi'), payback: document.querySelector('#out-payback')
  };

  form.addEventListener('submit', (e) => {
    const area = Number(form.area.value);
    const capture = Number(form.capture.value);
    const crop = form.crop.value;
    const operation = form.operation.value;
    const fertType = form.fertType ? form.fertType.value : '';
    const rate = Number(form.rate?.value || 0);

    if (!area || !capture || !crop || !operation) {
      e.preventDefault();
      return;
    }

    const base = area * cropK[crop] * opK[operation] * Math.max(0.8, Math.min(1.3, capture / 12));
    const fertSaving = operation === 'fertilizing' ? base * rate * 115 * fertK[fertType] : 0;
    const chemSaving = operation === 'spraying' ? base * 160 : 0;
    const fuelSaving = base * 290;
    const total = fertSaving + chemSaving + fuelSaving;
    const investment = 4200000;
    const roi = ((total - investment) / investment) * 100;
    const payback = (investment / Math.max(total, 1)) * 12;

    out.fert.textContent = money(fertSaving);
    out.chem.textContent = money(chemSaving);
    out.fuel.textContent = money(fuelSaving);
    out.total.textContent = money(total);
    out.roi.textContent = `${roi.toFixed(1)} %`;
    out.payback.textContent = `${payback.toFixed(1)} мес.`;

    form.querySelector('[name="calc_total"]').value = Math.round(total);
    form.querySelector('[name="calc_roi"]').value = roi.toFixed(1);
    form.querySelector('[name="calc_payback"]').value = payback.toFixed(1);
  });
}

function initQuiz() {
  const form = document.querySelector('#quiz-form');
  if (!form) return;
  const allSteps = Array.from(form.querySelectorAll('.quiz-step'));
  const prevBtn = form.querySelector('#quiz-prev');
  const nextBtn = form.querySelector('#quiz-next');
  const submitBtn = form.querySelector('#quiz-submit');
  const bar = form.querySelector('#quiz-progress-bar');
  const opField = form.querySelector('[name="quiz_operation"]');
  let current = 0;

  const visibleSteps = () => {
    const op = opField?.value;
    return allSteps.filter((step) => !(step.dataset.conditional === 'fert' && op === 'sowing'));
  };

  const render = () => {
    const steps = visibleSteps();
    if (current >= steps.length) current = steps.length - 1;
    allSteps.forEach((s) => s.classList.remove('active'));
    steps[current]?.classList.add('active');
    bar.style.width = `${((current + 1) / steps.length) * 100}%`;
    prevBtn.style.display = current === 0 ? 'none' : 'inline-flex';
    nextBtn.style.display = current === steps.length - 1 ? 'none' : 'inline-flex';
    submitBtn.style.display = current === steps.length - 1 ? 'inline-flex' : 'none';
  };

  prevBtn.addEventListener('click', () => { current = Math.max(0, current - 1); render(); });
  nextBtn.addEventListener('click', () => {
    const steps = visibleSteps();
    const activeInput = steps[current]?.querySelector('input,select,textarea');
    if (activeInput && !activeInput.checkValidity()) return activeInput.reportValidity();
    current = Math.min(steps.length - 1, current + 1);
    render();
  });
  opField?.addEventListener('change', () => render());
  render();
}

function initAjaxForms() {
  document.querySelectorAll('form[data-ajax-form="true"]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.checkValidity()) return form.reportValidity();
      const status = form.querySelector('.form-status');
      try {
        const response = await fetch(form.action, { method: form.method || 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error();
        if (status) { status.textContent = 'Форма отправлена. Мы свяжемся с вами в рабочее время.'; status.className = 'form-status success'; }
        form.reset();
        if (form.id === 'quiz-form') initQuiz();
      } catch {
        if (status) { status.textContent = 'Ошибка отправки. Проверьте Formspree endpoint.'; status.className = 'form-status error'; }
      }
    });
  });
}

(async function init() {
  await injectPartial('[data-include="header"]', '/partials/header.html');
  await injectPartial('[data-include="footer"]', '/partials/footer.html');
  setActiveNav();
  bindMenu();
  bindShrinkHeader();
  initReveal();
  initCasesFromSource();
  initCalculator();
  initQuiz();
  initAjaxForms();
})();
