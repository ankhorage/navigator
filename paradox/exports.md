# Public API

## createNavigatorPlan

Kind: `function`
Module: `src/expo-router/createNavigatorPlan.ts`
Source: `src/expo-router/createNavigatorPlan.ts:283:1`

Create a disposable, provider-aware plan from only the navigator desired-state slice.

### Signatures

- `(manifest: AppNavigatorManifest, options: CreateNavigatorPlanOptions) => NavigatorPlan`
  - manifest: `AppNavigatorManifest`
  - options: `CreateNavigatorPlanOptions`
  - returns: `NavigatorPlan`

## CreateNavigatorPlanOptions

Kind: `type`
Module: `src/expo-router/createNavigatorPlan.ts`
Source: `src/expo-router/createNavigatorPlan.ts:26:1`

### Members

| Name              | Kind     | Type                                   | Required | Description |
| ----------------- | -------- | -------------------------------------- | -------- | ----------- |
| expoRouterVersion | property | `string`                               | yes      |             |
| platform          | property | `NavigatorRuntimePlatform`             | yes      |             |
| responsiveSize    | property | `NavigatorResponsiveSize \| undefined` | no       |             |

## CustomTabsIconSourceResolver

Kind: `unknown`
Module: `src/tabs/CustomTabsLayout.tsx`
Source: `src/tabs/CustomTabsLayout.tsx:40:1`

## CustomTabsLayout

Kind: `function`
Module: `src/tabs/CustomTabsLayout.tsx`
Source: `src/tabs/CustomTabsLayout.tsx:218:1`

Render one stable headless Expo Router tab topology with Surface-owned presentations.

### Signatures

- `({
routes,
presentations,
initialRouteName,
resolveIconSource,
customPresentation: CustomPresentation,
}: CustomTabsLayoutProps) => import("react").JSX.Element`
  - {
    routes,
    presentations,
    initialRouteName,
    resolveIconSource,
    customPresentation: CustomPresentation,
    }: `CustomTabsLayoutProps`
  - returns: `import("react").JSX.Element`

## CustomTabsLayoutProps

Kind: `type`
Module: `src/tabs/CustomTabsLayout.tsx`
Source: `src/tabs/CustomTabsLayout.tsx:46:1`

### Members

| Name               | Kind     | Type                                                                  | Required | Description |
| ------------------ | -------- | --------------------------------------------------------------------- | -------- | ----------- |
| customPresentation | property | `ComponentType<CustomTabsPresentationProps> \| undefined`             | no       |             |
| initialRouteName   | property | `string \| undefined`                                                 | no       |             |
| presentations      | property | `Readonly<Record<NavigatorResponsiveSize, ResolvedTabsPresentation>>` | yes      |             |
| resolveIconSource  | property | `CustomTabsIconSourceResolver \| undefined`                           | no       |             |
| routes             | property | `readonly CustomTabsRoute[]`                                          | yes      |             |

## CustomTabsPresentationProps

Kind: `type`
Module: `src/tabs/CustomTabsLayout.tsx`
Source: `src/tabs/CustomTabsLayout.tsx:30:1`

### Members

| Name       | Kind     | Type                                                       | Required | Description |
| ---------- | -------- | ---------------------------------------------------------- | -------- | ----------- |
| renderItem | property | `(route: CustomTabsRoute, compact?: boolean) => ReactNode` | yes      |             |
| routes     | property | `readonly CustomTabsRoute[]`                               | yes      |             |

## CustomTabsRoute

Kind: `type`
Module: `src/tabs/CustomTabsLayout.tsx`
Source: `src/tabs/CustomTabsLayout.tsx:21:1`

### Members

| Name    | Kind     | Type                                                              | Required | Description |
| ------- | -------- | ----------------------------------------------------------------- | -------- | ----------- |
| badge   | property | `ReactNode`                                                       | no       |             |
| href    | property | `string`                                                          | yes      |             |
| icon    | property | `import("@ankhorage/contracts/dist/types").IconSpec \| undefined` | no       |             |
| label   | property | `string`                                                          | yes      |             |
| name    | property | `string`                                                          | yes      |             |
| visible | property | `boolean`                                                         | yes      |             |

## ExpoRouterNavigatorModule

Kind: `unknown`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:15:1`

## generateNavigatorFiles

Kind: `function`
Module: `src/generation/generateNavigatorFiles.ts`
Source: `src/generation/generateNavigatorFiles.ts:212:1`

Generate deterministic Expo Router files from a validated disposable plan and narrow bindings.

### Signatures

- `(plan: NavigatorPlan, bindings: NavigatorGenerationBindings) => readonly NavigatorGeneratedFile[]`
  - bindings: `NavigatorGenerationBindings`
  - plan: `NavigatorPlan`
  - returns: `readonly NavigatorGeneratedFile[]`

## NAVIGATOR_PACKAGE_METADATA

Kind: `value`
Module: `src/metadata/index.ts`
Source: `src/metadata/index.ts:8:14`

## NavigatorAdapterId

Kind: `unknown`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:25:1`

