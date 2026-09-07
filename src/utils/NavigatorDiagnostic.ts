export interface NavigatorDiagnostic {
  code: string;
  severity: 'error' | 'warning';
  path: string;
  message: string;
}
