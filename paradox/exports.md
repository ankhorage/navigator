# Public API

## createNavigatorPlan

Kind: `function`
Module: `src/utils/createNavigatorPlan.ts`
Source: `src/utils/createNavigatorPlan.ts:31:1`

Create a disposable, provider-aware plan from only the navigator desired-state slice.

### Signatures

- `(manifest: AppNavigatorManifest, options: CreateNavigatorPlanOptions) => NavigatorPlan`
  - manifest: `AppNavigatorManifest`
  - options: `CreateNavigatorPlanOptions`
  - returns: `NavigatorPlan`

## default

Kind: `unknown`
Module: `src/cli/createCliProvider.ts`
Source: `src/cli/createCliProvider.ts:13:1`

## defineCustomNavigatorRegistry

Kind: `function`
Module: `src/features/custom/domain/defineCustomNavigatorRegistry.ts`
Source: `src/features/custom/domain/defineCustomNavigatorRegistry.ts:9:1`

Define an immutable, duplicate-free custom navigator registry for one composition boundary.

### Signatures

- `(registrations: readonly CustomNavigatorRegistration[]) => CustomNavigatorRegistry`
  - registrations: `readonly CustomNavigatorRegistration[]`
  - returns: `CustomNavigatorRegistry`

## generateNavigator

Kind: `function`
Module: `src/utils/generateNavigator.ts`
Source: `src/utils/generateNavigator.ts:21:1`

Generate a structured deterministic Expo Router result from one resolved plan and narrow bindings.

### Signatures

- `(plan: NavigatorPlan, bindings: NavigatorGenerationBindings, options?: NavigatorGenerationOptions) => NavigatorGenerationResult`
  - bindings: `NavigatorGenerationBindings`
  - options: `NavigatorGenerationOptions` (optional)
  - plan: `NavigatorPlan`
  - returns: `NavigatorGenerationResult`

## generateNavigatorExamples

Kind: `function`
Module: `src/utils/generateNavigatorExamples.ts`
Source: `src/utils/generateNavigatorExamples.ts:22:1`

Generate one or every complete root examples application as a deterministic file set.

### Signatures

- `(id?: NavigatorExampleId | undefined) => NavigatorExampleGenerationResult`
  - id: `NavigatorExampleId | undefined` (optional)
  - returns: `NavigatorExampleGenerationResult`

## getNavigatorCatalog

Kind: `function`
Module: `src/features/catalog/adapters/inbound/getNavigatorCatalog.ts`
Source: `src/features/catalog/adapters/inbound/getNavigatorCatalog.ts:7:1`

Return the package-owned catalog with dependencies derived from published owner metadata.

### Signatures

- `() => NavigatorCatalog`
  - returns: `NavigatorCatalog`

## getNavigatorExampleCatalog

Kind: `function`
Module: `src/features/catalog/adapters/inbound/getNavigatorExampleCatalog.ts`
Source: `src/features/catalog/adapters/inbound/getNavigatorExampleCatalog.ts:16:1`

Return the standalone composition catalog with target truth derived from Navigator policy.

### Signatures

- `() => readonly NavigatorExampleDescriptor[]`
  - returns: `readonly NavigatorExampleDescriptor[]`

## HeadlessTabsLayout

Kind: `function`
Module: `src/features/tabs/adapters/inbound/HeadlessTabsLayout.tsx`
Source: `src/features/tabs/adapters/inbound/HeadlessTabsLayout.tsx:16:1`

Render one stable headless Expo Router tab topology with Navigator-owned presentations.

### Signatures

- `({
routes,
presentations,
initialRouteName,
resolveIconSource,
customPresentation: CustomPresentation,
}: HeadlessTabsLayoutProps) => import("react").JSX.Element`
  - {
    routes,
    presentations,
    initialRouteName,
    resolveIconSource,
    customPresentation: CustomPresentation,
    }: `HeadlessTabsLayoutProps`
  - returns: `import("react").JSX.Element`

## isNavigatorGenerationBindings

Kind: `function`
Module: `src/utils/isNavigatorGenerationBindings.ts`
Source: `src/utils/isNavigatorGenerationBindings.ts:7:1`

Narrow unknown CLI or composer input to the portable generated-module binding shape.

### Signatures

- `(value: unknown) => boolean`
  - value: `unknown`
  - returns: `boolean`

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
Source: `src/utils/NAVIGATOR_PACKAGE_METADATA.ts:5:14`

