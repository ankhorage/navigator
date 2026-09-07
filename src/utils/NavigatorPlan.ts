import type { NavigatorDiagnostic } from './NavigatorDiagnostic';
import type { NavigatorNodePlan } from './NavigatorNodePlan';
import type { NavigatorValidationContext } from './NavigatorValidationContext';

export interface NavigatorPlan {
  context: NavigatorValidationContext;
  root: NavigatorNodePlan;
  diagnostics: readonly NavigatorDiagnostic[];
  supported: boolean;
  flows: {
    onboarding: boolean;
    authentication: boolean;
  };
}
