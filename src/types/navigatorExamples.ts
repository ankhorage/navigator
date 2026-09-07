import type {
  AppNavigatorManifest,
  CustomNavigatorRegistration,
  NavigatorCapabilityId,
  NavigatorDiagnostic,
  NavigatorGeneratedFile,
  NavigatorGenerationBindings,
  NavigatorRuntimePlatform,
  NavigatorSupportStatus,
  NavigatorVerificationKind,
  NavigatorVerificationStatus,
} from '@ankhorage/contracts/navigator';

export type NavigatorExampleId =
  | 'drawer'
  | 'drawer-split-view'
  | 'drawer-stack'
  | 'drawer-tabs'
  | 'drawer-tabs-stack'
  | 'drawer-tabs-top'
  | 'registered-custom'
  | 'slot'
  | 'split-view-three-column'
  | 'split-view-two-column'
  | 'stack'
  | 'stack-drawer'
  | 'stack-drawer-stack'
  | 'stack-drawer-tabs'
  | 'stack-drawer-tabs-stack'
  | 'stack-tabs'
  | 'stack-tabs-stack'
  | 'stack-tabs-top'
  | 'tabs'
  | 'tabs-bottom-tabs-top'
  | 'tabs-split-view'
  | 'tabs-stack';

export interface NavigatorExampleDefinition {
  readonly id: NavigatorExampleId;
  readonly title: string;
  readonly description: string;
  readonly manifest: AppNavigatorManifest;
  readonly bindings: NavigatorGenerationBindings;
  readonly customNavigatorRegistrations?: readonly CustomNavigatorRegistration[];
}

export interface NavigatorExampleTarget {
  readonly platform: NavigatorRuntimePlatform;
  readonly support: NavigatorSupportStatus;
  readonly capabilityIds: readonly NavigatorCapabilityId[];
  readonly diagnostics: readonly NavigatorDiagnostic[];
  readonly verification: readonly {
    readonly kind: NavigatorVerificationKind;
    readonly status: NavigatorVerificationStatus;
  }[];
}

export interface NavigatorExampleDescriptor {
  readonly id: NavigatorExampleId;
  readonly title: string;
  readonly description: string;
  readonly targets: readonly NavigatorExampleTarget[];
}

export interface NavigatorExampleGenerationResult {
  readonly examples: readonly NavigatorExampleDescriptor[];
  readonly files: readonly NavigatorGeneratedFile[];
}

export interface NavigatorExampleVerificationResult {
  readonly examples: readonly {
    readonly id: NavigatorExampleId;
    readonly current: boolean;
    readonly missingFiles: readonly string[];
    readonly changedFiles: readonly string[];
  }[];
  readonly verified: boolean;
}
