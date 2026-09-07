# Tabs

Native Tabs on iOS and Android with explicit unsupported Web status.

The checked-in Router files were generated for `ios` through the public Navigator API. The manifest uses an implementation whose generated source is shared by every supported target listed below.

## Target matrix

| Platform | Support     | Capabilities | Diagnostics                         |
| -------- | ----------- | ------------ | ----------------------------------- |
| android  | supported   | tabs.native  | alpha-adapter                       |
| ios      | supported   | tabs.native  | alpha-adapter                       |
| web      | unsupported | tabs.native  | alpha-adapter, unsupported-platform |

## Install and run

```sh
bun install --frozen-lockfile
bun run typecheck
bun run start
```

Use `bun run web`, `bun run ios`, or `bun run android` only for targets reported as supported or testing-only above.

## Regenerate

From an installed Ankh CLI environment:

```sh
ankh navigator examples generate --id tabs --target .
```

The app declares only registry packages. It has its own lockfile and does not use a workspace, sibling source import, local tarball, or TypeScript path alias to Navigator.
