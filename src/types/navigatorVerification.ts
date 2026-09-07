import type {
  NavigatorCapabilityId,
  NavigatorDiagnostic,
  NavigatorSupportStatus,
  NavigatorVerificationKind,
  NavigatorVerificationStatus,
} from '@ankhorage/contracts/navigator';

export interface NavigatorVerificationResult {
  readonly support: NavigatorSupportStatus;
  readonly capabilityIds: readonly NavigatorCapabilityId[];
  readonly diagnostics: readonly NavigatorDiagnostic[];
  readonly deterministic: boolean;
  readonly checks: readonly {
    readonly kind: NavigatorVerificationKind;
    readonly status: NavigatorVerificationStatus;
    readonly message: string;
  }[];
}
