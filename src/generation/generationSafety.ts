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

/*** Serialize a generated string literal with JSON escaping. */
export function quote(value: string): string {
  return JSON.stringify(value);
}
