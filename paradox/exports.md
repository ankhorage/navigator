# Public API

## createNavigatorPlan

Kind: `function`
Module: `src/utils/createNavigatorPlan.ts`
Source: `src/utils/createNavigatorPlan.ts:29:1`

Create a disposable, provider-aware plan from only the navigator desired-state slice.

### Signatures

- `(manifest: AppNavigatorManifest, options: CreateNavigatorPlanOptions) => NavigatorPlan`
  - manifest: `AppNavigatorManifest`
  - options: `CreateNavigatorPlanOptions`
  - returns: `NavigatorPlan`

## CreateNavigatorPlanOptions

Kind: `type`
Module: `src/utils/CreateNavigatorPlanOptions.ts`
Source: `src/utils/CreateNavigatorPlanOptions.ts:5:1`

### Members

| Name              | Kind     | Type                                   | Required | Description |
| ----------------- | -------- | -------------------------------------- | -------- | ----------- |
| customNavigators  | property | `CustomNavigatorRegistry \| undefined` | no       |             |
| expoRouterVersion | property | `string`                               | yes      |             |
| platform          | property | `NavigatorRuntimePlatform`             | yes      |             |
| responsiveSize    | property | `NavigatorResponsiveSize \| undefined` | no       |             |

## CustomNavigatorConfigIssue

Kind: `type`
Module: `src/features/custom/domain/CustomNavigatorConfigIssue.ts`
Source: `src/features/custom/domain/CustomNavigatorConfigIssue.ts:1:1`

### Members

| Name    | Kind     | Type                  | Required | Description |
| ------- | -------- | --------------------- | -------- | ----------- |
| code    | property | `string`              | yes      |             |
| message | property | `string`              | yes      |             |
| path    | property | `string \| undefined` | no       |             |

## CustomNavigatorRegistration

Kind: `type`
Module: `src/features/custom/domain/CustomNavigatorRegistration.ts`
Source: `src/features/custom/domain/CustomNavigatorRegistration.ts:7:1`

### Members

| Name           | Kind     | Type                                                                               | Required | Description |
| -------------- | -------- | ---------------------------------------------------------------------------------- | -------- | ----------- |
| exportName     | property | `string`                                                                           | yes      |             |
| id             | property | `string`                                                                           | yes      |             |
| integration    | property | `"expo-router-standard"`                                                           | yes      |             |
| module         | property | `string`                                                                           | yes      |             |
| platforms      | property | `readonly NavigatorRuntimePlatform[]`                                              | yes      |             |
| router         | property | `"stack" \| "tab"`                                                                 | yes      |             |
| stability      | property | `NavigatorApiStability`                                                            | yes      |             |
| validateConfig | property | `(config: CustomNavigatorNode["config"]) => readonly CustomNavigatorConfigIssue[]` | yes      |             |

## CustomNavigatorRegistry

Kind: `unknown`
Module: `src/features/custom/domain/CustomNavigatorRegistry.ts`
Source: `src/features/custom/domain/CustomNavigatorRegistry.ts:3:1`

## CustomTabsIconSourceResolver

Kind: `unknown`
Module: `src/features/tabs/adapters/inbound/CustomTabsIconSourceResolver.ts`
Source: `src/features/tabs/adapters/inbound/CustomTabsIconSourceResolver.ts:4:1`

## CustomTabsLayout

Kind: `function`
Module: `src/features/tabs/adapters/inbound/CustomTabsLayout.tsx`
Source: `src/features/tabs/adapters/inbound/CustomTabsLayout.tsx:23:1`

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
Module: `src/features/tabs/adapters/inbound/CustomTabsLayoutProps.ts`
Source: `src/features/tabs/adapters/inbound/CustomTabsLayoutProps.ts:13:1`

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
Module: `src/features/tabs/adapters/inbound/CustomTabsPresentationProps.ts`
Source: `src/features/tabs/adapters/inbound/CustomTabsPresentationProps.ts:5:1`

### Members

| Name       | Kind     | Type                                                       | Required | Description |
| ---------- | -------- | ---------------------------------------------------------- | -------- | ----------- |
| renderItem | property | `(route: CustomTabsRoute, compact?: boolean) => ReactNode` | yes      |             |
| routes     | property | `readonly CustomTabsRoute[]`                               | yes      |             |

## CustomTabsRoute

Kind: `type`
Module: `src/features/tabs/adapters/inbound/CustomTabsRoute.ts`
Source: `src/features/tabs/adapters/inbound/CustomTabsRoute.ts:5:1`

### Members

| Name    | Kind     | Type                                                   | Required | Description |
| ------- | -------- | ------------------------------------------------------ | -------- | ----------- |
| badge   | property | `ReactNode`                                            | no       |             |
| href    | property | `string`                                               | yes      |             |
| icon    | property | `import("@ankhorage/contracts").IconSpec \| undefined` | no       |             |
| label   | property | `string`                                               | yes      |             |
| name    | property | `string`                                               | yes      |             |
| visible | property | `boolean`                                              | yes      |             |

