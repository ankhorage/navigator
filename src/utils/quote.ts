/*** Serialize a generated JavaScript string literal with safe single-quote escaping. */
export function quote(value: string): string {
  const content = [...value]
    .map((character) => {
      if (character === "'") return "\\'";
      if (character === '"') return '"';
      if (character === '\u2028') return '\\u2028';
      if (character === '\u2029') return '\\u2029';
      return JSON.stringify(character).slice(1, -1);
    })
    .join('');
  return `'${content}'`;
}
