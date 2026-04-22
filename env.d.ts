/**
 * Allows importing raw file contents as plaintext strings by appending the
 * `?raw` suffix to an import path.
 *
 * @example
 * import query from "./query.sql?raw";
 */
declare module "*?raw" {
  const content: string;
  export default content;
}

/**
 * Minimal contract for the `console` available at VDL runtime.
 *
 * This type is used to type the global object without relying on broader
 * environment declarations.
 */
interface Console {
  log(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}
declare var console: Console;
