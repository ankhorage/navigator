# Components

## HeadlessTabsLayout

Source: `src/features/tabs/adapters/inbound/HeadlessTabsLayout.tsx:17:1`

Render one stable headless Expo Router tab topology with Navigator-owned presentations.

Export paths: `src/features/tabs/tabs.ts`

| Prop               | Type                                                                  | Required | Default | Description |
| ------------------ | --------------------------------------------------------------------- | -------- | ------- | ----------- |
| customPresentation | `ComponentType<HeadlessTabsPresentationProps> \| undefined`           | no       | —       |             |
| initialRouteName   | `string \| undefined`                                                 | no       | —       |             |
| presentations      | `Readonly<Record<NavigatorResponsiveSize, ResolvedTabsPresentation>>` | yes      | —       |             |
| resolveIconSource  | `HeadlessTabsIconSourceResolver \| undefined`                         | no       | —       |             |
| routes             | `readonly HeadlessTabsRoute[]`                                        | yes      | —       |             |