## defineCustomNavigatorRegistry

Kind: `function`
Module: `src/features/custom/domain/defineCustomNavigatorRegistry.ts`
Source: `src/features/custom/domain/defineCustomNavigatorRegistry.ts:7:1`

Define an immutable, duplicate-free custom navigator registry for one composition boundary.

### Signatures

- `(registrations: readonly CustomNavigatorRegistration[]) => CustomNavigatorRegistry`
  - registrations: `readonly CustomNavigatorRegistration[]`
  - returns: `CustomNavigatorRegistry`

## ExpoRouterNavigatorModule

Kind: `unknown`
Module: `src/utils/ExpoRouterNavigatorModule.ts`
Source: `src/utils/ExpoRouterNavigatorModule.ts:1:1`

## generateNavigatorFiles

Kind: `function`
Module: `src/utils/generateNavigatorFiles.ts`
Source: `src/utils/generateNavigatorFiles.ts:18:1`

Generate deterministic Expo Router files from a validated disposable plan and narrow bindings.

### Signatures

- `(plan: NavigatorPlan, bindings: NavigatorGenerationBindings, options?: NavigatorGenerationOptions) => readonly NavigatorGeneratedFile[]`
  - bindings: `NavigatorGenerationBindings`
  - options: `NavigatorGenerationOptions` (optional)
  - plan: `NavigatorPlan`
  - returns: `readonly NavigatorGeneratedFile[]`

## NativeFontAwesome5Family

Kind: `value`
Module: `src/features/tabs/adapters/inbound/NativeFontAwesome5Family.ts`
Source: `src/features/tabs/adapters/inbound/NativeFontAwesome5Family.ts:9:14`

Regular-style Font Awesome 5 family adapter for Expo Native Tabs.

## NativeFontAwesome6Family

Kind: `value`
Module: `src/features/tabs/adapters/inbound/NativeFontAwesome6Family.ts`
Source: `src/features/tabs/adapters/inbound/NativeFontAwesome6Family.ts:10:14`

Regular-style Font Awesome 6 family adapter for Expo Native Tabs.

## NativeFontAwesomeFamily

Kind: `value`
Module: `src/features/tabs/adapters/inbound/NativeFontAwesomeFamily.ts`
Source: `src/features/tabs/adapters/inbound/NativeFontAwesomeFamily.ts:6:14`

Ionicons-compatible Font Awesome family adapter for Expo Native Tabs.

## NativeIoniconsFamily

Kind: `value`
Module: `src/features/tabs/adapters/inbound/NativeIoniconsFamily.ts`
Source: `src/features/tabs/adapters/inbound/NativeIoniconsFamily.ts:6:14`

Ionicons family adapter for Expo Native Tabs.

## NativeMaterialDesignIconsFamily

Kind: `value`
Module: `src/features/tabs/adapters/inbound/NativeMaterialDesignIconsFamily.ts`
Source: `src/features/tabs/adapters/inbound/NativeMaterialDesignIconsFamily.ts:6:14`

Material Design Icons family adapter for Expo Native Tabs.

## NAVIGATOR_PACKAGE_METADATA

Kind: `value`
Module: `src/utils/NAVIGATOR_PACKAGE_METADATA.ts`
Source: `src/utils/NAVIGATOR_PACKAGE_METADATA.ts:8:14`

## NavigatorAdapterId

Kind: `unknown`
Module: `src/utils/NavigatorAdapterId.ts`
Source: `src/utils/NavigatorAdapterId.ts:1:1`

## NavigatorAdapterPlan

Kind: `type`
Module: `src/utils/NavigatorAdapterPlan.ts`
Source: `src/utils/NavigatorAdapterPlan.ts:5:1`

### Members

| Name        | Kind     | Type                     | Required | Description |
| ----------- | -------- | ------------------------ | -------- | ----------- |
| exportName  | property | `string \| undefined`    | no       |             |
| id          | property | `NavigatorAdapterId`     | yes      |             |
| limitations | property | `readonly string[]`      | yes      |             |
| module      | property | `string \| undefined`    | no       |             |
| stability   | property | `NavigatorApiStability`  | yes      |             |
| support     | property | `NavigatorSupportStatus` | yes      |             |

## NavigatorApiStability

Kind: `unknown`
Module: `src/utils/NavigatorApiStability.ts`
Source: `src/utils/NavigatorApiStability.ts:1:1`

## NavigatorDiagnostic

Kind: `type`
Module: `src/utils/NavigatorDiagnostic.ts`
Source: `src/utils/NavigatorDiagnostic.ts:1:1`

### Members

