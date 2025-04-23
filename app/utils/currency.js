import { useSettings } from '../contexts/SettingsContext';

const currencyConfig = {
  USD: {
    symbol: '$',
    precision: 2,
    position: 'before',
  },
  EUR: {
    symbol: '€',
    precision: 2,
    position: 'after',
  },
  GBP: {
    symbol: '£',
    precision: 2,
    position: 'before',
  },
  BTC: {
    symbol: '₿',
    precision: 8,
    position: 'before',
  },
  ETH: {
    symbol: 'Ξ',
    precision: 6,
    position: 'before',
  }
};

export const formatCurrency = (amount, currency = 'USD', options = {}) => {
  const config = currencyConfig[currency] || currencyConfig.USD;
  const {
    precision = config.precision,
    includeSymbol = true,
    roundDown = false,
  } = options;

  const formattedNumber = roundDown
    ? Math.floor(amount * Math.pow(10, precision)) / Math.pow(10, precision)
    : Number(amount).toFixed(precision);

  const parts = formattedNumber.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const numberStr = parts.join('.');

  if (!includeSymbol) return numberStr;

  return config.position === 'before'
    ? `${config.symbol}${numberStr}`
    : `${numberStr}${config.symbol}`;
};

export const parseCurrencyInput = (input, currency = 'USD') => {
  const config = currencyConfig[currency] || currencyConfig.USD;
  const cleaned = input.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  
  if (parts.length > 2) return null;
  if (parts[1] && parts[1].length > config.precision) return null;
  
  const number = parseFloat(cleaned);
  return isNaN(number) ? null : number;
};

export function useCurrency() {
  const { settings } = useSettings();

  const format = (amount, options = {}) => {
    return formatCurrency(amount, settings.currency, options);
  };

  const parse = (input) => {
    return parseCurrencyInput(input, settings.currency);
  };

  const getSymbol = () => {
    const config = currencyConfig[settings.currency] || currencyConfig.USD;
    return config.symbol;
  };

  const getPrecision = () => {
    const config = currencyConfig[settings.currency] || currencyConfig.USD;
    return config.precision;
  };

  return {
    format,
    parse,
    getSymbol,
    getPrecision,
    currentCurrency: settings.currency
  };
}