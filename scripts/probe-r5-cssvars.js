(() => {
  const s = getComputedStyle(document.documentElement);
  const vars = {};
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule.selectorText === ':root' && rule.style) {
          for (const prop of rule.style) {
            if (prop.startsWith('--')) vars[prop] = rule.style.getPropertyValue(prop).trim();
          }
        }
      }
    } catch (e) { /* cross-origin */ }
  }
  // also computed values
  return JSON.stringify({
    vars,
    computed: {
      fg: s.getPropertyValue('--foreground').trim(),
      card: s.getPropertyValue('--card').trim(),
      cardFg: s.getPropertyValue('--card-foreground').trim(),
      primary: s.getPropertyValue('--primary-color').trim(),
      accent: s.getPropertyValue('--accent-color').trim(),
    }
  }, null, 1);
})()
