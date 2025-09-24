import { services } from "./services.js";

let currentCount = 1;
let selectedPackage = null;
let selectedGameKey = null;

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

const MAKE_PREPARE_CP_PARAMS_URL =
  "https://hook.eu2.make.com/3q7a2fyvuxfp3janlys65us5t7wolaq7";

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
  const totalPrice = selectedPackage.price * currentCount;
  const totalTrainings = selectedPackage.hours * currentCount;
  serviceTotalEl.textContent = `${totalPrice.toFixed(2)}₽`;
  amountEl.textContent = currentCount;
  if (trainingCount && selectedPackage.type === "games") {
    trainingCount.textContent = `${totalTrainings} ${getGameWord(
      totalTrainings
    )}`;
  } else {
    trainingCount.textContent = `${totalTrainings} ${getTrainingWord(
      totalTrainings
    )}`;
  }
  if (finalPrice) finalPrice.textContent = `${totalPrice.toFixed(2)}₽`;
  if (packageNameText && selectedGameKey)
    packageNameText.textContent = services[selectedGameKey].description;
}

function selectGame(gameKey, packageKey = null) {
  const game = services[gameKey];
  if (!game || !game.packages) return;
  const selectedPackageKey =
    packageKey && game.packages[packageKey]
      ? packageKey
      : Object.keys(game.packages)[0];
  selectedPackage = game.packages[selectedPackageKey];
  selectedGameKey = gameKey;
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
}

function openPol() {
  window.parent.location.href = "https://www.skillsdiff.com/privacy-policy";
}

document.getElementById("minus").addEventListener("click", () => {
  if (currentCount > 1) {
    currentCount--;
    updateQuantityAndTotal();
  }
});
document.getElementById("plus").addEventListener("click", () => {
  if (currentCount < 10) {
    currentCount++;
    updateQuantityAndTotal();
  }
});

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

function normalizeCP(cpRaw) {
  const toNum = (v) => (v == null || v === "" ? undefined : Number(v));
  return {
    mode: cpRaw.mode || "charge",
    publicId: cpRaw.publicId,
    description: cpRaw.description,
    amount: toNum(cpRaw.amount),
    currency: cpRaw.currency || "RUB",
    invoiceId: cpRaw.invoiceId,
    accountId: cpRaw.accountId,
    email: cpRaw.email,
    skin: cpRaw.skin || "modern",
    data: {
      ...(cpRaw.data || {}),
      cloudPayments: undefined,
      CloudPayments: undefined,
    },
  };
}

function openCPWidget(cpCfg) {
  const SUCCESS_URL = "https://www.skillsdiff.com/thank-you-page";
  const ERROR_URL = "https://www.skillsdiff.com/error";

  const widget = new cp.CloudPayments({ language: "ru" });

  let finished = false;
  widget.onclose = function () {
    if (!finished) closeLightbox();
  };

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
      onComplete: function (paymentResult, options) {
        finished = true;
        if (paymentResult && paymentResult.success) {
          window.parent.location.href = SUCCESS_URL;
        }
      },
    }
  );
}

function closeLightbox() {
  window.parent.postMessage("close lightbox", "*");
}

document.querySelector(".form").addEventListener("submit", async function (e) {
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

  const amount = Number((selectedPackage.price * currentCount).toFixed(2));
  const currency = "RUB";
  const invoiceId = `SD-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const description = `${services[selectedGameKey].description} — ${selectedPackage.name}`;

  const payload = {
    email,
    name,
    game: services[selectedGameKey].name,
    package: selectedPackage.name,
    count: currentCount,
    total_hours: selectedPackage.hours * currentCount,
    price_per_package: selectedPackage.price,
    total_price: amount,
    currency,
    invoice_id: invoiceId,
    account_id: email,
    description,
  };

  const btn = document.querySelector(".submit-btn");
  const oldText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Готовим оплату…";

  const form = document.querySelector(".form");
  form.classList.add("hidden");

  const sumbWindow = document.querySelector(".window");
  sumbWindow.classList.remove("hidden");

  try {
    const resp = await fetch(MAKE_PREPARE_CP_PARAMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await resp.json().catch(() => ({}));
    if (resp.ok && result && result.cp && result.cp.publicId) {
      openCPWidget(normalizeCP(result.cp));
    } else {
      console.error("Bad response from Make:", result);
      alert("Ошибка: не удалось подготовить оплату. Попробуйте позже.");
    }
  } catch (err) {
    console.error(err);
    alert("Сервис оплаты временно недоступен. Попробуйте позже.");
  } finally {
    btn.disabled = false;
    btn.textContent = oldText;
  }
});

selectGame("dota2", "divine");