## NavigatorAdapterPlan

Kind: `type`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:49:1`

### Members

| Name        | Kind     | Type                                     | Required | Description |
| ----------- | -------- | ---------------------------------------- | -------- | ----------- |
| exportName  | property | `string \| undefined`                    | no       |             |
| id          | property | `NavigatorAdapterId`                     | yes      |             |
| limitations | property | `readonly string[]`                      | yes      |             |
| module      | property | `ExpoRouterNavigatorModule \| undefined` | no       |             |
| stability   | property | `NavigatorApiStability`                  | yes      |             |
| support     | property | `NavigatorSupportStatus`                 | yes      |             |

## NavigatorApiStability

Kind: `unknown`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:12:1`

## NavigatorDiagnostic

Kind: `type`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:37:1`

### Members

| Name     | Kind     | Type                   | Required | Description |
| -------- | -------- | ---------------------- | -------- | ----------- |
| code     | property | `string`               | yes      |             |
| message  | property | `string`               | yes      |             |
| path     | property | `string`               | yes      |             |
| severity | property | `"error" \| "warning"` | yes      |             |

## NavigatorGeneratedFile

Kind: `type`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:146:1`

### Members

| Name     | Kind     | Type     | Required | Description |
| -------- | -------- | -------- | -------- | ----------- |
| contents | property | `string` | yes      |             |
| path     | property | `string` | yes      |             |

## NavigatorGenerationBindings

Kind: `type`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:135:1`

### Members

| Name               | Kind     | Type                                                                       | Required | Description |
| ------------------ | -------- | -------------------------------------------------------------------------- | -------- | ----------- |
| flows              | property | `{ onboardingRoute?: string; authenticationRoute?: string; } \| undefined` | no       |             |
| guards             | property | `Readonly<Record<string, NavigatorScreenModule>>`                          | yes      |             |
| iconSourceResolver | property | `NavigatorScreenModule \| undefined`                                       | no       |             |
| screens            | property | `Readonly<Record<string, NavigatorScreenModule>>`                          | yes      |             |
| tabPresentations   | property | `Readonly<Record<string, NavigatorScreenModule>> \| undefined`             | no       |             |

## NavigatorNodePlan

Kind: `type`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:91:1`

### Members

| Name             | Kind     | Type                                                                                                                                                                | Required | Description |
| ---------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- |
| adapter          | property | `NavigatorAdapterPlan`                                                                                                                                              | yes      |             |
| custom           | property | `{ navigatorId: string; config?: CustomNavigatorNode["config"]; } \| undefined`                                                                                     | no       |             |
| drawer           | property | `{ options?: DrawerNavigatorOptions; } \| undefined`                                                                                                                | no       |             |
| initialRouteName | property | `string \| undefined`                                                                                                                                               | no       |             |
| pointer          | property | `string`                                                                                                                                                            | yes      |             |
| routes           | property | `readonly NavigatorRoutePlan[]`                                                                                                                                     | yes      |             |
| splitView        | property | `{ columns: { primary: string; supplementary?: string; }; inspector?: string; topColumnForCollapsing?: "primary" \| "secondary" \| "supplementary"; } \| undefined` | no       |             |
| stack            | property | `{ implementation: StackImplementation; options?: StackScreenOptions; } \| undefined`                                                                               | no       |             |
| tabs             | property | `TabsNavigatorPlan \| undefined`                                                                                                                                    | no       |             |
| type             | property | `"slot" \| "drawer" \| "split-view" \| "custom" \| "stack" \| "tabs"`                                                                                               | yes      |             |

## NavigatorPlan

Kind: `type`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:119:1`

### Members

| Name        | Kind     | Type                                                | Required | Description |
| ----------- | -------- | --------------------------------------------------- | -------- | ----------- |
| context     | property | `NavigatorValidationContext`                        | yes      |             |
| diagnostics | property | `readonly NavigatorDiagnostic[]`                    | yes      |             |
| flows       | property | `{ onboarding: boolean; authentication: boolean; }` | yes      |             |
| root        | property | `NavigatorNodePlan`                                 | yes      |             |
| supported   | property | `boolean`                                           | yes      |             |

## NavigatorResponsiveSize

Kind: `unknown`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:11:1`

## NavigatorRoutePlan

