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
    if ((path === '/' && href === '/') || (href !== '/' && path.startsWith(href))) link.classList.add('active');
  });
}

function bindMenu() {
  const button = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (!button || !nav) return;

  button.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
    });
  });
}

function bindShrinkHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const update = () => header.classList.toggle('is-shrink', window.scrollY > 24);
  update();
  window.addEventListener('scroll', update, { passive: true });
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
  return `<article class="card"><h3>${item.title}</h3><p>${item.teaser}</p><p><strong>${item.metric}</strong></p><a class="btn-secondary" href="/cases/">Читать кейс</a></article>`;
}

function renderCaseDetailed(item) {
  return `<article class="acc-item open"><button class="acc-trigger" type="button">${item.title}</button><div class="acc-content">
  <p><strong>1. О хозяйстве:</strong> ${item.farm}</p>
  <p><strong>2. Исходные данные:</strong> ${item.baseline}</p>
  <p><strong>3. Проблема:</strong> ${item.problem}</p>
  <p><strong>4. Аудит:</strong> ${item.audit}</p>
  <p><strong>5. Подбор решения:</strong> ${item.selection}</p>
  <p><strong>6. Внедрение:</strong> ${item.implementation}</p>
  <p><strong>7. Сложности:</strong> ${item.challenges}</p>
  <p><strong>8. Экономика:</strong> ${item.economics}</p>
  <p><strong>9. Результат:</strong> ${item.result}</p>
  <p><strong>10. Изменения в управлении:</strong> ${item.managementChange}</p>
  <p><strong>Ключевая метрика:</strong> ${item.metric}</p>
  </div></article>`;
}

function initCasesFromSource() {
  const data = window.CASES_DATA || [];
  const home = document.querySelector('#homepage-cases');
  if (home) home.innerHTML = data.slice(0, 3).map(renderCaseCard).join('');

  const list = document.querySelector('#cases-page-list');
  if (list) list.innerHTML = data.map(renderCaseDetailed).join('');
}

function initAccordion() {
  document.querySelectorAll('.acc-item').forEach((item) => {
    const trigger = item.querySelector('.acc-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', () => item.classList.toggle('open'));
  });
}

function money(value) { return `${Math.round(value).toLocaleString('ru-RU')} ₽`; }

function initCalculator() {
  const form = document.querySelector('#payback-form');
  if (!form) return;

  const op = form.querySelector('#calc-operation');
  const fertType = form.querySelector('#calc-fert-type');
  const rate = form.querySelector('#calc-rate');
  const fertWrap = form.querySelector('#fert-type-wrap');
  const rateWrap = form.querySelector('#rate-wrap');

  const updateFields = () => {
    const isFertilizing = op.value === 'fertilizing';
    fertWrap.style.display = isFertilizing ? '' : 'none';
    fertType.required = isFertilizing;
    if (!isFertilizing) fertType.value = '';

    const showRate = isFertilizing && !!fertType.value;
    rateWrap.style.display = showRate ? '' : 'none';
    rate.required = showRate;
    if (!showRate) rate.value = '';
  };

  op.addEventListener('change', updateFields);
  fertType.addEventListener('change', updateFields);
  updateFields();

  const cropK = { wheat: 1, barley: 0.95, corn: 1.25, sunflower: 1.18, rapeseed: 1.28, soy: 1.08, sugarbeet: 1.34, pea: 1.02, oat: 0.9, rye: 0.92, flax: 1.12, rice: 1.3 };
  const opK = { sowing: 0.92, fertilizing: 1.14, spraying: 1.11 };
  const fertK = { nitrogen: 1.05, phosphorus: 1.02, potassium: 1.0, complex: 1.1, '': 1 };

  const out = {
    fert: document.querySelector('#out-fert'),
    chem: document.querySelector('#out-chem'),
    fuel: document.querySelector('#out-fuel'),
    total: document.querySelector('#out-total'),
    roi: document.querySelector('#out-roi'),
    payback: document.querySelector('#out-payback')
  };

  form.addEventListener('submit', (event) => {
    const area = Number(form.area.value);
    const capture = Number(form.capture.value);
    const crop = form.crop.value;
    const operation = form.operation.value;
    const fertilizer = form.fertType.value;
    const appRate = Number(form.rate.value || 0);

    if (!area || !capture || !crop || !operation) {
      event.preventDefault();
      return;
    }

    const base = area * cropK[crop] * opK[operation] * Math.max(0.8, Math.min(1.3, capture / 12));
    const fertSaving = operation === 'fertilizing' ? base * appRate * 115 * fertK[fertilizer] : 0;
    const chemSaving = operation === 'spraying' ? base * 160 : 0;
    const fuelPrice = Number(form.fuelPrice?.value || 68);
    const fuelSaving = base * 4.3 * fuelPrice;
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
  const prev = form.querySelector('#quiz-prev');
  const next = form.querySelector('#quiz-next');
  const submit = form.querySelector('#quiz-submit');
  const bar = form.querySelector('#quiz-progress-bar');
  const operation = form.querySelector('[name="quiz_operation"]');
  let current = 0;

  const visibleSteps = () => {
    const opValue = operation.value;
    return allSteps.filter((step) => !(step.dataset.conditional === 'fert' && opValue === 'sowing'));
  };

  const render = () => {
    const steps = visibleSteps();
    if (current >= steps.length) current = steps.length - 1;
    allSteps.forEach((s) => s.classList.remove('active'));
    steps[current].classList.add('active');
    bar.style.width = `${((current + 1) / steps.length) * 100}%`;
    prev.style.display = current === 0 ? 'none' : 'inline-flex';
    next.style.display = current === steps.length - 1 ? 'none' : 'inline-flex';
    submit.style.display = current === steps.length - 1 ? 'inline-flex' : 'none';
  };

  prev.addEventListener('click', () => { current = Math.max(0, current - 1); render(); });
  next.addEventListener('click', () => {
    const steps = visibleSteps();
    const input = steps[current].querySelector('input,select,textarea');
    if (input && !input.checkValidity()) return input.reportValidity();
    current = Math.min(steps.length - 1, current + 1);
    render();
  });
  operation.addEventListener('change', render);
  render();
}

function initAjaxForms() {
  document.querySelectorAll('form[data-ajax-form="true"]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.checkValidity()) return form.reportValidity();

      const status = form.querySelector('.form-status');
      try {
        const response = await fetch(form.action, {
          method: form.method || 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error('send failed');
        if (status) {
          status.textContent = 'Форма отправлена. Мы свяжемся с вами в рабочее время.';
          status.className = 'form-status success';
        }
        form.reset();
        if (form.id === 'quiz-form') initQuiz();
      } catch {
        if (status) {
          status.textContent = 'Ошибка отправки. Проверьте Formspree endpoint.';
          status.className = 'form-status error';
        }
      }
    });
  });
}

(async function initSite() {
  await injectPartial('[data-include="header"]', '/partials/header.html');
  await injectPartial('[data-include="footer"]', '/partials/footer.html');
  setActiveNav();
  bindMenu();
  bindShrinkHeader();
  initReveal();
  initCasesFromSource();
  initAccordion();
  initCalculator();
  initQuiz();
  initAjaxForms();
})();
