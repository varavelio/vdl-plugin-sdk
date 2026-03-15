/**
 * Runtime ambient declarations required by plugin source files.
 *
 * The SDK imports this module for side effects so plugin code can rely on a
 * minimal `console` global during type-checking without depending on a browser
 * or full Node.js runtime type environment.
 */
export {};

declare global {
  const console: {
    log(...args: unknown[]): void;
    info(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    error(...args: unknown[]): void;
  };
}
