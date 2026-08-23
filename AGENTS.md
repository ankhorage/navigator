# AGENTS.md

## Scope

This file applies to the whole `ankhorage/zora-navigation` repository.

`@ankhorage/zora-navigation` is the optional navigation extension for ZORA. It owns reusable, theme-aware navigation components for React Native and React Native Web and their supported Expo Router integration. Keep it standalone, app-agnostic, and consumable outside Studio.

## Repository facts

- Package name: `@ankhorage/zora-navigation`.
- Runtime: Bun 1.3.14.
- Node baseline: Node 24 LTS.
- Language: TypeScript 6, ESM, strict mode.
- Renderer target: React Native and React Native Web.
- Main source root: `src/`.
- Build output: `dist/`.
- Public root export: `src/index.ts`.
- Documentation: Paradox.
- Release management: Changesets.

## Mandatory instructions

Before planning or editing:

1. Read this file completely.
2. Load and follow the installed Ankhorage package-structure skill.
3. Load the relevant Expo Router and Expo upgrade skills for Router-facing work.
4. Inspect current public exports, dependency versions, tests, and upstream Expo Router documentation.
5. Run the repository's Devtools and validation gates before handoff.

## Ownership

### This package owns

- ZORA-themed navigation presentation.
- Reusable Tabs and Drawer components.
- Responsive navigation presentation across native and Web.
- Public, typed navigation-item and presentation contracts.
- Stable integration with supported Expo Router public entry points.
- Navigation accessibility and keyboard behavior where applicable.
- Package-level tests, examples, metadata, and documentation.

### This package does not own

- Application-specific route files or route topology.
- Studio generation behavior.
- Authentication, sessions, roles, or authorization policy.
- Server-side access control.
- Application manifests or route-data ownership.
- Expo Router internals or compatibility rewrites.
- Surface primitives that are reusable below the ZORA layer.

Consumers provide route names, hrefs, labels, icons, resolved guards, and responsive configuration. Studio may generate those values, but Studio must not become the owner of reusable ZORA navigation adapters.

## Package boundaries

- Use released package APIs only; never import sibling repository source.
- `@ankhorage/zora` supplies the visual language, components, and theme.
- `@ankhorage/surface` remains the lower-level foundation; prefer ZORA-facing APIs.
- Expo Router owns navigation state, deep linking, history, route protection, and native navigator behavior.
- Platform and native singleton dependencies must be peer dependencies when consumers must own compatible instances.
- Do not import external `@react-navigation/*` packages when the supported Expo Router entry point owns the API.
- Do not deep-import `expo-router/build/**`, `expo-router/internal/**`, or other implementation paths.
- Do not adopt unstable or experimental Router APIs without an explicit issue decision and acceptance coverage.

## Navigation semantics

Keep these concepts separate:

- visibility controls whether an item appears in navigation UI;
- protection controls whether client-side navigation may reach a route;
- authorization remains a server/backend responsibility;
- responsive presentation changes visual/navigator form, not route identity.

A responsive transition must preserve the current route, typed params, browser history, nested state where supported, focus behavior, and hydration correctness.

## Public API rules

- Keep the public surface minimal and intentional.
- Prefer serializable item and presentation contracts.
- Preserve typed Expo Router hrefs and route parameters.
- Use ZORA theme tokens for defaults.
- Expose typed pass-through options for supported navigators rather than copying every upstream option into a parallel API.
- Do not expose app-specific stores, auth clients, or generated types.
- Do not add compatibility aliases or unsafe casts.
- Update exports, tests, docs, and a Changeset together for public behavior.

## Code quality

- Strict TypeScript only.
- No `any`, `as any`, `unknown as any`, `@ts-ignore`, or `@ts-expect-error`.
- Do not disable or weaken lint rules to make code pass.
- Keep one focused public concept per module.
- Name utility files after their single exported function.
- Async utility functions use the `Async` suffix.
- Keep generated output in `dist/`, never in `src/`.

## Devtools ownership

Ankhorage Devtools owns shared ESLint, Prettier, Knip, workflow, VS Code, package-script, and Bun-runtime policy.

Use:

```bash
bunx @ankhorage/ankh devtools sync .
bunx @ankhorage/ankh devtools status .
```

Do not hand-edit Devtools-owned files after the final synchronization. Put narrow repository-specific ESLint additions in `eslint.local.config.mjs`.

## Validation

Run the applicable full gate:

```bash
bun install --frozen-lockfile
bun run build
bun run lint
bun run test
bun run knip
bun run typecheck
bun run format:check
bun run docs
bun run changeset:status
bunx @ankhorage/ankh doctor validate .
git diff --check
```

For Router behavior, also validate representative generated or example apps on Web, Android, and iOS using their own installed Expo toolchain.

## Changesets

Add a Changeset for every public component, prop, type, metadata, dependency contract, or behavior change. Do not manually edit the package version.

## Agent handoff

Report:

1. files changed and why;
2. public API and peer-dependency changes;
3. Changeset path;
4. exact skills used;
5. validation results and any environment-limited native proof.
