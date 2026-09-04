# Public API

## createNavigatorPlan

Kind: `function`
Module: `src/expo-router/createNavigatorPlan.ts`
Source: `src/expo-router/createNavigatorPlan.ts:96:1`

Create the complete standalone Navigator plan from only the navigator desired-state slice.

### Signatures

- `(manifest: AppNavigatorManifest, options: CreateNavigatorPlanOptions) => NavigatorPlan`
  - manifest: `AppNavigatorManifest`
  - options: `CreateNavigatorPlanOptions`
  - returns: `NavigatorPlan`

## CreateNavigatorPlanOptions

Kind: `type`
Module: `src/expo-router/createNavigatorPlan.ts`
Source: `src/expo-router/createNavigatorPlan.ts:18:1`

### Members

| Name           | Kind     | Type                                   | Required | Description |
| -------------- | -------- | -------------------------------------- | -------- | ----------- |
| platform       | property | `NavigatorRuntimePlatform`             | yes      |             |
| responsiveSize | property | `NavigatorResponsiveSize \| undefined` | no       |             |

## ExpoRouterNavigatorModule

Kind: `unknown`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:7:1`

## NAVIGATOR_PACKAGE_METADATA

Kind: `value`
Module: `src/metadata/index.ts`
Source: `src/metadata/index.ts:8:14`

## NavigatorApiStability

Kind: `unknown`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:5:1`

## NavigatorNodePlan

Kind: `type`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:34:1`

### Members

| Name       | Kind     | Type                             | Required | Description |
| ---------- | -------- | -------------------------------- | -------- | ----------- |
| exportName | property | `string`                         | yes      |             |
| module     | property | `ExpoRouterNavigatorModule`      | yes      |             |
| routes     | property | `NavigatorRoutePlan[]`           | yes      |             |
| tabs       | property | `TabsNavigatorPlan \| undefined` | no       |             |
| type       | property | `"stack" \| "tabs" \| "drawer"`  | yes      |             |

## NavigatorPlan

Kind: `type`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:42:1`

### Members

| Name         | Kind     | Type                                                | Required | Description |
| ------------ | -------- | --------------------------------------------------- | -------- | ----------- |
| flows        | property | `{ onboarding: boolean; authentication: boolean; }` | yes      |             |
| presetLayers | property | `readonly ("stack" \| "tabs" \| "drawer")[]`        | yes      |             |
| root         | property | `NavigatorNodePlan`                                 | yes      |             |

## NavigatorResponsiveSize

Kind: `unknown`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:4:1`

## NavigatorRoutePlan

Kind: `type`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:27:1`

### Members

| Name      | Kind     | Type                             | Required | Description |
| --------- | -------- | -------------------------------- | -------- | ----------- |
| name      | property | `string`                         | yes      |             |
| navigator | property | `NavigatorNodePlan \| undefined` | no       |             |
| path      | property | `string \| undefined`            | no       |             |
| screenId  | property | `string \| undefined`            | no       |             |

## NavigatorRuntimePlatform

Kind: `unknown`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:3:1`

## resolveCustomTabsPresentation

Kind: `function`
Module: `src/presentation/resolveCustomTabsPresentation.ts`
Source: `src/presentation/resolveCustomTabsPresentation.ts:39:1`

Resolve one custom-tabs presentation for the current semantic responsive size.

### Signatures

- `(config: Omit<CustomTabsConfig, "implementation">, size: NavigatorResponsiveSize) => ResolvedCustomTabsPresentation`
  - config: `Omit<CustomTabsConfig, "implementation">`
  - size: `NavigatorResponsiveSize`
  - returns: `ResolvedCustomTabsPresentation`

## ResolvedCustomTabsPresentation

Kind: `type`
Module: `src/presentation/resolveCustomTabsPresentation.ts`
Source: `src/presentation/resolveCustomTabsPresentation.ts:18:1`

### Members

| Name                 | Kind     | Type                       | Required | Description |
| -------------------- | -------- | -------------------------- | -------- | ----------- |
| customPresentationId | property | `string \| undefined`      | no       |             |
| presentation         | property | `ResolvedTabsPresentation` | yes      |             |

## ResolvedTabsImplementation

Kind: `unknown`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:15:1`

## ResolvedTabsPresentation

Kind: `unknown`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:16:1`

## resolveNavigatorPreset

Kind: `function`
Module: `src/topology/resolveNavigatorPreset.ts`
Source: `src/topology/resolveNavigatorPreset.ts:4:1`

Resolve a canonical navigator preset into its ordered topology layers.

### Signatures

- `(preset: "stack" | "tabs" | "drawer" | "tabs-stack" | "drawer-stack" | "drawer-tabs" | "drawer-tabs-stack" | "root-stack-tabs" | "root-stack-tabs-stack" | "root-stack-drawer" | "root-stack-drawer-stack" | "root-stack-drawer-tabs" | "root-stack-drawer-tabs-stack" | undefined, fallbackType: "stack" | "tabs" | "drawer") => readonly ("stack" | "tabs" | "drawer")[]`
  - fallbackType: `"stack" | "tabs" | "drawer"`
  - preset: `"stack" | "tabs" | "drawer" | "tabs-stack" | "drawer-stack" | "drawer-tabs" | "drawer-tabs-stack" | "root-stack-tabs" | "root-stack-tabs-stack" | "root-stack-drawer" | "root-stack-drawer-stack" | "root-stack-drawer-tabs" | "root-stack-drawer-tabs-stack" | undefined`
  - returns: `readonly ("stack" | "tabs" | "drawer")[]`

## resolveTabsNavigatorPlan

Kind: `function`
Module: `src/expo-router/resolveTabsNavigatorPlan.ts`
Source: `src/expo-router/resolveTabsNavigatorPlan.ts:79:1`

Resolve the Expo Router module/export and presentation for one tabs implementation.

### Signatures

- `(config: TabsImplementationConfig | undefined, platform: NavigatorRuntimePlatform, size: NavigatorResponsiveSize) => TabsNavigatorPlan`
  - config: `TabsImplementationConfig | undefined`
  - platform: `NavigatorRuntimePlatform`
  - size: `NavigatorResponsiveSize`
  - returns: `TabsNavigatorPlan`

## TabsNavigatorPlan

Kind: `type`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:18:1`

### Members

| Name                 | Kind     | Type                                    | Required | Description |
| -------------------- | -------- | --------------------------------------- | -------- | ----------- |
| customPresentationId | property | `string \| undefined`                   | no       |             |
| exportName           | property | `string`                                | yes      |             |
| implementation       | property | `ResolvedTabsImplementation`            | yes      |             |
| module               | property | `ExpoRouterNavigatorModule`             | yes      |             |
| presentation         | property | `ResolvedTabsPresentation \| undefined` | no       |             |
| stability            | property | `NavigatorApiStability`                 | yes      |             |
