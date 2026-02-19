async function injectPartial(selector, path) {
  const target = document.querySelector(selector);
  if (!target) return;
  const response = await fetch(path);
  if (!response.ok) {
    target.innerHTML = '<p>Не удалось загрузить часть страницы.</p>';
    return;
  }
  target.innerHTML = await response.text();
}

function setActiveNav() {
  const current = document.body.dataset.page;
  document.querySelectorAll('.site-nav a').forEach((link) => {
    const href = link.getAttribute('href');
    if ((current === 'home' && href === '/') || href === `/${current}/`) link.classList.add('active');
  });
}

function bindMenu() {
  const button = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (!button || !nav) return;
  button.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(isOpen));
  });
}

function bindShrinkHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const handler = () => header.classList.toggle('is-shrink', window.scrollY > 24);
  handler();
  window.addEventListener('scroll', handler, { passive: true });
}

function initRevealAnimations() {
  const targets = document.querySelectorAll('.story, .card, .panel, .timeline article, .acc-item');
  if (!targets.length) return;

  targets.forEach((el) => {
    if (!el.classList.contains('hero')) el.classList.add('reveal');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

function initAccordions() {
  document.querySelectorAll('.acc-item').forEach((item) => {
    const trigger = item.querySelector('.acc-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', () => {
      item.classList.toggle('open');
    });
  });
}

function formatRub(value) {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
}

function initCalculator() {
  const form = document.querySelector('#payback-form');
  if (!form) return;

  const fields = {
    area: form.querySelector('[name="area"]'),
    crop: form.querySelector('[name="crop"]'),
    operation: form.querySelector('[name="operation"]'),
    capture: form.querySelector('[name="capture"]'),
  };

  const out = {
    chem: document.querySelector('#out-chem'),
    fert: document.querySelector('#out-fert'),
    fuel: document.querySelector('#out-fuel'),
    total: document.querySelector('#out-total'),
    payback: document.querySelector('#out-payback'),
    roi: document.querySelector('#out-roi'),
  };

  const cropK = { wheat: 1, corn: 1.24, sunflower: 1.18, rapeseed: 1.32 };
  const opK = { sowing: 0.92, fertilizing: 1.1, spraying: 1.08 };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const area = Number(fields.area.value);
    const crop = fields.crop.value;
    const operation = fields.operation.value;
    const capture = Number(fields.capture.value);

    if (!area || !crop || !operation || !capture) {
      const status = form.querySelector('.form-status');
      if (status) {
        status.textContent = 'Заполните все поля калькулятора.';
        status.className = 'form-status error';
      }
      return;
    }

    const widthCoeff = Math.max(0.85, Math.min(1.25, capture / 12));
    const base = area * cropK[crop] * opK[operation] * widthCoeff;

    const chem = operation === 'spraying' ? base * 950 : 0;
    const fert = operation === 'fertilizing' ? base * 1200 : 0;
    const fuel = base * 320;
    const total = chem + fert + fuel;
    const investment = 4200000;
    const payback = (investment / Math.max(total, 1)) * 12;
    const roi = ((total - investment) / investment) * 100;

    out.chem.textContent = formatRub(chem);
    out.fert.textContent = formatRub(fert);
    out.fuel.textContent = formatRub(fuel);
    out.total.textContent = formatRub(total);
    out.payback.textContent = `${payback.toFixed(1)} мес.`;
    out.roi.textContent = `${roi.toFixed(1)} %`;

    form.querySelector('[name="calc_total"]').value = Math.round(total);
    form.querySelector('[name="calc_payback"]').value = payback.toFixed(1);
    form.querySelector('[name="calc_roi"]').value = roi.toFixed(1);
  });
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
      const data = new FormData(form);

      try {
        const response = await fetch(form.action, {
          method: form.method || 'POST',
          body: data,
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) throw new Error('Formspree error');

        if (status) {
          status.textContent = 'Спасибо! Форма отправлена. Мы свяжемся с вами в рабочее время.';
          status.className = 'form-status success';
        }
        form.reset();
      } catch (error) {
        if (status) {
          status.textContent = 'Ошибка отправки. Проверьте endpoint Formspree или подключение.';
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
  initRevealAnimations();
  initAccordions();
  initCalculator();
  initAjaxForms();
})();