Publish package identity and the single Navigator-owned capability catalog.

## NavigatorExampleDescriptor

Kind: `type`
Module: `src/types/navigatorExamples.ts`
Source: `src/types/navigatorExamples.ts:58:1`

### Members

| Name        | Kind     | Type                                | Required | Description |
| ----------- | -------- | ----------------------------------- | -------- | ----------- |
| description | property | `string`                            | yes      |             |
| id          | property | `NavigatorExampleId`                | yes      |             |
| targets     | property | `readonly NavigatorExampleTarget[]` | yes      |             |
| title       | property | `string`                            | yes      |             |

## NavigatorExampleGenerationResult

Kind: `type`
Module: `src/types/navigatorExamples.ts`
Source: `src/types/navigatorExamples.ts:65:1`

### Members

| Name     | Kind     | Type                                    | Required | Description |
| -------- | -------- | --------------------------------------- | -------- | ----------- |
| examples | property | `readonly NavigatorExampleDescriptor[]` | yes      |             |
| files    | property | `readonly NavigatorGeneratedFile[]`     | yes      |             |

## NavigatorExampleId

Kind: `unknown`
Module: `src/types/navigatorExamples.ts`
Source: `src/types/navigatorExamples.ts:14:1`

## NavigatorExampleTarget

Kind: `type`
Module: `src/types/navigatorExamples.ts`
Source: `src/types/navigatorExamples.ts:47:1`

### Members

| Name          | Kind     | Type                                                                                                     | Required | Description |
| ------------- | -------- | -------------------------------------------------------------------------------------------------------- | -------- | ----------- |
| capabilityIds | property | `readonly string[]`                                                                                      | yes      |             |
| diagnostics   | property | `readonly NavigatorDiagnostic[]`                                                                         | yes      |             |
| platform      | property | `NavigatorRuntimePlatform`                                                                               | yes      |             |
| support       | property | `NavigatorSupportStatus`                                                                                 | yes      |             |
| verification  | property | `readonly { readonly kind: NavigatorVerificationKind; readonly status: NavigatorVerificationStatus; }[]` | yes      |             |

## NavigatorExampleVerificationResult

Kind: `type`
Module: `src/types/navigatorExamples.ts`
Source: `src/types/navigatorExamples.ts:70:1`

### Members

| Name     | Kind     | Type                                                                                                                                                             | Required | Description |
| -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- |
| examples | property | `readonly { readonly id: NavigatorExampleId; readonly current: boolean; readonly missingFiles: readonly string[]; readonly changedFiles: readonly string[]; }[]` | yes      |             |
| verified | property | `boolean`                                                                                                                                                        | yes      |             |

## NavigatorVerificationResult

Kind: `type`
Module: `src/types/navigatorVerification.ts`
Source: `src/types/navigatorVerification.ts:9:1`

### Members

| Name          | Kind     | Type                                                                                                                               | Required | Description |
| ------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- |
| capabilityIds | property | `readonly string[]`                                                                                                                | yes      |             |
| checks        | property | `readonly { readonly kind: NavigatorVerificationKind; readonly status: NavigatorVerificationStatus; readonly message: string; }[]` | yes      |             |
| deterministic | property | `boolean`                                                                                                                          | yes      |             |
| diagnostics   | property | `readonly NavigatorDiagnostic[]`                                                                                                   | yes      |             |
| support       | property | `NavigatorSupportStatus`                                                                                                           | yes      |             |

## resolveHeadlessTabsPresentation

Kind: `function`
Module: `src/features/tabs/domain/resolveHeadlessTabsPresentation.ts`
Source: `src/features/tabs/domain/resolveHeadlessTabsPresentation.ts:10:1`

Resolve one headless-tabs presentation for the current semantic responsive size.

### Signatures

- `(config: Omit<HeadlessTabsConfig, "implementation">, size: NavigatorResponsiveSize) => ResolvedHeadlessTabsPresentation`
  - config: `Omit<HeadlessTabsConfig, "implementation">`
  - size: `NavigatorResponsiveSize`
  - returns: `ResolvedHeadlessTabsPresentation`

## resolveNavigatorHeaderOwnership

Kind: `function`
Module: `src/features/stack/domain/resolveNavigatorHeaderOwnership.ts`
Source: `src/features/stack/domain/resolveNavigatorHeaderOwnership.ts:11:1`

