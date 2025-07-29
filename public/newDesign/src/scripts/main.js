const services = {
  dota2: {
    name: "Dota 2",
    description: "Тренировки в Dota 2",
    packages: {
      immortal: { name: "Immortal", hours: 16, price: 99.99, type: "hours" },
      divine: { name: "Divine+", hours: 8, price: 34.99, type: "hours" },
      start: { name: "Start", hours: 4, price: 23.99, type: "hours" },
      single: { name: "1 Тренировка", hours: 1, price: 7.59, type: "hours" },
      friend2: { name: "2 человека", hours: 1, price: 10.99, type: "hours" },
      friend3: { name: "3 человека", hours: 1, price: 14.99, type: "hours" },
      friend4: { name: "4 человека", hours: 1, price: 17.99, type: "hours" },
      friend5: { name: "Full-stack", hours: 1, price: 20.99, type: "hours" },
    },
  },
  valorant: {
    name: "Valorant",
    description: "Тренировки в Valorant",
    packages: {
      radiant: { name: "Radiant", hours: 16, price: 99.99, type: "hours" },
      immortal: { name: "Immortal+", hours: 8, price: 34.99, type: "hours" },
      start: { name: "Start", hours: 4, price: 23.99, type: "hours" },
      single: { name: "1 Тренировка", hours: 1, price: 7.59, type: "hours" },
      friend2: { name: "2 человека", hours: 1, price: 10.99, type: "hours" },
      friend3: { name: "3 человека", hours: 1, price: 14.99, type: "hours" },
      friend4: { name: "4 человека", hours: 1, price: 17.99, type: "hours" },
      friend5: { name: "Full-stack", hours: 1, price: 20.99, type: "hours" },
    },
  },
  valCoach: {
    name: "Valorant",
    description: "Аналитика / Party в Valorant",
    packages: {
      analysis: {
        name: "Анализ игры в Valorant",
        hours: 1,
        price: 19.99,
        type: "analysis",
      },
      party: {
        name: "Party-игры \nс тренером",
        hours: 5,
        price: 39.99,
        type: "games",
      },
    },
  },
  dotaCoach: {
    name: "Dota 2",
    description: "Аналитика / Party в Dota 2",
    packages: {
      analysis: {
        name: "Анализ игры в Dota 2",
        hours: 1,
        price: 19.99,
        type: "analysis",
      },
      party: {
        name: "Party-игры с тренером",
        hours: 5,
        price: 39.99,
        type: "games",
      },
    },
  },
};

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

function getTrainingWord(n) {
  const lastDigit = n % 10;
  const lastTwoDigits = n % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return "тренировок";
  if (lastDigit === 1) return "тренировка";
  if (lastDigit >= 2 && lastDigit <= 4) return "тренировки";
  return "тренировок";
}

function getHourWord(n) {
  const lastDigit = n % 10;
  const lastTwoDigits = n % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return "часов";
  if (lastDigit === 1) return "час";
  if (lastDigit >= 2 && lastDigit <= 4) return "часа";
  return "часов";
}

function getGameWord(n) {
  const lastDigit = n % 10;
  const lastTwoDigits = n % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return "игр";
  if (lastDigit === 1) return "игра";
  if (lastDigit >= 2 && lastDigit <= 4) return "игры";
  return "игр";
}

function updateQuantityAndTotal() {
  if (!selectedPackage) return;

  const totalPrice = selectedPackage.price * currentCount;
  const totalTrainings = selectedPackage.hours * currentCount;

  serviceTotalEl.textContent = `${totalPrice.toFixed(2)}$`;
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

  if (finalPrice) {
    finalPrice.textContent = `${totalPrice.toFixed(2)}$`;
  }

  if (packageNameText && selectedGameKey) {
    packageNameText.textContent = services[selectedGameKey].description;
  }
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
  packagePriceEl.textContent = `${selectedPackage.price.toFixed(2)}$`;

  updateQuantityAndTotal();
}

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

document.querySelector(".form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.querySelector('input[name="email"]').value;
  const name = document.querySelector('input[name="name"]').value;
  const paymentMethod = document.querySelector(
    'input[name="payment"]:checked'
  ).value;

  const totalUSD = selectedPackage.price * currentCount;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Введите корректный email");
    return;
  }

  const data = {
    email: email,
    name: name,
    game: services[selectedGameKey].name,
    package: selectedPackage.name,
    count: currentCount,
    total_hours: selectedPackage.hours * currentCount,
    price_per_package: selectedPackage.price,
    total_price: totalUSD,
    payment: paymentMethod,
    currency: "USD",
  };

  try {
    const response = await fetch(
      "https://hook.eu2.make.com/oliv3ewvtpw30gvan3ihhufneg2g21ng",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();
    if (result.payment_link) {
      window.location.href = result.payment_link;
    } else {
      alert("Ошибка: ссылка на оплату не получена");
    }
  } catch (err) {
    console.error(err);
    alert("Ошибка отправки. Попробуйте позже.");
  }
});

selectGame("dota2", "divine");
