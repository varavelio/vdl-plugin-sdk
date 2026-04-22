/**
 * Global Type Declarations for the VDL Plugin Execution Environment.
 *
 * This ambient declaration file (.d.ts) defines global types and wildcard modules
 * that are available when executing or building plugins.
 *
 * It is maintained as a separate script file (without top-level exports) rather
 * than inside `runtime.ts` to ensure that TypeScript treats these as global
 * ambient module declarations, not module augmentations.
 */

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
