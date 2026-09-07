import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';

import { expect, test } from 'bun:test';
import ts from 'typescript';

import packageJson from '../package.json';

const sourceRoot = resolve(import.meta.dir, '../src');
const sources = collectSources(sourceRoot);
const entrypoints = new Set(
  Object.values(packageJson.exports).flatMap((entry) =>
    typeof entry === 'string'
      ? []
      : [resolve(sourceRoot, entry.default.replace('./dist/', '').replace(/\.js$/u, '.ts'))],
  ),
);

test('keeps exactly the six navigator capabilities as peers, without legacy directories', () => {
  expect(readdirSync(sourceRoot).sort()).toEqual(['features', 'navigator.ts', 'utils']);
  expect(readdirSync(join(sourceRoot, 'features')).sort()).toEqual([
    'custom',
    'drawer',
    'slot',
    'split-view',
    'stack',
    'tabs',
  ]);
  for (const file of sources.keys()) {
    expect(basename(file)).not.toBe('index.ts');
    expect(relative(sourceRoot, file).split('/')).not.toContain('shared');
    expect(relative(sourceRoot, file).split('/')).not.toContain('common');
    expect(relative(sourceRoot, file).split('/')).not.toContain('helpers');
    expect(relative(sourceRoot, file).split('/')).not.toContain('helper');
  }
});

test('gives implementation modules one matching export before private declarations', () => {
  for (const [file, source] of sources) {
    const declarations = source.statements.filter(
      (statement) => !ts.isImportDeclaration(statement),
    );
    const exports = declarations.filter(isExported);
    const facade = entrypoints.has(file) && declarations.every(ts.isExportDeclaration);
    if (facade) {
      for (const declaration of declarations) {
        expect(declaration.exportClause && ts.isNamedExports(declaration.exportClause)).toBe(true);
      }
      continue;
    }
    expect(exports.length, relative(sourceRoot, file)).toBe(1);
    expect(exports[0], relative(sourceRoot, file)).toBe(declarations[0]);
    expect(exportedName(exports[0]), relative(sourceRoot, file)).toBe(
      basename(file).replace(/\.tsx?$/u, ''),
    );
  }
});

test('keeps domain and application dependencies inward, including through utilities', () => {
  for (const [file] of sources) {
    if (!/\/features\/[^/]+\/(domain|application)\//u.test(file)) continue;
    assertInwardDependencies(file, file.includes('/domain/'), new Set());
  }
});

test('never uses a public package facade as an internal shortcut', () => {
  for (const [file, source] of sources) {
    for (const statement of source.statements.filter(ts.isImportDeclaration)) {
      const specifier = importSpecifier(statement);
      expect(specifier.startsWith('@ankhorage/navigator'), file).toBe(false);
      if (!specifier.startsWith('.')) continue;
      expect(entrypoints.has(resolveModule(file, specifier)), file).toBe(false);
    }
  }
});
function collectSources(directory: string): Map<string, ts.SourceFile> {
  return new Map(
    readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return [...collectSources(path)];
      if (!/\.tsx?$/u.test(path) || /\.test\.tsx?$/u.test(path)) return [];
      return [
        [path, ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true)],
      ];
    }),
  );
}

function isExported(statement: ts.Statement): boolean {
  return (
    ts.isExportDeclaration(statement) ||
    ts.isExportAssignment(statement) ||
    (ts.canHaveModifiers(statement) &&
      ts
        .getModifiers(statement)
        ?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) === true)
  );
}

function exportedName(statement: ts.Statement | undefined): string | undefined {
  if (statement === undefined) return undefined;
  if (ts.isVariableStatement(statement)) {
    expect(statement.declarationList.declarations).toHaveLength(1);
    return statement.declarationList.declarations[0]?.name.getText();
  }
  return ts.isFunctionDeclaration(statement) ||
    ts.isInterfaceDeclaration(statement) ||
    ts.isTypeAliasDeclaration(statement) ||
    ts.isClassDeclaration(statement) ||
    ts.isEnumDeclaration(statement)
    ? statement.name?.text
    : undefined;
}

function importSpecifier(statement: ts.ImportDeclaration): string {
  expect(ts.isStringLiteral(statement.moduleSpecifier)).toBe(true);
  return ts.isStringLiteral(statement.moduleSpecifier) ? statement.moduleSpecifier.text : '';
}

function resolveModule(file: string, specifier: string): string {
  const target = resolve(dirname(file), specifier);
  return sources.has(`${target}.ts`) ? `${target}.ts` : `${target}.tsx`;
}

function assertInwardDependencies(file: string, domainOnly: boolean, visited: Set<string>): void {
  if (visited.has(file)) return;
  visited.add(file);
  const source = sources.get(file);
  expect(source, file).toBeDefined();
  for (const statement of source?.statements.filter(ts.isImportDeclaration) ?? []) {
    const specifier = importSpecifier(statement);
    if (!specifier.startsWith('.')) {
      expect(specifier, file).toBe('@ankhorage/contracts/navigator');
      expect(statement.importClause?.isTypeOnly, file).toBe(true);
      continue;
    }
    const target = resolveModule(file, specifier);
    expect(target, file).not.toMatch(/\/(adapters|composition|cli)\//u);
    if (domainOnly) expect(target, file).not.toContain('/application/');
    assertInwardDependencies(target, domainOnly, visited);
  }
}
