async function injectPartial(selector, path) {
  const target = document.querySelector(selector);
  if (!target) return;
  const response = await fetch(path);
  if (!response.ok) return;
  target.innerHTML = await response.text();
}

function setActiveNav() {
  const current = document.body.dataset.page;
  document.querySelectorAll('.site-nav a').forEach((link) => {
    const href = link.getAttribute('href');
    if ((current === 'about' && href === '/about/') || (current === 'catalog' && href === '/catalog/') || (current === 'contact' && href === '/contact/')) {
      link.classList.add('active');
    }
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

function initAccordion() {
  document.querySelectorAll('.acc-item').forEach((item) => {
    const trigger = item.querySelector('.acc-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', () => item.classList.toggle('open'));
  });
}

function money(value) {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
}

function initCalculator() {
  const form = document.querySelector('#payback-form');
  if (!form) return;

  const cropK = { wheat: 1, barley: 0.95, corn: 1.25, sunflower: 1.18, rapeseed: 1.28, soy: 1.08, sugarbeet: 1.34 };
  const opK = { sowing: 0.92, fertilizing: 1.14, spraying: 1.11 };
  const fertK = { nitrogen: 1.05, phosphorus: 1.02, potassium: 1.0, complex: 1.1, '': 1 };

  const out = {
    fert: document.querySelector('#out-fert'),
    chem: document.querySelector('#out-chem'),
    fuel: document.querySelector('#out-fuel'),
    total: document.querySelector('#out-total'),
    roi: document.querySelector('#out-roi'),
    payback: document.querySelector('#out-payback'),
  };

  const calculate = () => {
    const area = Number(form.area.value);
    const capture = Number(form.capture.value);
    const rate = Number(form.rate.value);
    const crop = form.crop.value;
    const operation = form.operation.value;
    const fertType = form.fertType.value;
    if (!area || !capture || !rate || !crop || !operation) return null;

    const widthK = Math.max(0.8, Math.min(1.3, capture / 12));
    const base = area * cropK[crop] * opK[operation] * widthK;

    const fertSaving = operation === 'fertilizing' ? base * rate * 115 * fertK[fertType] : 0;
    const chemSaving = operation === 'spraying' ? base * rate * 170 : 0;
    const fuelSaving = base * 290;
    const total = fertSaving + chemSaving + fuelSaving;
    const investment = 4200000;
    const roi = ((total - investment) / investment) * 100;
    const payback = (investment / Math.max(total, 1)) * 12;

    return { fertSaving, chemSaving, fuelSaving, total, roi, payback };
  };

  form.addEventListener('submit', (e) => {
    const result = calculate();
    if (!result) {
      e.preventDefault();
      const status = form.querySelector('.form-status');
      if (status) {
        status.textContent = 'Заполните все обязательные поля калькулятора.';
        status.className = 'form-status error';
      }
      return;
    }

    out.fert.textContent = money(result.fertSaving);
    out.chem.textContent = money(result.chemSaving);
    out.fuel.textContent = money(result.fuelSaving);
    out.total.textContent = money(result.total);
    out.roi.textContent = `${result.roi.toFixed(1)} %`;
    out.payback.textContent = `${result.payback.toFixed(1)} мес.`;

    form.querySelector('[name="calc_total"]').value = Math.round(result.total);
    form.querySelector('[name="calc_roi"]').value = result.roi.toFixed(1);
    form.querySelector('[name="calc_payback"]').value = result.payback.toFixed(1);
  });
}

function initQuiz() {
  const form = document.querySelector('#quiz-form');
  if (!form) return;

  const steps = Array.from(form.querySelectorAll('.quiz-step'));
  const prevBtn = form.querySelector('#quiz-prev');
  const nextBtn = form.querySelector('#quiz-next');
  const submitBtn = form.querySelector('#quiz-submit');
  const bar = form.querySelector('#quiz-progress-bar');
  let index = 0;

  const render = () => {
    steps.forEach((s, i) => s.classList.toggle('active', i === index));
    bar.style.width = `${((index + 1) / steps.length) * 100}%`;
    prevBtn.style.display = index === 0 ? 'none' : 'inline-flex';
    nextBtn.style.display = index === steps.length - 1 ? 'none' : 'inline-flex';
    submitBtn.style.display = index === steps.length - 1 ? 'inline-flex' : 'none';
  };

  prevBtn.addEventListener('click', () => {
    index = Math.max(0, index - 1);
    render();
  });

  nextBtn.addEventListener('click', () => {
    const activeInput = steps[index].querySelector('input, select, textarea');
    if (activeInput && !activeInput.checkValidity()) {
      activeInput.reportValidity();
      return;
    }
    index = Math.min(steps.length - 1, index + 1);
    render();
  });

  render();
}

function initAjaxForms() {
  document.querySelectorAll('form[data-ajax-form="true"]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const status = form.querySelector('.form-status');
      try {
        const response = await fetch(form.action, {
          method: form.method || 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error('send error');
        if (status) {
          status.textContent = 'Форма отправлена. Мы свяжемся с вами в рабочее время.';
          status.className = 'form-status success';
        }
        form.reset();
      } catch {
        if (status) {
          status.textContent = 'Ошибка отправки. Проверьте Formspree endpoint.';
          status.className = 'form-status error';
        }
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
  initAccordion();
  initCalculator();
  initQuiz();
  initAjaxForms();
})();
