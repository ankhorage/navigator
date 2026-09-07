# Tabs → Split View

Explicit unsupported case: Split View cannot be nested beneath Tabs.

Navigator generation is intentionally rejected on every target. The runnable shell displays the expected diagnostics and must not be treated as a fallback implementation.

## Target matrix

| Platform | Support     | Capabilities                                  | Diagnostics                                        |
| -------- | ----------- | --------------------------------------------- | -------------------------------------------------- |
| android  | unsupported | split-view.two-column, tabs.javascript.bottom | invalid-split-view-placement, unsupported-platform |
| ios      | unsupported | split-view.two-column, tabs.javascript.bottom | invalid-split-view-placement                       |
| web      | unsupported | split-view.two-column, tabs.javascript.bottom | invalid-split-view-placement, unsupported-platform |

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
ankh navigator examples generate --id tabs-split-view --target .
```

The app declares only registry packages. It has its own lockfile and does not use a workspace, sibling source import, local tarball, or TypeScript path alias to Navigator.
