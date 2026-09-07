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

## CustomTabsLayout

Kind: `function`
Module: `src/features/tabs/adapters/inbound/CustomTabsLayout.tsx`
Source: `src/features/tabs/adapters/inbound/CustomTabsLayout.tsx:20:1`

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

## defineCustomNavigatorRegistry

Kind: `function`
Module: `src/features/custom/domain/defineCustomNavigatorRegistry.ts`
Source: `src/features/custom/domain/defineCustomNavigatorRegistry.ts:9:1`

Define an immutable, duplicate-free custom navigator registry for one composition boundary.

### Signatures

- `(registrations: readonly CustomNavigatorRegistration[]) => CustomNavigatorRegistry`
  - registrations: `readonly CustomNavigatorRegistration[]`
  - returns: `CustomNavigatorRegistry`

## generateNavigatorFiles

Kind: `function`
Module: `src/utils/generateNavigatorFiles.ts`
Source: `src/utils/generateNavigatorFiles.ts:19:1`

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

## resolveCustomTabsPresentation

Kind: `function`
Module: `src/features/tabs/domain/resolveCustomTabsPresentation.ts`
Source: `src/features/tabs/domain/resolveCustomTabsPresentation.ts:10:1`

Resolve one custom-tabs presentation for the current semantic responsive size.

### Signatures

- `(config: Omit<CustomTabsConfig, "implementation">, size: NavigatorResponsiveSize) => ResolvedCustomTabsPresentation`
  - config: `Omit<CustomTabsConfig, "implementation">`
  - size: `NavigatorResponsiveSize`
  - returns: `ResolvedCustomTabsPresentation`

## resolveNavigatorPreset

Kind: `function`
Module: `src/utils/resolveNavigatorPreset.ts`
Source: `src/utils/resolveNavigatorPreset.ts:4:1`

Resolve a canonical navigator preset into its ordered topology layers.

### Signatures

- `(preset: "slot" | "stack" | "tabs" | "tabs-stack" | "drawer" | "drawer-stack" | "drawer-tabs" | "drawer-tabs-stack" | "root-stack-tabs" | "root-stack-tabs-stack" | "root-stack-drawer" | "root-stack-drawer-stack" | "root-stack-drawer-tabs" | "root-stack-drawer-tabs-stack" | "split-view" | "custom" | undefined, fallbackType: "slot" | "stack" | "tabs" | "drawer" | "split-view" | "custom") => readonly ("slot" | "stack" | "tabs" | "drawer" | "split-view" | "custom")[]`
  - fallbackType: `"slot" | "stack" | "tabs" | "drawer" | "split-view" | "custom"`
  - preset: `"slot" | "stack" | "tabs" | "tabs-stack" | "drawer" | "drawer-stack" | "drawer-tabs" | "drawer-tabs-stack" | "root-stack-tabs" | "root-stack-tabs-stack" | "root-stack-drawer" | "root-stack-drawer-stack" | "root-stack-drawer-tabs" | "root-stack-drawer-tabs-stack" | "split-view" | "custom" | undefined`
  - returns: `readonly ("slot" | "stack" | "tabs" | "drawer" | "split-view" | "custom")[]`

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
