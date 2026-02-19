(function initCalculator() {
  const form = document.querySelector('#payback-form');
  if (!form) return;

  const economyOutput = document.querySelector('#economy-output');
  const paybackOutput = document.querySelector('#payback-output');
  const sendStatus = document.querySelector('#calc-send-status');

  const cropFactors = {
    wheat: 1,
    corn: 1.24,
    sunflower: 1.18,
    rapeseed: 1.32,
  };

  form.addEventListener('submit', async (event) => {
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

    const data = new FormData(form);
    data.append('annualEconomy', String(annualEconomy));
    data.append('paybackMonths', String(paybackMonths));

    try {
      await fetch(form.action, {
        method: form.method,
        body: data,
        headers: { Accept: 'application/json' },
      });
      sendStatus.textContent = 'Данные отправлены. Мы подготовим детализированный расчёт.';
    } catch (error) {
      sendStatus.textContent = 'Не удалось отправить форму. Проверьте подключение или используйте телефон в разделе Контакты.';
    }
  });
})();
