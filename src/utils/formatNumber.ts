export function formatNumber(num: number) {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2).replace(/\.0$/, '') + 'B';
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2).replace(/\.0$/, '') + 'M';
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(2).replace(/\.0$/, '') + 'K';
  } else {
    if (Math.abs(num) >= 1) {
      return num.toFixed(2);
    }

    const str = num.toString();
    if (!str.includes('.')) return '0.00';

    const decimalPart = str.split('.')[1];

    let result = '0.';
    let foundNonZero = false;

    for (let i = 0; i < decimalPart.length; i++) {
      const char = decimalPart[i];
      result += char;

      if (foundNonZero) return result + (decimalPart[i + 1] ?? '');
      if (char !== '0') foundNonZero = true;
    }

    return result;
  }
}
