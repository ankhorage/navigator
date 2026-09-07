# Components

## CustomTabsLayout

Source: `src/features/tabs/adapters/inbound/CustomTabsLayout.tsx:20:1`

Render one stable headless Expo Router tab topology with Surface-owned presentations.

Export paths: `src/features/tabs/tabs.ts`

| Prop               | Type                                                                  | Required | Default | Description |
| ------------------ | --------------------------------------------------------------------- | -------- | ------- | ----------- |
| customPresentation | `ComponentType<CustomTabsPresentationProps> \| undefined`             | no       | —       |             |
| initialRouteName   | `string \| undefined`                                                 | no       | —       |             |
| presentations      | `Readonly<Record<NavigatorResponsiveSize, ResolvedTabsPresentation>>` | yes      | —       |             |
| resolveIconSource  | `CustomTabsIconSourceResolver \| undefined`                           | no       | —       |             |
| routes             | `readonly CustomTabsRoute[]`                                          | yes      | —       |             |
