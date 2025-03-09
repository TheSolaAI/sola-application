function titleCase(s?: string) {
  if (!s) return '';
  return s
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export { titleCase };
