import type { NavigatorScreenModule } from '../definitions/NavigatorPlan';

const SAFE_EXPORT_NAME = /^[A-Za-z_$][A-Za-z0-9_$]*$/u;
const SAFE_MODULE =
  /^(?:@\/[A-Za-z0-9_./-]+|\.{1,2}\/[A-Za-z0-9_./-]+|@?[A-Za-z0-9][A-Za-z0-9._-]*(?:\/[A-Za-z0-9._-]+)*)$/u;

/*** Reject module and export bindings that cannot be emitted as safe static imports. */
export function assertModuleBinding(binding: NavigatorScreenModule, description: string): void {
  if (
    !SAFE_MODULE.test(binding.module) ||
    binding.module.includes('\\') ||
    binding.module.split('/').slice(1).includes('..')
  ) {
    throw new Error(`${description} has an unsafe module specifier.`);
  }
  if (!SAFE_EXPORT_NAME.test(binding.exportName)) {
    throw new Error(`${description} has an invalid exported symbol.`);
  }
}

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

/*** Serialize a generated JSX string attribute with JSON-compatible double-quote escaping. */
export function quoteJsxAttribute(value: string): string {
  return JSON.stringify(value);
}

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
