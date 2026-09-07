/*** Serialize a generated JSX string attribute with JSON-compatible double-quote escaping. */
export function quoteJsxAttribute(value: string): string {
  return JSON.stringify(value);
}
