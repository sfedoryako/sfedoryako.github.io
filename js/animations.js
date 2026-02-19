(function initRevealAnimations() {
  const targets = document.querySelectorAll('.story, .card, .panel, .timeline article');
  if (!targets.length) return;

  targets.forEach((el) => {
    if (el.classList.contains('hero')) return;
    el.classList.add('reveal');
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
})();
