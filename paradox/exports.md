# Public API

## createNavigatorPlan

Kind: `function`
Module: `src/expo-router/createNavigatorPlan.ts`
Source: `src/expo-router/createNavigatorPlan.ts:258:1`

Create a disposable, provider-aware plan from only the navigator desired-state slice.

### Signatures

- `(manifest: AppNavigatorManifest, options: CreateNavigatorPlanOptions) => NavigatorPlan`
  - manifest: `AppNavigatorManifest`
  - options: `CreateNavigatorPlanOptions`
  - returns: `NavigatorPlan`

## CreateNavigatorPlanOptions

Kind: `type`
Module: `src/expo-router/createNavigatorPlan.ts`
Source: `src/expo-router/createNavigatorPlan.ts:25:1`

### Members

| Name              | Kind     | Type                                   | Required | Description |
| ----------------- | -------- | -------------------------------------- | -------- | ----------- |
| expoRouterVersion | property | `string`                               | yes      |             |
| platform          | property | `NavigatorRuntimePlatform`             | yes      |             |
| responsiveSize    | property | `NavigatorResponsiveSize \| undefined` | no       |             |

## ExpoRouterNavigatorModule

Kind: `unknown`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:15:1`

## generateNavigatorFiles

Kind: `function`
Module: `src/generation/generateNavigatorFiles.ts`
Source: `src/generation/generateNavigatorFiles.ts:224:1`

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
Source: `src/definitions/NavigatorPlan.ts:24:1`

## NavigatorAdapterPlan

Kind: `type`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:48:1`

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
Source: `src/definitions/NavigatorPlan.ts:36:1`

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
Source: `src/definitions/NavigatorPlan.ts:134:1`

### Members

| Name     | Kind     | Type     | Required | Description |
| -------- | -------- | -------- | -------- | ----------- |
| contents | property | `string` | yes      |             |
| path     | property | `string` | yes      |             |

## NavigatorGenerationBindings

Kind: `type`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:125:1`

### Members

| Name    | Kind     | Type                                                                       | Required | Description |
| ------- | -------- | -------------------------------------------------------------------------- | -------- | ----------- |
| flows   | property | `{ onboardingRoute?: string; authenticationRoute?: string; } \| undefined` | no       |             |
| guards  | property | `Readonly<Record<string, NavigatorScreenModule>>`                          | yes      |             |
| screens | property | `Readonly<Record<string, NavigatorScreenModule>>`                          | yes      |             |

## NavigatorNodePlan

Kind: `type`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:81:1`

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
Source: `src/definitions/NavigatorPlan.ts:109:1`

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
Source: `src/definitions/NavigatorPlan.ts:69:1`

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
Source: `src/definitions/NavigatorPlan.ts:120:1`

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
Source: `src/definitions/NavigatorPlan.ts:43:1`

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
Source: `src/definitions/NavigatorPlan.ts:57:1`

## ResolvedTabsPresentation

Kind: `unknown`
Module: `src/definitions/NavigatorPlan.ts`
Source: `src/definitions/NavigatorPlan.ts:58:1`

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
Source: `src/definitions/NavigatorPlan.ts:60:1`

### Members

| Name                 | Kind     | Type                                    | Required | Description |
| -------------------- | -------- | --------------------------------------- | -------- | ----------- |
| customPresentationId | property | `string \| undefined`                   | no       |             |
| exportName           | property | `string`                                | yes      |             |
| implementation       | property | `ResolvedTabsImplementation`            | yes      |             |
| module               | property | `ExpoRouterNavigatorModule`             | yes      |             |
| presentation         | property | `ResolvedTabsPresentation \| undefined` | no       |             |
| stability            | property | `NavigatorApiStability`                 | yes      |             |

## validateNavigatorManifest

Kind: `function`
Module: `src/validation/validateNavigatorManifest.ts`
Source: `src/validation/validateNavigatorManifest.ts:268:1`

Validate one navigator desired-state slice for a concrete Expo Router target.

### Signatures

- `(manifest: AppNavigatorManifest, context: NavigatorValidationContext) => readonly NavigatorDiagnostic[]`
  - context: `NavigatorValidationContext`
  - manifest: `AppNavigatorManifest`
  - returns: `readonly NavigatorDiagnostic[]`
