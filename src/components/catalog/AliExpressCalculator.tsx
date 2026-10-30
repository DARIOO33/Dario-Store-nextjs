"use client";

import { useMemo, useState } from "react";
import { useT } from "@/src/i18n/client";

type Currency = "TND" | "EUR" | "USD";

const TO_TND: Record<Currency, number> = { TND: 1, EUR: 3.36, USD: 3 };

function commissionRate(amountTnd: number) {
  if (amountTnd <= 100) return 0.25;
  if (amountTnd <= 500) return 0.2;
  return 0.15;
}

function formatTnd(value: number) {
  return new Intl.NumberFormat("fr-TN", { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(value);
}

export default function AliExpressCalculator() {
  const t = useT();
  const [currency, setCurrency] = useState<Currency>("TND");
  const [price, setPrice] = useState("");
  const calculation = useMemo(() => {
    const entered = Number(price);
    if (!Number.isFinite(entered) || entered <= 0) return null;
    const baseTnd = entered * TO_TND[currency];
    const rate = commissionRate(baseTnd);
    return { baseTnd, rate, total: baseTnd * (1 + rate) };
  }, [currency, price]);

  return (
    <section className="aliCalculator" aria-labelledby="ali-calculator-title">
      <div className="aliCalcIntro">
        <span className="kicker">{t("calculator.eyebrow")}</span>
        <h2 id="ali-calculator-title">{t("calculator.title")}</h2>
        <p>{t("calculator.description")}</p>
      </div>
      <div className="aliCalcBody">
        <div className="aliCalcInputs">
          <div className="field">
            <label htmlFor="ali-price">{t("calculator.priceLabel")}</label>
            <input
              id="ali-price"
              className="input"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="0"
            />
          </div>
          <div className="field">
            <label htmlFor="ali-currency">{t("calculator.currencyLabel")}</label>
            <select id="ali-currency" className="input" value={currency} onChange={(event) => setCurrency(event.target.value as Currency)}>
              <option value="TND">TND — {t("calculator.tnd")}</option>
              <option value="EUR">EUR — {t("calculator.eur")}</option>
              <option value="USD">USD — {t("calculator.usd")}</option>
            </select>
          </div>
        </div>
        <div className="aliCalcResult" aria-live="polite">
          {calculation ? (
            <>
              <span>{t("calculator.estimatedTotal")}</span>
              <strong>{formatTnd(calculation.total)} <small>DT</small></strong>
              <p>{t("calculator.breakdown", { base: formatTnd(calculation.baseTnd), rate: String(Math.round(calculation.rate * 100)) })}</p>
            </>
          ) : (
            <span>{t("calculator.enterPrice")}</span>
          )}
        </div>
        <p className="aliCalcNote">{t("calculator.rates")}</p>
      </div>
      <div className="aliCalcTiers">
        <span>{t("calculator.tier1")}</span>
        <span>{t("calculator.tier2")}</span>
        <span>{t("calculator.tier3")}</span>
      </div>
    </section>
  );
}