| Name     | Kind     | Type                   | Required | Description |
| -------- | -------- | ---------------------- | -------- | ----------- |
| code     | property | `string`               | yes      |             |
| message  | property | `string`               | yes      |             |
| path     | property | `string`               | yes      |             |
| severity | property | `"error" \| "warning"` | yes      |             |

## NavigatorGeneratedFile

Kind: `type`
Module: `src/utils/NavigatorGeneratedFile.ts`
Source: `src/utils/NavigatorGeneratedFile.ts:1:1`

### Members

| Name     | Kind     | Type     | Required | Description |
| -------- | -------- | -------- | -------- | ----------- |
| contents | property | `string` | yes      |             |
| path     | property | `string` | yes      |             |

## NavigatorGenerationBindings

Kind: `type`
Module: `src/utils/NavigatorGenerationBindings.ts`
Source: `src/utils/NavigatorGenerationBindings.ts:3:1`

### Members

| Name               | Kind     | Type                                                                       | Required | Description |
| ------------------ | -------- | -------------------------------------------------------------------------- | -------- | ----------- |
| flows              | property | `{ onboardingRoute?: string; authenticationRoute?: string; } \| undefined` | no       |             |
| guards             | property | `Readonly<Record<string, NavigatorScreenModule>>`                          | yes      |             |
| iconSourceResolver | property | `NavigatorScreenModule \| undefined`                                       | no       |             |
| screens            | property | `Readonly<Record<string, NavigatorScreenModule>>`                          | yes      |             |
| tabPresentations   | property | `Readonly<Record<string, NavigatorScreenModule>> \| undefined`             | no       |             |

## NavigatorGenerationOptions

Kind: `type`
Module: `src/utils/NavigatorGenerationOptions.ts`
Source: `src/utils/NavigatorGenerationOptions.ts:2:1`

### Members

| Name               | Kind     | Type                   | Required | Description |
| ------------------ | -------- | ---------------------- | -------- | ----------- |
| includeScreenFiles | property | `boolean \| undefined` | no       |             |
| rootDirectory      | property | `string \| undefined`  | no       |             |

## NavigatorNodePlan

Kind: `type`
Module: `src/utils/NavigatorNodePlan.ts`
Source: `src/utils/NavigatorNodePlan.ts:13:1`

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
| type             | property | `"stack" \| "custom" \| "slot" \| "drawer" \| "split-view" \| "tabs"`                                                                                               | yes      |             |

## NavigatorPlan

Kind: `type`
Module: `src/utils/NavigatorPlan.ts`
Source: `src/utils/NavigatorPlan.ts:5:1`

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
Module: `src/utils/NavigatorResponsiveSize.ts`
Source: `src/utils/NavigatorResponsiveSize.ts:1:1`

## NavigatorRoutePlan

Kind: `type`
Module: `src/utils/NavigatorRoutePlan.ts`
Source: `src/utils/NavigatorRoutePlan.ts:5:1`

### Members

| Name                    | Kind     | Type                                                   | Required | Description |
| ----------------------- | -------- | ------------------------------------------------------ | -------- | ----------- |
| guards                  | property | `readonly string[]`                                    | yes      |             |
| icon                    | property | `import("@ankhorage/contracts").IconSpec \| undefined` | no       |             |
| label                   | property | `string \| undefined`                                  | no       |             |
| name                    | property | `string`                                               | yes      |             |
| navigator               | property | `NavigatorNodePlan \| undefined`                       | no       |             |
| path                    | property | `string \| undefined`                                  | no       |             |
| screenId                | property | `string \| undefined`                                  | no       |             |
| showInPrimaryNavigation | property | `boolean \| undefined`                                 | no       |             |
| stackOptions            | property | `StackScreenOptions \| undefined`                      | no       |             |

## NavigatorRuntimePlatform

Kind: `unknown`
Module: `src/utils/NavigatorRuntimePlatform.ts`
Source: `src/utils/NavigatorRuntimePlatform.ts:1:1`

## NavigatorScreenModule

Kind: `type`
Module: `src/utils/NavigatorScreenModule.ts`
Source: `src/utils/NavigatorScreenModule.ts:1:1`

### Members

| Name       | Kind     | Type     | Required | Description |
| ---------- | -------- | -------- | -------- | ----------- |
| exportName | property | `string` | yes      |             |
| module     | property | `string` | yes      |             |

## NavigatorSupportStatus

Kind: `unknown`
Module: `src/utils/NavigatorSupportStatus.ts`
Source: `src/utils/NavigatorSupportStatus.ts:1:1`

## NavigatorValidationContext

Kind: `type`
Module: `src/utils/NavigatorValidationContext.ts`
Source: `src/utils/NavigatorValidationContext.ts:3:1`

### Members

