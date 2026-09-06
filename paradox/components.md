# Components

## CustomTabsLayout

Source: `src/tabs/CustomTabsLayout.tsx:218:1`

Render one stable headless Expo Router tab topology with Surface-owned presentations.

Export paths: `src/tabs/index.ts`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| customPresentation | `ComponentType<CustomTabsPresentationProps> \| undefined` | no | — |  |
| initialRouteName | `string \| undefined` | no | — |  |
| presentations | `Readonly<Record<NavigatorResponsiveSize, ResolvedTabsPresentation>>` | yes | — |  |
| resolveIconSource | `CustomTabsIconSourceResolver \| undefined` | no | — |  |
| routes | `readonly CustomTabsRoute[]` | yes | — |  |
