(function () {
  const toggle = document.getElementById("promoToggle");
  const panel = document.getElementById("promoPanel");
  const input = panel ? panel.querySelector('input[name="promo"]') : null;
  const promoMsg = document.getElementById("promo-message");

  if (!toggle || !panel || !input) {
    console.warn("[Promo] toggle/panel/input not found");
    return;
  }

  const PROMO_WEBHOOK_URL =
    "https://hook.eu2.make.com/dsplhyv3fpogcb2qlsu4qb7f8aodu8su";

  let promoValid = null;
  let promoMeta = {
    flow: null,
    scenarioUrl: null,
    discount: null,
    message: "",
    allowedPackage: null,
  };

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    panel.dataset.open = String(open);
    if (open) requestAnimationFrame(() => input.focus());
  };

  const setState = (state, message = "") => {
    input.classList.remove("valid", "invalid", "loading");
    if (state === "valid") input.classList.add("valid");
    if (state === "invalid") input.classList.add("invalid");
    if (state === "loading") input.classList.add("loading");

    if (promoMsg) {
      promoMsg.textContent = message || "";
      promoMsg.className = "promo-msg";
      if (state === "valid") promoMsg.classList.add("valid-msg");
      if (state === "invalid") promoMsg.classList.add("invalid-msg");
      if (state === "loading") promoMsg.classList.add("loading-msg");
    }

    if (state === "valid") promoValid = true;
    else if (state === "invalid") promoValid = false;
    else promoValid = null;
  };

  async function parseSafe(res) {
    const raw = await res.text();
    try {
      return JSON.parse(raw);
    } catch {
      const cleaned = raw
        .replace(/^\uFEFF/, "")
        .replace(/\u00A0/g, " ")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/^[^\[{]*/, "")
        .replace(/[^\]}]*$/, "")
        .trim();
      try {
        return JSON.parse(cleaned);
      } catch {
        console.debug("[Promo] Non-JSON response:", raw);
        return {};
      }
    }
  }

  const toBool = (v) =>
    typeof v === "boolean" ? v : String(v).toLowerCase() === "true";

  let reqId = 0;
  let timer = null;

  async function validateNow(value) {
    const my = ++reqId;
    const promo = (value || "").trim();

    if (!promo) {
      setState(null, "");
      promoMeta = {
        flow: null,
        scenarioUrl: null,
        discount: null,
        message: "",
        allowedPackage: null,
      };
      return { valid: null, meta: promoMeta };
    }

    setState("loading", "Проверяем промокод…");

    try {
      const res = await fetch(PROMO_WEBHOOK_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promo,
          package: window.currentPackageKey,
          game: window.currentGameKey,
          amount: window.currentAmount,
        }),
      });

      if (my !== reqId) return { valid: promoValid, meta: promoMeta };
      if (!res.ok) {
        setState("invalid", "Ошибка проверки");
        promoMeta = {
          flow: null,
          scenarioUrl: null,
          discount: null,
          message: "Ошибка проверки",
          allowedPackage: null,
        };
        return { valid: false, meta: promoMeta };
      }

      const data = await parseSafe(res);
      const ok = toBool(data.valid);

      // --- НОРМАЛИЗАЦИЯ СКИДКИ ---
      const DEFAULT_DISCOUNT_TYPE = "percent"; // поменяй на "amount", если число = фикс. сумма
      const rawDisc = data.discount;
      let normDiscount = null;

      if (rawDisc && typeof rawDisc === "object") {
        const type = String(rawDisc.type || "").toLowerCase();
        const value = Number(rawDisc.value);
        if (
          (type === "percent" || type === "amount") &&
          Number.isFinite(value)
        ) {
          normDiscount = { type, value, currency: rawDisc.currency || null };
        }
      } else if (typeof rawDisc === "number") {
        if (Number.isFinite(rawDisc)) {
          normDiscount = {
            type: DEFAULT_DISCOUNT_TYPE,
            value: rawDisc,
            currency: null,
          };
        }
      } else if (typeof rawDisc === "string") {
        const s = rawDisc.trim();
        const mPct = s.match(/^(-?\d+(?:\.\d+)?)\s*%$/); // "15%" или "-15 %"
        const mAmt = s.match(/^(-?\d+(?:\.\d+)?)$/); // "15" или "-300"
        if (mPct) {
          normDiscount = {
            type: "percent",
            value: Number(mPct[1]),
            currency: null,
          };
        } else if (mAmt) {
          normDiscount = {
            type: DEFAULT_DISCOUNT_TYPE,
            value: Number(mAmt[1]),
            currency: null,
          };
        }
      }
      // ---------------------------

      promoMeta = {
        flow: data.flow || null,
        scenarioUrl: data.scenarioUrl || null,
        discount: normDiscount,
        message: data.message || "",
        allowedPackage: data.package || null,
      };

      if (ok) {
        setState("valid", promoMeta.message || "Промокод применён");
      } else {
        setState("invalid", promoMeta.message || "Промокод недействителен");
      }

      // Сообщаем остальному коду о результате
      window.dispatchEvent(
        new CustomEvent("promo:validated", {
          detail: { ok, promo, meta: { ...promoMeta } },
        })
      );

      return { valid: ok, meta: promoMeta };
    } catch (e) {
      if (my !== reqId) return { valid: promoValid, meta: promoMeta };
      console.error("[Promo] Fetch error:", e);
      setState("invalid", "Ошибка сети");
      promoMeta = {
        flow: null,
        scenarioUrl: null,
        discount: null,
        message: "Ошибка сети",
        allowedPackage: null,
      };
      return { valid: false, meta: promoMeta };
    }
  }

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    setOpen(!isOpen);
  });

  panel.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
    if (e.key === "Enter" && e.target === input) {
      e.preventDefault();
      clearTimeout(timer);
      validateNow(input.value);
    }
  });

  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => validateNow(input.value), 300);
  });

  window.PromoValidator = {
    getValue: () => input.value.trim(),
    isValid: () => promoValid,
    getMeta: () => ({ ...promoMeta }),
    async validateNow() {
      return validateNow(input.value);
    },
  };
})();
