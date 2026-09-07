export interface NavigatorCliExecution {
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly writeStdout: (text: string) => void;
  readonly writeStderr: (text: string) => void;
}

export interface NavigatorCliRunResult {
  readonly exitCode: number;
}
