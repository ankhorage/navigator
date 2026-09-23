# @ankhorage/navigator

## 3.3.12

### Patch Changes

- e8e43af: Update Ankhorage dependencies: `@ankhorage/contracts`, `@ankhorage/surface`, `@ankhorage/utility`.

## 3.3.11

### Patch Changes

- 5df4e7f: Update Ankhorage dependencies: `@ankhorage/contracts`, `@ankhorage/surface`.

## 3.3.10

### Patch Changes

- 69b498f: Update Ankhorage dependencies: `@ankhorage/surface`.

## 3.3.9

### Patch Changes

- 91e627b: Update Ankhorage dependencies: `@ankhorage/surface`.

## 3.3.8

### Patch Changes

- 5cc615d: Update Ankhorage dependencies: `@ankhorage/contracts`, `@ankhorage/surface`.

## 3.3.7

### Patch Changes

- c94fb4c: Update Ankhorage dependencies: `@ankhorage/utility`.

## 3.3.6

### Patch Changes

- d7a3bac: Update Ankhorage dependencies: `@ankhorage/surface`.

## 3.3.5

### Patch Changes

- cb56e23: Update Ankhorage dependencies: `@ankhorage/contracts`.

## 3.3.4

### Patch Changes

- 4ccc15b: Update Ankhorage dependencies: `@ankhorage/surface`.

## 3.3.3

### Patch Changes

- 32c673d: Update Ankhorage dependencies: `@ankhorage/contracts`.

## 3.3.2

### Patch Changes

- e0096fa: Update Ankhorage dependencies: `@ankhorage/surface`.

## 3.3.1

### Patch Changes

- 58514d1: Update Ankhorage dependencies: `@ankhorage/contracts`, `@ankhorage/utility`.

## 3.3.0

### Minor Changes

- 9593f62: Add a Navigator-owned responsive workspace layout and generator for independently owned route trees, including contextual destinations, active ancestors, and an external return destination.

## 3.2.7

### Patch Changes

- 0fe2607: Update Ankhorage dependencies: `@ankhorage/paradox`, `@ankhorage/utility`.

## 3.2.6

### Patch Changes

- c81ebce: Use the current Surface View primitive for headless tab layout so generated apps do not render an undefined layout component.

## 3.2.5

### Patch Changes

- bafc773: Render responsive headless Tabs with deliberate 88 px rail and 280 px sidebar presentations,
  theme-backed spacing, full-width accessible route items, safe-area padding, separation, and
  vertical overflow.

## 3.2.4

### Patch Changes

- 0631b14: Bound headless tab slots to the available Navigator viewport so route-owned scroll views remain scrollable.

## 3.2.3

### Patch Changes

- 2693a73: Migrate Navigator-owned tab presentations to the Surface 4 foundation contract without restoring removed Surface navigation chrome, and keep the affected standalone examples synchronized with that dependency contract.

## 3.2.2

### Patch Changes

- fac3ba0: Update Ankhorage dependencies: `@ankhorage/utility`.

## 3.2.1

### Patch Changes

- f75005c: Keep standalone example applications and generated documentation synchronized with each published
  Navigator version, and restore example acceptance in repository-owned CI.

## 3.2.0

### Minor Changes

- 1c5e0ce: Render themed Headless Tabs surfaces, contain tab-screen overflow, hide unnamed group headers, and expose resolved Navigator header ownership.

## 3.1.0

### Minor Changes

- 04eaaa6: Add a public standalone example catalog, CLI generation and verification commands, 22 isolated root Expo apps, and catalog-derived cross-platform acceptance.

## 3.0.0

### Major Changes

- aad62a1: Add the standalone Catalog → Validate → Plan → Generate → Verify library and Ankh CLI workflow with package-owned capability metadata, structured dependency and diagnostic results, and explicit verification layers.

  Adopt the Contracts 12 Navigator taxonomy: remove Navigator-owned flows, rename the former custom Tabs implementation to headless, keep custom Tabs presentation and registered custom navigator topology distinct, and rename root-stack presets to their structural stack forms without compatibility aliases.

## 2.0.2

### Patch Changes

- a1a3549: Generate Prettier-stable multiline Native Tabs vector icons for long icon names.

## 2.0.1

### Patch Changes

- 2042acd: Emit formatter-stable Native Tabs vector icon source in generated Expo Router layouts.

## 2.0.0

### Major Changes

- 924561e: Move shared planning, generation, and extension type exports to `@ankhorage/contracts/navigator`; import those types from Contracts rather than Navigator. Keep CustomTabsLayout's implementation-only props private; derive component props with `ComponentProps<typeof CustomTabsLayout>` when needed. Group reused native-icon adapter types under `src/types/`, inline private helper types, and consume general serialization/import validation from Utility. Runtime exports and generated navigation behavior remain unchanged.

## 1.6.2

### Patch Changes

- ccf2f1a: Organize Navigator implementation by slot, stack, tabs, drawer, split-view, and custom features with explicit domain, application, and adapter ownership. Preserve the published package subpaths and symbols through named entrypoints, remove legacy source directories, and verify inward dependencies and public exports.

## 1.6.1

### Patch Changes

- 1147bbf: Update Ankhorage dependencies: `@ankhorage/surface`.

## 1.6.0

### Minor Changes

- 6f89769: Enable the Surface custom Tabs adapter on iOS and Android, including media-backed SVG route icons.

## 1.5.5

### Patch Changes

- 379f8b1: Update Ankhorage dependencies: `@ankhorage/surface`.

## 1.5.4

### Patch Changes

- 1d50715: Generate Native and custom Tabs layouts in canonical import and Prettier formatting.

## 1.5.3

### Patch Changes

- ca1fb9a: Separate package and application-alias imports in guarded generated layouts.

## 1.5.2

### Patch Changes

- cda4fdb: Emit generated Expo Router modules in the managed source format so fresh Studio applications pass lint and formatting without rewriting Navigator-owned files.

## 1.5.1

### Patch Changes

- 8fe4bf0: Hide JavaScript tab routes from primary navigation while preserving direct route access.

## 1.5.0

### Minor Changes

- fc5f4c3: Expose safe root-directory and layout-only generation options for consumers that own the Expo Router app shell.

## 1.4.0

### Minor Changes

- 146ffe1: Add immutable custom navigator registration with JSON schema validation, platform gates, and safe standard-router generation bindings.

## 1.3.0

### Minor Changes

- 567c719: Add constrained Expo Router Split View planning and generation with registered column screens, iPhone collapse metadata, and explicit Slot fallbacks.

## 1.2.0

### Minor Changes

- 8d4edc5: Add the gated Expo Router Experimental Stack adapter with strict option, version, Android mixing, predictive-back, and web-fallback diagnostics.

## 1.1.0

### Minor Changes

- 11f9f2e: Add native, JavaScript, and responsive Surface-owned headless Tabs generation.

## 1.0.0

### Major Changes

- d4026a0: Add validated, deterministic Expo Router planning and file generation for Slot, native and JavaScript Stack, and Drawer navigators.

## 0.1.1

### Patch Changes

- 7f21197: Update Ankhorage dependencies: `@ankhorage/contracts`.

## 0.1.0

### Minor Changes

- 4439933: Establish the standalone Navigator capability around `AppNavigatorManifest`, add canonical topology preset planning, adaptive native/Web tab planning, responsive custom Web presentations, and serializable authoring metadata.

All notable changes to this package will be documented in this file by Changesets.
