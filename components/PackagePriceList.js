import { CURRENCY_SYMBOLS } from '../lib/packageSchema';

export default function PackagePriceList({ currencies = [], prices = {} }) {
  const entries = currencies.filter((currency) => prices[currency]);
  if (entries.length === 0) return null;

  return (
    <p className="package-price-list">
      <small>per person</small>
      {entries.map((currency) => (
        <strong key={currency}>
          {CURRENCY_SYMBOLS[currency] || `${currency} `}
          {prices[currency]}
        </strong>
      ))}
    </p>
  );
}