| Name              | Kind     | Type                       | Required | Description |
| ----------------- | -------- | -------------------------- | -------- | ----------- |
| expoRouterVersion | property | `string`                   | yes      |             |
| platform          | property | `NavigatorRuntimePlatform` | yes      |             |

## resolveCustomTabsPresentation

Kind: `function`
Module: `src/features/tabs/domain/resolveCustomTabsPresentation.ts`
Source: `src/features/tabs/domain/resolveCustomTabsPresentation.ts:11:1`

Resolve one custom-tabs presentation for the current semantic responsive size.

### Signatures

- `(config: Omit<CustomTabsConfig, "implementation">, size: NavigatorResponsiveSize) => ResolvedCustomTabsPresentation`
  - config: `Omit<CustomTabsConfig, "implementation">`
  - size: `NavigatorResponsiveSize`
  - returns: `ResolvedCustomTabsPresentation`

## ResolvedCustomTabsPresentation

Kind: `type`
Module: `src/features/tabs/domain/ResolvedCustomTabsPresentation.ts`
Source: `src/features/tabs/domain/ResolvedCustomTabsPresentation.ts:3:1`

### Members

| Name                 | Kind     | Type                       | Required | Description |
| -------------------- | -------- | -------------------------- | -------- | ----------- |
| customPresentationId | property | `string \| undefined`      | no       |             |
| presentation         | property | `ResolvedTabsPresentation` | yes      |             |

## ResolvedTabsImplementation

Kind: `unknown`
Module: `src/features/tabs/domain/ResolvedTabsImplementation.ts`
Source: `src/features/tabs/domain/ResolvedTabsImplementation.ts:1:1`

## ResolvedTabsPresentation

Kind: `unknown`
Module: `src/features/tabs/domain/ResolvedTabsPresentation.ts`
Source: `src/features/tabs/domain/ResolvedTabsPresentation.ts:1:1`

## resolveNavigatorPreset

Kind: `function`
Module: `src/utils/resolveNavigatorPreset.ts`
Source: `src/utils/resolveNavigatorPreset.ts:4:1`

Resolve a canonical navigator preset into its ordered topology layers.

### Signatures

- `(preset: "stack" | "custom" | "slot" | "drawer" | "split-view" | "tabs" | "tabs-stack" | "drawer-stack" | "drawer-tabs" | "drawer-tabs-stack" | "root-stack-tabs" | "root-stack-tabs-stack" | "root-stack-drawer" | "root-stack-drawer-stack" | "root-stack-drawer-tabs" | "root-stack-drawer-tabs-stack" | undefined, fallbackType: "stack" | "custom" | "slot" | "drawer" | "split-view" | "tabs") => readonly ("stack" | "custom" | "slot" | "drawer" | "split-view" | "tabs")[]`
  - fallbackType: `"stack" | "custom" | "slot" | "drawer" | "split-view" | "tabs"`
  - preset: `"stack" | "custom" | "slot" | "drawer" | "split-view" | "tabs" | "tabs-stack" | "drawer-stack" | "drawer-tabs" | "drawer-tabs-stack" | "root-stack-tabs" | "root-stack-tabs-stack" | "root-stack-drawer" | "root-stack-drawer-stack" | "root-stack-drawer-tabs" | "root-stack-drawer-tabs-stack" | undefined`
  - returns: `readonly ("stack" | "custom" | "slot" | "drawer" | "split-view" | "tabs")[]`

## resolveTabsNavigatorPlan

Kind: `function`
Module: `src/features/tabs/application/resolveTabsNavigatorPlan.ts`
Source: `src/features/tabs/application/resolveTabsNavigatorPlan.ts:14:1`

Resolve the Expo Router module/export and presentation for one tabs implementation.

### Signatures

- `(config: TabsImplementationConfig | undefined, platform: NavigatorRuntimePlatform, size: NavigatorResponsiveSize) => TabsNavigatorPlan`
  - config: `TabsImplementationConfig | undefined`
  - platform: `NavigatorRuntimePlatform`
  - size: `NavigatorResponsiveSize`
  - returns: `TabsNavigatorPlan`

## TabsNavigatorPlan

Kind: `type`
Module: `src/features/tabs/domain/TabsNavigatorPlan.ts`
Source: `src/features/tabs/domain/TabsNavigatorPlan.ts:13:1`

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
Module: `src/utils/validateNavigatorManifest.ts`
Source: `src/utils/validateNavigatorManifest.ts:22:1`

Validate one navigator desired-state slice for a concrete Expo Router target.

### Signatures

- `(manifest: AppNavigatorManifest, context: NavigatorValidationContext, customNavigators?: CustomNavigatorRegistry | undefined) => readonly NavigatorDiagnostic[]`
  - context: `NavigatorValidationContext`
  - customNavigators: `CustomNavigatorRegistry | undefined` (optional)
  - manifest: `AppNavigatorManifest`
  - returns: `readonly NavigatorDiagnostic[]`