Kind: `type`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:79:1`

### Members

| Name                    | Kind     | Type                                                              | Required | Description |
| ----------------------- | -------- | ----------------------------------------------------------------- | -------- | ----------- |
| guards                  | property | `readonly string[]`                                               | yes      |             |
| icon                    | property | `import("@ankhorage/contracts/dist/types").IconSpec \| undefined` | no       |             |
| label                   | property | `string \| undefined`                                             | no       |             |
| name                    | property | `string`                                                          | yes      |             |
| navigator               | property | `NavigatorNodePlan \| undefined`                                  | no       |             |
| path                    | property | `string \| undefined`                                             | no       |             |
| screenId                | property | `string \| undefined`                                             | no       |             |
| showInPrimaryNavigation | property | `boolean \| undefined`                                            | no       |             |
| stackOptions            | property | `StackScreenOptions \| undefined`                                 | no       |             |

## NavigatorRuntimePlatform

Kind: `unknown`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:10:1`

## NavigatorScreenModule

Kind: `type`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:130:1`

### Members

| Name       | Kind     | Type     | Required | Description |
| ---------- | -------- | -------- | -------- | ----------- |
| exportName | property | `string` | yes      |             |
| module     | property | `string` | yes      |             |

## NavigatorSupportStatus

Kind: `unknown`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:13:1`

## NavigatorValidationContext

Kind: `type`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:44:1`

### Members

| Name              | Kind     | Type                       | Required | Description |
| ----------------- | -------- | -------------------------- | -------- | ----------- |
| expoRouterVersion | property | `string`                   | yes      |             |
| platform          | property | `NavigatorRuntimePlatform` | yes      |             |

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
Source: `src/definitions/NavigatorPlan.ts:58:1`

## ResolvedTabsPresentation

Kind: `unknown`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:59:1`

## resolveNavigatorPreset

Kind: `function`
Module: `src/topology/resolveNavigatorPreset.ts`
Source: `src/topology/resolveNavigatorPreset.ts:4:1`

Resolve a canonical navigator preset into its ordered topology layers.

### Signatures

- `(preset: "slot" | "drawer" | "split-view" | "custom" | "stack" | "tabs" | "tabs-stack" | "drawer-stack" | "drawer-tabs" | "drawer-tabs-stack" | "root-stack-tabs" | "root-stack-tabs-stack" | "root-stack-drawer" | "root-stack-drawer-stack" | "root-stack-drawer-tabs" | "root-stack-drawer-tabs-stack" | undefined, fallbackType: "slot" | "drawer" | "split-view" | "custom" | "stack" | "tabs") => readonly ("slot" | "drawer" | "split-view" | "custom" | "stack" | "tabs")[]`
  - fallbackType: `"slot" | "drawer" | "split-view" | "custom" | "stack" | "tabs"`
  - preset: `"slot" | "drawer" | "split-view" | "custom" | "stack" | "tabs" | "tabs-stack" | "drawer-stack" | "drawer-tabs" | "drawer-tabs-stack" | "root-stack-tabs" | "root-stack-tabs-stack" | "root-stack-drawer" | "root-stack-drawer-stack" | "root-stack-drawer-tabs" | "root-stack-drawer-tabs-stack" | undefined`
  - returns: `readonly ("slot" | "drawer" | "split-view" | "custom" | "stack" | "tabs")[]`

## resolveTabsNavigatorPlan

Kind: `function`
Module: `src/expo-router/resolveTabsNavigatorPlan.ts`
Source: `src/expo-router/resolveTabsNavigatorPlan.ts:99:1`

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
Source: `src/definitions/NavigatorPlan.ts:67:1`

### Members

| Name                    | Kind     | Type                                                                               | Required | Description |
| ----------------------- | -------- | ---------------------------------------------------------------------------------- | -------- | ----------- |
| bottomAccessoryScreenId | property | `string \| undefined`                                                              | no       |             |
| customPresentationId    | property | `string \| undefined`                                                              | no       |             |
| exportName              | property | `string`                                                                           | yes      |             |
| implementation          | property | `ResolvedTabsImplementation`                                                       | yes      |             |
| minimizeBehavior        | property | `"automatic" \| "never" \| "onScrollDown" \| "onScrollUp" \| undefined`            | no       |             |
| module                  | property | `ExpoRouterNavigatorModule`                                                        | yes      |             |
| presentation            | property | `ResolvedTabsPresentation \| undefined`                                            | no       |             |
| presentations           | property | `Readonly<Record<NavigatorResponsiveSize, ResolvedTabsPresentation>> \| undefined` | no       |             |
| stability               | property | `NavigatorApiStability`                                                            | yes      |             |

## validateNavigatorManifest

Kind: `function`
Module: `src/validation/validateNavigatorManifest.ts`
Source: `src/validation/validateNavigatorManifest.ts:232:1`

Validate one navigator desired-state slice for a concrete Expo Router target.

### Signatures

- `(manifest: AppNavigatorManifest, context: NavigatorValidationContext) => readonly NavigatorDiagnostic[]`
  - context: `NavigatorValidationContext`
  - manifest: `AppNavigatorManifest`
  - returns: `readonly NavigatorDiagnostic[]`