### Signatures

- `(plan: NavigatorPlan, args?: NavigatorHeaderOwnershipArgs) => NavigatorHeaderOwnership`
  - args: `NavigatorHeaderOwnershipArgs` (optional)
  - plan: `NavigatorPlan`
  - returns: `NavigatorHeaderOwnership`

## resolveNavigatorPreset

Kind: `function`
Module: `src/utils/resolveNavigatorPreset.ts`
Source: `src/utils/resolveNavigatorPreset.ts:4:1`

Resolve a canonical navigator preset into its ordered topology layers.

### Signatures

- `(preset: "drawer" | "drawer-stack" | "drawer-tabs" | "drawer-tabs-stack" | "slot" | "stack" | "stack-drawer" | "stack-drawer-stack" | "stack-drawer-tabs" | "stack-drawer-tabs-stack" | "stack-tabs" | "stack-tabs-stack" | "tabs" | "tabs-stack" | "split-view" | "custom" | undefined, fallbackType: "drawer" | "slot" | "stack" | "tabs" | "split-view" | "custom") => readonly ("drawer" | "slot" | "stack" | "tabs" | "split-view" | "custom")[]`
  - fallbackType: `"drawer" | "slot" | "stack" | "tabs" | "split-view" | "custom"`
  - preset: `"drawer" | "drawer-stack" | "drawer-tabs" | "drawer-tabs-stack" | "slot" | "stack" | "stack-drawer" | "stack-drawer-stack" | "stack-drawer-tabs" | "stack-drawer-tabs-stack" | "stack-tabs" | "stack-tabs-stack" | "tabs" | "tabs-stack" | "split-view" | "custom" | undefined`
  - returns: `readonly ("drawer" | "slot" | "stack" | "tabs" | "split-view" | "custom")[]`

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

## validateNavigator

Kind: `function`
Module: `src/utils/validateNavigator.ts`
Source: `src/utils/validateNavigator.ts:12:1`

Structurally and semantically validate standalone navigator input without writing files.

### Signatures

- `(manifest: unknown, bindings: unknown, options: CreateNavigatorPlanOptions, generationOptions?: NavigatorGenerationOptions) => readonly NavigatorDiagnostic[]`
  - bindings: `unknown`
  - generationOptions: `NavigatorGenerationOptions` (optional)
  - manifest: `unknown`
  - options: `CreateNavigatorPlanOptions`
  - returns: `readonly NavigatorDiagnostic[]`

## validateNavigatorBindings

Kind: `function`
Module: `src/utils/validateNavigatorBindings.ts`
Source: `src/utils/validateNavigatorBindings.ts:14:1`

Validate only the narrow generated-module bindings required by a resolved navigator plan.

### Signatures

- `(plan: NavigatorPlan, bindings: unknown, options?: NavigatorGenerationOptions) => readonly NavigatorDiagnostic[]`
  - bindings: `unknown`
  - options: `NavigatorGenerationOptions` (optional)
  - plan: `NavigatorPlan`
  - returns: `readonly NavigatorDiagnostic[]`

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

## verifyNavigator

Kind: `function`
Module: `src/utils/verifyNavigator.ts`
Source: `src/utils/verifyNavigator.ts:13:1`

Verify deterministic Navigator-owned structure and report stronger runtime evidence separately.

### Signatures

- `(plan: NavigatorPlan, bindings: NavigatorGenerationBindings, options?: NavigatorGenerationOptions) => NavigatorVerificationResult`
  - bindings: `NavigatorGenerationBindings`
  - options: `NavigatorGenerationOptions` (optional)
  - plan: `NavigatorPlan`
  - returns: `NavigatorVerificationResult`

## verifyNavigatorExamplesAsync

Kind: `function`
Module: `src/utils/verifyNavigatorExamplesAsync.ts`
Source: `src/utils/verifyNavigatorExamplesAsync.ts:11:1`

Verify checked-in example bytes and app-owned lockfiles against deterministic generation.

### Signatures

- `(targetDirectory: string, cwd: string, id?: NavigatorExampleId | undefined) => Promise<NavigatorExampleVerificationResult>`
  - cwd: `string`
  - id: `NavigatorExampleId | undefined` (optional)
  - targetDirectory: `string`
  - returns: `Promise<NavigatorExampleVerificationResult>`
