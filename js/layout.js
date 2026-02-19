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
  if (!current) return;

  document.querySelectorAll('.site-nav a').forEach((link) => {
    const href = link.getAttribute('href');
    if ((current === 'home' && href === '/') || href === `/${current}/`) {
      link.classList.add('active');
    }
  });
}

function bindMenuToggle() {
  const button = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (!button || !nav) return;

  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('is-open');
  });
}

(async function initLayout() {
  await injectPartial('[data-include="header"]', '/partials/header.html');
  await injectPartial('[data-include="footer"]', '/partials/footer.html');
  setActiveNav();
  bindMenuToggle();
})();
