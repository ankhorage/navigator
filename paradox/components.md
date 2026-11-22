# Components

## HeadlessTabsLayout

Source: `src/features/tabs/adapters/inbound/HeadlessTabsLayout.tsx:22:1`

Render one stable headless Expo Router tab topology with Navigator-owned presentations.

Export paths: `src/features/tabs/tabs.ts`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| customPresentation | `ComponentType<HeadlessTabsPresentationProps> \| undefined` | no | — |  |
| customPresentationOrientation | `HeadlessTabsPresentationOrientation \| undefined` | no | `'horizontal'` |  |
| initialRouteName | `string \| undefined` | no | — |  |
| presentations | `Readonly<Record<NavigatorResponsiveSize, ResolvedTabsPresentation>>` | yes | — |  |
| routes | `readonly HeadlessTabsRoute[]` | yes | — |  |

## WorkspaceNavigator

Source: `src/features/workspace/adapters/inbound/WorkspaceNavigator.tsx:14:1`

Render accessible unthemed workspace navigation around Expo Router page content.

Export paths: `src/workspace.ts`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| activeRouteId | `string` | yes | — |  |
| exit | `WorkspaceExitDestination \| undefined` | no | — |  |
| onNavigate | `(routeId: string) => void \| undefined` | no | — |  |
| routes | `readonly WorkspaceNavigationRoute[]` | yes | — |  |
| title | `string` | yes | — |  |
