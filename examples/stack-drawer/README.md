# Stack → Drawer

Neutral entry Stack followed by a Drawer.

The checked-in Router files were generated for `web` through the public Navigator API. The manifest uses an implementation whose generated source is shared by every supported target listed below.

## Target matrix

| Platform | Support   | Capabilities         | Diagnostics |
| -------- | --------- | -------------------- | ----------- |
| android  | supported | drawer, stack.native | none        |
| ios      | supported | drawer, stack.native | none        |
| web      | supported | drawer, stack.native | none        |

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
ankh navigator examples generate --id stack-drawer --target .
```

The app declares only registry packages. It has its own lockfile and does not use a workspace, sibling source import, local tarball, or TypeScript path alias to Navigator.
