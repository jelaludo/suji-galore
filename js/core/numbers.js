export const MAX = 999999;
export function parseNumber(raw) {
  const text = String(raw).trim();
  if (!/^[+-]?(?:\d+|0x[\da-f]+|0b[01]+)$/i.test(text)) return null;
  const sign = text.startsWith('-') ? -1 : 1;
  const n = sign * Number(text.replace(/^[+-]/, ''));
  return Number.isSafeInteger(n) && Math.abs(n) <= MAX ? n : null;
}
export function digits(n, base) {
  const result = [];
  do { result.push(n % base); n = Math.floor(n / base); } while (n);
  return result;
}
