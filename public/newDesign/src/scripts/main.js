// main.js
import { services } from "./services.js";

let currentCount = 1;
let selectedPackage = null;
let selectedPackageKey = null; // <<< добавили
let selectedGameKey = null;

// --------- DOM ---------
const minusBtn = document.getElementById("minus");
const plusBtn = document.getElementById("plus");
const packageNameEl = document.getElementById("package-name");
const packageHoursEl = document.getElementById("package-hours");
const packagePriceEl = document.getElementById("package-price");
const serviceTotalEl = document.getElementById("service-total");
const amountEl = document.getElementById("amount");
const trainingCount = document.getElementById("training-count");
const finalPrice = document.getElementById("final-price");
const packageNameText = document.querySelector(".package-name");

const form = document.querySelector(".form");
const submitBtn = document.querySelector(".submit-btn");

const inputPromo = document.querySelector('input[name="promo"]');

const MAKE_PREPARE_CP_PARAMS_URL =
  "https://hook.eu2.make.com/3q7a2fyvuxfp3janlys65us5t7wolaq7";

// ---------- словоизменения ----------
function getTrainingWord(n) {
  const d = n % 10,
    t = n % 100;
  if (t >= 11 && t <= 14) return "тренировок";
  if (d === 1) return "тренировка";
  if (d >= 2 && d <= 4) return "тренировки";
  return "тренировок";
}
function getHourWord(n) {
  const d = n % 10,
    t = n % 100;
  if (t >= 11 && t <= 14) return "часов";
  if (d === 1) return "час";
  if (d >= 2 && d <= 4) return "часа";
  return "часов";
}
function getGameWord(n) {
  const d = n % 10,
    t = n % 100;
  if (t >= 11 && t <= 14) return "игр";
  if (d === 1) return "игра";
  if (d >= 2 && d <= 4) return "игры";
  return "игр";
}

function updateQuantityAndTotal() {
  if (!selectedPackage) return;

  const baseTotal = selectedPackage.price * currentCount;
  const totalUnits = selectedPackage.hours * currentCount;

  amountEl.textContent = currentCount;

  if (trainingCount && selectedPackage.type === "games") {
    trainingCount.textContent = `${totalUnits} ${getGameWord(totalUnits)}`;
  } else {
    trainingCount.textContent = `${totalUnits} ${getTrainingWord(totalUnits)}`;
  }

  let toShow = baseTotal;
  const promoApi = window.PromoValidator;
  if (promoApi && promoApi.isValid?.()) {
    const meta = promoApi.getMeta?.() || {};
    const d = meta.discount;
    if (d && d.type) {
      if (d.type === "percent") {
        const pct = Number(d.value || 0);
        toShow = Math.max(0, Math.round((baseTotal * (100 - pct)) / 100));
      } else if (d.type === "amount") {
        const off = Number(d.value || 0);
        toShow = Math.max(0, Math.round(baseTotal - off));
      }
    }
  }

  // обновляем оба поля — чтобы и общая цена, и финальная показывали скидку
  serviceTotalEl.textContent = `${toShow.toFixed(2)}₽`;
  if (finalPrice) finalPrice.textContent = `${toShow.toFixed(2)}₽`;

  if (packageNameText && selectedGameKey)
    packageNameText.textContent = services[selectedGameKey].description;

  window.currentAmount = currentCount;
}

function selectGame(gameKey, packageKey = null) {
  const game = services[gameKey];
  if (!game || !game.packages) return;

  selectedPackageKey =
    packageKey && game.packages[packageKey]
      ? packageKey
      : Object.keys(game.packages)[0];

  selectedPackage = game.packages[selectedPackageKey];
  selectedGameKey = gameKey;

  window.currentGameKey = selectedGameKey;
  window.currentPackageKey = selectedPackageKey;
  currentCount = 1;

  const totalHours = selectedPackage.hours * currentCount;
  packageNameEl.textContent = `Пакет ${selectedPackage.name}`;

  if (selectedPackage.type === "games") {
    packageHoursEl.innerHTML = `${totalHours} ${getGameWord(totalHours)} `;
  } else if (selectedPackage.type === "analysis") {
    packageHoursEl.innerHTML = `${totalHours} ${getTrainingWord(totalHours)}`;
  } else {
    packageHoursEl.innerHTML = `${totalHours} ${getHourWord(
      totalHours
    )} <br /> тренировок`;
  }

  packagePriceEl.textContent = `${selectedPackage.price.toFixed(2)}₽`;
  updateQuantityAndTotal();

  const promoApi = window.PromoValidator;
  if (promoApi) {
    const meta = promoApi.getMeta?.() || {};
    const isValid = promoApi.isValid?.();
    if (isValid && meta.allowedPackage) {
      const allowed = String(meta.allowedPackage).toLowerCase();
      const chosen = String(selectedPackageKey).toLowerCase();
      if (allowed !== chosen) {
        promoApi.validateNow?.();
        const msgEl = document.getElementById("promo-message");
        if (msgEl) {
          msgEl.textContent = "Промокод недействителен для выбранного пакета";
          msgEl.className = "promo-msg invalid-msg";
        }
        const inp = document.querySelector('input[name="promo"]');
        inp && (inp.classList.remove("valid"), inp.classList.add("invalid"));
      }
    }
  }
}

// ---------- +/- ----------
minusBtn.addEventListener("click", () => {
  if (currentCount > 1) {
    currentCount--;
    updateQuantityAndTotal();
  }
});
plusBtn.addEventListener("click", () => {
  if (currentCount < 10) {
    currentCount++;
    updateQuantityAndTotal();
  }
});

