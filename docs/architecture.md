# Navigator source ownership

Navigator capabilities are equal siblings under `src/features/`: `catalog`, `slot`, `stack`,
`tabs`, `drawer`, `split-view`, and `custom`. Only layers with an implementation are present.

| Feature      | Owned responsibilities                                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `catalog`    | Package-owned topology, implementation, presentation, preset, target support, stability, requirements, and evidence        |
| `slot`       | Stateless adapter plan, Slot constraints, layout output                                                                    |
| `stack`      | Configuration precedence, native/JavaScript/experimental adapter selection, Stack diagnostics                              |
| `tabs`       | Configuration and presentation policy, adapter planning, generated Tabs layouts, headless runtime and native icon adapters |
| `drawer`     | Drawer adapter selection and screen-option translation                                                                     |
| `split-view` | Placement and column constraints, platform fallback planning, generated column bindings                                    |
| `custom`     | Immutable registration contract, portable config validation, registered adapter planning                                   |

Domain modules contain portable policy and type-only manifest contracts, without framework or SDK
imports. Application modules resolve plain configuration into adapter descriptions; they do not load
the described runtime modules. Inbound adapters bind the runtime UI to Expo Router and Surface.
Outbound adapters translate plans into generated Expo Router source.

`src/utils/` owns genuinely cross-feature topology traversal, shared route validation, generation
orchestration, Router-version policy, verification, and package metadata. Portable public planning,
generation, catalog, and extension contracts are owned by `@ankhorage/contracts/navigator`, not by
`utils/`.
Shared generation handles the common `Screen` / `Protected` registration contract; specialized
layouts and feature-specific policy remain feature-owned. No feature imports the shared orchestration
back into its domain or application layer.

`src/cli/` is the package composition boundary for `ankh navigator`. Its adapters perform the
explicit JSON reads, custom-registry module load, and generated-file writes. Command handlers call
the same public Catalog → Validate → Plan → Generate → Verify functions used by library consumers;
there is no second CLI policy table.

## Published entrypoints

| Public import                            | Explicit source entrypoint                |
| ---------------------------------------- | ----------------------------------------- |
| `@ankhorage/navigator`                   | `src/navigator.ts`                        |
| `@ankhorage/navigator/cli`               | `src/cli/createCliProvider.ts`            |
| `@ankhorage/navigator/metadata`          | `src/utils/NAVIGATOR_PACKAGE_METADATA.ts` |
| `@ankhorage/navigator/tabs`              | `src/features/tabs/tabs.ts`               |
| `@ankhorage/navigator/tabs/native-icons` | `src/features/tabs/nativeIcons.ts`        |

Every production implementation module has one named runtime export matching its filename, before
private types and helpers. The deliberate public facades contain only explicit named runtime
re-exports. They are package entrypoints, not internal convenience barrels. Production modules import
their actual dependency directly; there are no `index.ts` barrels, old-path aliases, or parallel
implementations. `package.json` maps the unchanged public subpaths to the new build locations.

## Type and utility ownership

- Single-module types, including Custom Tabs props and the resolved Stack configuration source,
  live below their owning function without exports. Component consumers can derive props using
  `ComponentProps<typeof HeadlessTabsLayout>` instead of depending on private type names.
- Reused repository-local types are grouped by topic in `src/types/`. The native icon family adapter
  contract is reused by five adapters and belongs in `src/types/nativeIcons.ts`.
- Portable public types are imported directly from `@ankhorage/contracts/navigator`. Their canonical
  declarations are grouped by planning, generation, and custom-extension topics in Contracts.
  Navigator does not retain compatibility re-exports of these types.
- `quoteJavaScriptString`, `serializeJavaScriptLiteral`, and `assertStaticImportBinding` are general
  code-generation utilities consumed from Utility's `string` and `validation` subpaths. The former
  JSX quoting wrapper is replaced by `JSON.stringify` directly.
- `parseExpoRouterMajor` remains Navigator-owned: its accepted Router-version syntax differs from
  Utility's exact three-part `parseSemanticVersion` API. Substituting that API would change behavior.

Navigator imports the published Contracts 12 taxonomy and standalone `isAppNavigatorManifest`
parser. `flows` has no Navigator replacement. Headless Tabs replaces the former custom
implementation name without a compatibility alias; a custom presentation and the registered custom
navigator topology remain separate public concepts.

## Verification and follow-up

`tests/sourceStructure.test.ts` checks the feature taxonomy, runtime-only implementation exports,
topic type modules, facade isolation, and transitive inward dependencies.
`tests/publicEntrypoints.test.ts` checks runtime exports and absence of old type re-exports;
`tests/contractsBoundary.test.ts` exercises the shared public Contracts boundary. Cross-feature
behavior and generated consumer-layout typechecks live in `tests/` and run with `bun run test`.

The public verifier proves only Navigator-owned structural and deterministic generation behavior.
Its remaining install, export, browser, simulator, and device checks are deliberately `unverified`
until an independently installed example records that evidence. This prevents a successful typecheck
or non-native Slot fallback from being presented as native runtime proof.
