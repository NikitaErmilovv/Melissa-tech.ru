(function () {
  var root = document.getElementById('calc');
  if (!root) return;

  var DIRECTIONS = {
    china: { label: 'Китай', freight: 150000, delivery: 100000, days: 30 },
    japan: { label: 'Япония', freight: 170000, delivery: 120000, days: 45 },
    korea: { label: 'Корея', freight: 160000, delivery: 120000, days: 40 }
  };

  var SERVICE_FEE = 120000;
  var PAPERS_FEE = 15000;
  var UTIL_NEW = 3400;
  var UTIL_USED = 5200;
  var EUR_FALLBACK = 100;

  var DUTY_NEW = [
    { maxEur: 8500, rate: 0.54, minPerCc: 2.5 },
    { maxEur: 16700, rate: 0.48, minPerCc: 3.5 },
    { maxEur: 42300, rate: 0.48, minPerCc: 5.5 },
    { maxEur: 84500, rate: 0.48, minPerCc: 7.5 },
    { maxEur: 169000, rate: 0.48, minPerCc: 15 },
    { maxEur: Infinity, rate: 0.48, minPerCc: 20 }
  ];

  var DUTY_BY_VOLUME = {
    '3-5': [
      { maxCc: 1000, perCc: 1.5 },
      { maxCc: 1500, perCc: 1.7 },
      { maxCc: 1800, perCc: 2.5 },
      { maxCc: 2300, perCc: 2.7 },
      { maxCc: 3000, perCc: 3.0 },
      { maxCc: Infinity, perCc: 3.6 }
    ],
    '5+': [
      { maxCc: 1000, perCc: 3.0 },
      { maxCc: 1500, perCc: 3.2 },
      { maxCc: 1800, perCc: 3.5 },
      { maxCc: 2300, perCc: 4.8 },
      { maxCc: 3000, perCc: 5.0 },
      { maxCc: Infinity, perCc: 5.7 }
    ]
  };

  var CUSTOMS_FEE = [
    { maxRub: 200000, fee: 1067 },
    { maxRub: 450000, fee: 2134 },
    { maxRub: 1200000, fee: 4269 },
    { maxRub: 2700000, fee: 11746 },
    { maxRub: 4200000, fee: 16524 },
    { maxRub: 5500000, fee: 21344 },
    { maxRub: 7000000, fee: 27540 },
    { maxRub: Infinity, fee: 30000 }
  ];

  var state = { country: 'china', age: 'new', fuel: 'ice', price: 2500000, volume: 2000 };
  var eurRate = EUR_FALLBACK;

  var priceInput = document.getElementById('calc-price');
  var volumeInput = document.getElementById('calc-volume');
  var priceOut = document.getElementById('calc-price-out');
  var volumeOut = document.getElementById('calc-volume-out');
  var totalOut = document.getElementById('calc-total');
  var termOut = document.getElementById('calc-term');
  var rateOut = document.getElementById('calc-rate');
  var rows = {
    car: document.getElementById('calc-row-car'),
    freight: document.getElementById('calc-row-freight'),
    duty: document.getElementById('calc-row-duty'),
    util: document.getElementById('calc-row-util'),
    papers: document.getElementById('calc-row-papers'),
    delivery: document.getElementById('calc-row-delivery'),
    service: document.getElementById('calc-row-service')
  };

  var money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });

  function rub(value) {
    return money.format(Math.round(value)) + ' ₽';
  }

  function pick(table, value, key) {
    for (var i = 0; i < table.length; i++) {
      if (value <= table[i][key]) return table[i];
    }
    return table[table.length - 1];
  }

  function calcDuty() {
    if (state.fuel === 'ev') return state.price * 0.15;
    if (state.age === 'new') {
      var band = pick(DUTY_NEW, state.price / eurRate, 'maxEur');
      return Math.max(state.price * band.rate, state.volume * band.minPerCc * eurRate);
    }
    return state.volume * pick(DUTY_BY_VOLUME[state.age], state.volume, 'maxCc').perCc * eurRate;
  }

  function render() {
    var dir = DIRECTIONS[state.country];
    var duty = calcDuty();
    var util = state.age === 'new' ? UTIL_NEW : UTIL_USED;
    var fees = util + pick(CUSTOMS_FEE, state.price, 'maxRub').fee;
    var total = state.price + dir.freight + duty + fees + PAPERS_FEE + dir.delivery + SERVICE_FEE;

    priceOut.textContent = rub(state.price);
    volumeOut.textContent = state.fuel === 'ev' ? '—' : money.format(state.volume) + ' см³';
    rows.car.textContent = rub(state.price);
    rows.freight.textContent = rub(dir.freight);
    rows.duty.textContent = rub(duty);
    rows.util.textContent = rub(fees);
    rows.papers.textContent = rub(PAPERS_FEE);
    rows.delivery.textContent = rub(dir.delivery);
    rows.service.textContent = rub(SERVICE_FEE);
    totalOut.textContent = rub(total);
    termOut.textContent = 'Срок под ключ — от ' + dir.days + ' дней · ' + dir.label;
    rateOut.textContent = money.format(Math.round(eurRate)) + ' ₽';
  }

  function bindChoice(group, key) {
    var buttons = root.querySelectorAll('[data-group="' + group + '"] button');
    Array.prototype.forEach.call(buttons, function (button) {
      button.addEventListener('click', function () {
        state[key] = button.dataset.value;
        Array.prototype.forEach.call(buttons, function (other) {
          other.setAttribute('aria-pressed', String(other === button));
        });
        if (key === 'fuel') volumeInput.disabled = state.fuel === 'ev';
        render();
      });
    });
  }

  bindChoice('country', 'country');
  bindChoice('age', 'age');
  bindChoice('fuel', 'fuel');

  priceInput.addEventListener('input', function () {
    state.price = Number(priceInput.value);
    render();
  });

  volumeInput.addEventListener('input', function () {
    state.volume = Number(volumeInput.value);
    render();
  });

  render();

  fetch('https://www.cbr-xml-daily.ru/daily_json.js')
    .then(function (res) {
      if (!res.ok) throw new Error('rate unavailable');
      return res.json();
    })
    .then(function (data) {
      var value = data && data.Valute && data.Valute.EUR && data.Valute.EUR.Value;
      if (value > 0) {
        eurRate = value;
        render();
      }
    })
    .catch(function () {});
})();