// ---------- postMessage ----------
window.addEventListener("message", (event) => {
  const allowedOrigins = [
    "https://www.skillsdiff.com",
    "https://skillsdiff-forms.vercel.app",
  ];
  if (!allowedOrigins.includes(event.origin)) return;
  const data = event.data;
  if (data && typeof data === "object" && data.game && data.package) {
    selectGame(data.game, data.package);
  }
});

// ---------- CloudPayments ----------
function openCPWidget(cpCfg) {
  const SUCCESS_URL = "https://www.skillsdiff.com/thank-you-page";
  const ERROR_URL = "https://www.skillsdiff.com/error";

  const widget = new cp.CloudPayments({ language: "ru" });
  let finished = false;

  widget.pay(
    cpCfg.mode,
    {
      publicId: cpCfg.publicId,
      description: cpCfg.description,
      amount: Number(cpCfg.amount),
      currency: cpCfg.currency,
      invoiceId: cpCfg.invoiceId,
      accountId: cpCfg.accountId,
      email: cpCfg.email,
      skin: cpCfg.skin,
      data: cpCfg.data,
    },
    {
      onSuccess: function () {
        finished = true;
        window.parent.location.href = SUCCESS_URL;
      },
      onFail: function () {
        finished = true;
        window.parent.location.href = ERROR_URL;
      },
      onComplete: function (paymentResult) {
        finished = true;
        if (paymentResult && paymentResult.success)
          window.parent.location.href = SUCCESS_URL;
        else window.parent.location.href = ERROR_URL;
      },
    }
  );
}

function closeLightbox() {
  window.parent.postMessage(
    { type: "close-lightbox" },
    "https://www.skillsdiff.com"
  );
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!selectedPackage || !services[selectedGameKey]) {
    alert("Выберите пакет");
    return;
  }

  const email = document.querySelector('input[name="email"]').value.trim();
  const name = document.querySelector('input[name="name"]').value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Введите корректный email");
    return;
  }

  const promoApi = window.PromoValidator;
  let promoVal = "";
  let promoValid = null;
  let promoMeta = {
    flow: null,
    scenarioUrl: null,
    discount: null,
    message: "",
    allowedPackage: null,
  };

  if (promoApi) {
    promoVal = promoApi.getValue?.() || "";
    promoValid = promoApi.isValid?.();
    promoMeta = promoApi.getMeta?.() || promoMeta;

    if (promoVal && promoValid === null && promoApi.validateNow) {
      const res = await promoApi.validateNow();
      promoValid = res.valid;
      promoMeta = res.meta || promoMeta;
    }

    if (promoVal && promoValid === false) {
      return;
    }

    if (promoVal && promoValid && promoMeta.allowedPackage) {
      const allowed = String(promoMeta.allowedPackage).toLowerCase();
      const chosen = String(selectedPackageKey).toLowerCase();
      if (allowed !== chosen) {
        const msgEl = document.getElementById("promo-message");
        if (msgEl) {
          msgEl.textContent = "Промокод недействителен для выбранного пакета";
          msgEl.className = "promo-msg invalid-msg";
        }
        const inp = document.querySelector('input[name="promo"]');
        inp && (inp.classList.remove("valid"), inp.classList.add("invalid"));
        return;
      }
    }
  }

  const amount = Number((selectedPackage.price * currentCount).toFixed(2));
  function applyDiscount(sum, discount) {
    if (!discount || !discount.type) return sum;
    if (discount.type === "percent") {
      const pct = Number(discount.value || 0);
      return Math.max(0, Math.round((sum * (100 - pct)) / 100));
    }
    if (discount.type === "amount") {
      const off = Number(discount.value || 0);
      return Math.max(0, Math.round(sum - off));
    }
    return sum;
  }

  const discountedAmount =
    promoValid && promoMeta?.discount
      ? applyDiscount(amount, promoMeta.discount)
      : amount;

  // обновим UI, чтобы пользователь видел реальную сумму со скидкой
  if (finalPrice) finalPrice.textContent = `${discountedAmount.toFixed(2)}₽`;
  const currency = "RUB";
  const invoiceId = `SD-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const description = `${services[selectedGameKey].description} — ${selectedPackage.name}`;

  const payload = {
    email,
    name,
    game: services[selectedGameKey].name,
    gameKey: selectedGameKey,
    package: selectedPackage.name,
    packageKey: selectedPackageKey,
    count: currentCount,
    total_hours: selectedPackage.hours * currentCount,
    price_per_package: selectedPackage.price,
    total_price: amount,
    currency,
    invoice_id: invoiceId,
    account_id: email,
    description,
    promo: promoVal || null,
    promo_flow: promoValid && promoMeta.flow ? promoMeta.flow : null,
    total_price_discounted: discountedAmount, // сумма со скидкой
    discount: promoValid ? promoMeta.discount : null,
  };

  // UI
  const oldText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = "Готовим оплату…";
  form.classList.add("hidden");
  const sumbWindow = document.querySelector(".window");
  sumbWindow.classList.remove("hidden");

  // НЕ делаем window.location.href = ... и НЕ return

  try {
    const resp = await fetch(MAKE_PREPARE_CP_PARAMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await resp.json().catch(() => ({}));
    if (resp.ok && result && result.cp && result.cp.publicId) {
      openCPWidget(result.cp);
    } else {
      console.error("Bad response from Make:", result);
      alert("Ошибка: не удалось подготовить оплату. Попробуйте позже.");
      form.classList.remove("hidden");
      sumbWindow.classList.add("hidden");
    }
  } catch (err) {
    console.error(err);
    alert("Сервис оплаты временно недоступен. Попробуйте позже.");
    form.classList.remove("hidden");
    sumbWindow.classList.add("hidden");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = oldText;
  }
});

selectGame("valorant", "dagg3r");
window.addEventListener("promo:validated", () => updateQuantityAndTotal());
