import { quote } from './quote';

/*** Serialize JSON-compatible data as a deterministic JavaScript source literal. */
export function sourceLiteral(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return quote(value);
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (Array.isArray(value))
    return `[${value.map((entry) => (entry === undefined ? 'null' : sourceLiteral(entry))).join(', ')}]`;
  if (typeof value !== 'object') throw new Error('Unsupported generated source literal value.');

  const entries = Object.entries(value).filter(([, entry]) => entry !== undefined);
  return `{ ${entries
    .map(
      ([key, entry]) =>
        `${/^[A-Za-z_$][A-Za-z0-9_$]*$/u.test(key) ? key : quote(key)}: ${sourceLiteral(entry)}`,
    )
    .join(', ')} }`;
}
