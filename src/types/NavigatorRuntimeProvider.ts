import type { AnkhCommandProviderManifest } from '@ankhorage/contracts/cli';

export interface NavigatorRuntimeProvider extends AnkhCommandProviderManifest {
  readonly handlers: readonly {
    readonly path: readonly string[];
    readonly handler: (request: {
      readonly argv: readonly string[];
      readonly context: {
        readonly cwd: string;
        writeStdout(text: string): void;
        writeStderr(text: string): void;
      };
    }) => Promise<{ readonly exitCode: number }>;
  }[];
}
