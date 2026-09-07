# Navigator standalone examples

Each directory below is an isolated Expo Router application generated from its checked-in manifest and bindings through Navigator's public API. Every app owns its package metadata and lockfile and depends only on registry packages.

| Example                                                | Composition                   | Target status                                             |
| ------------------------------------------------------ | ----------------------------- | --------------------------------------------------------- |
| [`drawer`](./drawer)                                   | Drawer                        | android: supported; ios: supported; web: supported        |
| [`drawer-split-view`](./drawer-split-view)             | Drawer → Split View           | android: unsupported; ios: unsupported; web: unsupported  |
| [`drawer-stack`](./drawer-stack)                       | Drawer → Stack                | android: supported; ios: supported; web: supported        |
| [`drawer-tabs`](./drawer-tabs)                         | Drawer → Tabs                 | android: supported; ios: supported; web: supported        |
| [`drawer-tabs-stack`](./drawer-tabs-stack)             | Drawer → Tabs → Stack         | android: supported; ios: supported; web: supported        |
| [`drawer-tabs-top`](./drawer-tabs-top)                 | Drawer → Top Tabs             | android: supported; ios: supported; web: supported        |
| [`registered-custom`](./registered-custom)             | Registered custom navigator   | android: supported; ios: supported; web: supported        |
| [`slot`](./slot)                                       | Slot                          | android: supported; ios: supported; web: supported        |
| [`split-view-three-column`](./split-view-three-column) | Split View — three column     | android: unsupported; ios: testing-only; web: unsupported |
| [`split-view-two-column`](./split-view-two-column)     | Split View — two column       | android: unsupported; ios: testing-only; web: unsupported |
| [`stack`](./stack)                                     | Stack                         | android: supported; ios: supported; web: supported        |
| [`stack-drawer`](./stack-drawer)                       | Stack → Drawer                | android: supported; ios: supported; web: supported        |
| [`stack-drawer-stack`](./stack-drawer-stack)           | Stack → Drawer → Stack        | android: supported; ios: supported; web: supported        |
| [`stack-drawer-tabs`](./stack-drawer-tabs)             | Stack → Drawer → Tabs         | android: supported; ios: supported; web: supported        |
| [`stack-drawer-tabs-stack`](./stack-drawer-tabs-stack) | Stack → Drawer → Tabs → Stack | android: supported; ios: supported; web: supported        |
| [`stack-tabs`](./stack-tabs)                           | Stack → Tabs                  | android: supported; ios: supported; web: supported        |
| [`stack-tabs-stack`](./stack-tabs-stack)               | Stack → Tabs → Stack          | android: supported; ios: supported; web: supported        |
| [`stack-tabs-top`](./stack-tabs-top)                   | Stack → Top Tabs              | android: supported; ios: supported; web: supported        |
| [`tabs`](./tabs)                                       | Tabs                          | android: supported; ios: supported; web: unsupported      |
| [`tabs-bottom-tabs-top`](./tabs-bottom-tabs-top)       | Bottom Tabs → Top Tabs        | android: supported; ios: supported; web: supported        |
| [`tabs-split-view`](./tabs-split-view)                 | Tabs → Split View             | android: unsupported; ios: unsupported; web: unsupported  |
| [`tabs-stack`](./tabs-stack)                           | Tabs → Stack                  | android: supported; ios: supported; web: supported        |

## Generate and verify

From the Navigator repository root:

```sh
bun run examples:generate
bun run examples:verify
bun run examples:validate
```

Open an individual directory for its install, run, target-support, and diagnostics instructions. Unsupported compositions remain catalogued explicitly and are not counted as runtime support.
