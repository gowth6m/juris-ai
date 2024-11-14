// ----------------------------------------------------------------------

type InputValue = string | number | null;

// ----------------------------------------------------------------------

export function fNumber(inputValue: InputValue) {
  // const { code } = getLocaleCode();

  if (!inputValue) return '';

  const number = Number(inputValue);

  const fm = new Intl.NumberFormat().format(number);

  return fm;
}

// ----------------------------------------------------------------------

export function fPercent(inputValue: InputValue) {
  if (!inputValue) return '';

  const number = Number(inputValue) / 100;

  const fm = new Intl.NumberFormat().format(number);

  return fm;
}

// ----------------------------------------------------------------------

export function fShortenNumber(inputValue: InputValue) {
  if (!inputValue) return '';

  const number = Number(inputValue);

  const fm = new Intl.NumberFormat().format(number);

  return fm.replace(/[A-Z]/g, (match) => match.toLowerCase());
}

// ----------------------------------------------------------------------

export function fData(inputValue: InputValue) {
  if (!inputValue) return '';

  if (inputValue === 0) return '0 Bytes';

  const units = ['bytes', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb'];

  const decimal = 2;

  const baseValue = 1024;

  const number = Number(inputValue);

  const index = Math.floor(Math.log(number) / Math.log(baseValue));

  const fm = `${parseFloat((number / baseValue ** index).toFixed(decimal))} ${units[index]}`;

  return fm;
}
