// debloater.cjs
const fs = require('fs');
const pkg = require('./tailwind.config.cjs'); // Default import from tailwind.config.cjs
const { theme } = pkg;

const css = fs.readFileSync('./dist/output.css', 'utf8');

// Helper to flatten theme object
function getThemeValues(theme) {
  const values = [];
  for (const key in theme) {
    if (typeof theme[key] === 'object') {
      for (const subKey in theme[key]) {
        values.push(`${key}-${subKey}`);
      }
    } else {
      values.push(key);
    }
  }
  return values;
}

const definitions = getThemeValues(theme.extend || {});
definitions.forEach((def) => {
  const className = def.replace(/([A-Z])/g, '-$1').toLowerCase();
  const regex = new RegExp(`\\.${className}(?![a-zA-Z0-9])`, 'g');
  if (!css.match(regex)) {
    console.log(`Unused definition: ${def}`);
  }
});

console.log('Check complete!');
