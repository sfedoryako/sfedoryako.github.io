(function initCalculator() {
  const form = document.querySelector('#payback-form');
  if (!form) return;

  const economyOutput = document.querySelector('#economy-output');
  const paybackOutput = document.querySelector('#payback-output');

  const cropFactors = {
    wheat: 1,
    corn: 1.24,
    sunflower: 1.18,
    rapeseed: 1.32,
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const area = Number(form.area.value);
    const captureWidth = Number(form.capture.value);
    const crop = form.crop.value;

    if (!area || !captureWidth || !cropFactors[crop]) return;

    const baseSavingPerHa = 1850;
    const widthCoefficient = Math.max(0.9, Math.min(1.3, captureWidth / 12));

    const annualEconomy = Math.round(area * baseSavingPerHa * cropFactors[crop] * widthCoefficient);
    const implementationBudget = 4200000;
    const paybackMonths = ((implementationBudget / annualEconomy) * 12).toFixed(1);

    economyOutput.textContent = `${annualEconomy.toLocaleString('ru-RU')} ₽ / сезон`;
    paybackOutput.textContent = `${paybackMonths} мес.`;
  });
})();
