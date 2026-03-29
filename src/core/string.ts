// core/string.ts

export const converters: Record<string, (s: string) => string> = {
  camelCase: s => s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()),
  PascalCase: s => s.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^./, c => c.toUpperCase()),
  snake_case: s => s.replace(/\W+/g, '_').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase(),
  SCREAMING_SNAKE: s => s.replace(/\W+/g, '_').replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase(),
  kebab_case: s => s.replace(/\W+/g, '-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
  upperCase: s => s.toUpperCase(),
  lowerCase: s => s.toLowerCase(),
  titleCase: s => s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
  sentenceCase: s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
  dotCase: s => s.replace(/\W+/g, '.').replace(/([a-z])([A-Z])/g, '$1.$2').toLowerCase(),
  pathCase: s => s.replace(/\W+/g, '/').replace(/([a-z])([A-Z])/g, '$1/$2').toLowerCase(),
  spongeCase: s => s.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join(''),
};

/**
 * Convert a string to a specific case.
 */
export const convertCase = (input: string, mode: keyof typeof converters): string => {
  if (!input) return '';
  const fn = converters[mode];
  return fn ? fn(input) : input;
};

export const generateSlug = (text: string): string => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, ""); // Remove trailing/leading hyphen
};
