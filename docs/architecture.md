# Navigator source ownership

Navigator capabilities are equal siblings under `src/features/`: `slot`, `stack`, `tabs`,
`drawer`, `split-view`, and `custom`. Only layers with an implementation are present.

| Feature      | Owned responsibilities                                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- |
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

`src/utils/` owns the genuinely cross-feature recursive plan and binding contracts, topology traversal,
shared route validation, generation orchestration, source-literal safety, and package metadata.
Shared generation handles the common `Screen` / `Protected` registration contract; specialized
layouts and feature-specific policy remain feature-owned. No feature imports the shared orchestration
back into its domain or application layer.

## Published entrypoints

| Public import                            | Explicit source entrypoint                |
| ---------------------------------------- | ----------------------------------------- |
| `@ankhorage/navigator`                   | `src/navigator.ts`                        |
| `@ankhorage/navigator/metadata`          | `src/utils/NAVIGATOR_PACKAGE_METADATA.ts` |
| `@ankhorage/navigator/tabs`              | `src/features/tabs/tabs.ts`               |
| `@ankhorage/navigator/tabs/native-icons` | `src/features/tabs/nativeIcons.ts`        |

Every production implementation module has one named export matching its filename, before private
helpers. The three deliberate public facades contain only explicit named re-exports of the existing
public API. They are package entrypoints, not internal convenience barrels. Production modules import
their actual dependency directly; there are no `index.ts` barrels, old-path aliases, or parallel
implementations. `package.json` maps the unchanged public subpaths to the new build locations.

## Verification and follow-up

`tests/sourceStructure.test.ts` checks the feature taxonomy, one-export modules, facade isolation,
and transitive inward dependencies. `tests/publicEntrypoints.test.ts` checks the published symbol
inventory and resolves every export to an implementation or type declaration. Cross-feature
behavior and generated consumer-layout typechecks live in `tests/` and run with `bun run test`.

CLI composition and thin `validate`, `plan`, and `generate` commands are tracked separately in
[issue #80](https://github.com/ankhorage/navigator/issues/80); no placeholder CLI directories are
created by this migration. The neutral cross-platform template catalog and visual acceptance matrix
remain separate work in [issue #79](https://github.com/ankhorage/navigator/issues/79).

This structural migration does not change rendering behavior or certify the visual appearance of
generated apps. Runtime visual acceptance on native and web belongs to the catalog follow-up.
