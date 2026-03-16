import {
  basename as patheBasename,
  dirname as patheDirname,
  extname as patheExtname,
  isAbsolute as patheIsAbsolute,
  join as patheJoin,
  normalize as patheNormalize,
  relative as patheRelative,
  resolve as patheResolve,
} from "pathe";
import { filename as patheFilename } from "pathe/utils";

/**
 * Joins path segments using deterministic forward-slash normalization.
 *
 * This is a thin wrapper around `pathe.join`, which keeps behavior consistent
 * across platforms and normalizes path separators to `/`.
 *
 * Powered by `pathe` (MIT): https://github.com/unjs/pathe
 *
 * @param parts - Path segments to join.
 * @returns The normalized joined path.
 *
 * @example
 * ```ts
 * join("generated", "models", "user.ts");
 * // returns "generated/models/user.ts"
 * ```
 */
export function join(...parts: string[]): string {
  return patheJoin(...parts);
}

/**
 * Resolves one or more path segments into a normalized absolute or rooted path.
 *
 * This is useful when plugin code needs stable path resolution without relying
 * on platform-specific separators.
 *
 * Powered by `pathe` (MIT): https://github.com/unjs/pathe
 *
 * @param parts - Path segments to resolve.
 * @returns The resolved normalized path.
 *
 * @example
 * ```ts
 * resolve("/workspace/plugin", "src", "../dist/index.js");
 * // returns "/workspace/plugin/dist/index.js"
 * ```
 */
export function resolve(...parts: string[]): string {
  return patheResolve(...parts);
}

/**
 * Normalizes a path by collapsing redundant separators and dot segments.
 *
 * This is helpful when plugin code receives mixed Windows and POSIX-style path
 * input and needs a single predictable format.
 *
 * Powered by `pathe` (MIT): https://github.com/unjs/pathe
 *
 * @param path - Path to normalize.
 * @returns The normalized path using `/` separators.
 *
 * @example
 * ```ts
 * normalize("generated\\models/../types/user.ts");
 * // returns "generated/types/user.ts"
 * ```
 */
export function normalize(path: string): string {
  return patheNormalize(path);
}

/**
 * Computes the relative path from one location to another.
 *
 * Powered by `pathe` (MIT): https://github.com/unjs/pathe
 *
 * @param from - Starting path.
 * @param to - Destination path.
 * @returns The normalized relative path from `from` to `to`.
 *
 * @example
 * ```ts
 * relative("generated/models", "generated/types/user.ts");
 * // returns "../types/user.ts"
 * ```
 */
export function relative(from: string, to: string): string {
  return patheRelative(from, to);
}

/**
 * Returns the parent directory portion of a path.
 *
 * Powered by `pathe` (MIT): https://github.com/unjs/pathe
 *
 * @param path - Path to inspect.
 * @returns The directory name portion of `path`.
 *
 * @example
 * ```ts
 * dirname("generated/models/user.ts");
 * // returns "generated/models"
 * ```
 */
export function dirname(path: string): string {
  return patheDirname(path);
}

/**
 * Returns the last path segment, optionally removing a known extension suffix.
 *
 * Powered by `pathe` (MIT): https://github.com/unjs/pathe
 *
 * @param path - Path to inspect.
 * @param extension - Optional extension suffix to remove from the result.
 * @returns The basename of `path`.
 *
 * @example
 * ```ts
 * basename("generated/models/user.ts");
 * // returns "user.ts"
 * ```
 */
export function basename(path: string, extension?: string): string {
  return patheBasename(path, extension);
}

/**
 * Returns the file extension of a path, including the leading dot.
 *
 * Powered by `pathe` (MIT): https://github.com/unjs/pathe
 *
 * @param path - Path to inspect.
 * @returns The extension portion of `path`, or an empty string when none exists.
 *
 * @example
 * ```ts
 * extname("generated/models/user.ts");
 * // returns ".ts"
 * ```
 */
export function extname(path: string): string {
  return patheExtname(path);
}

/**
 * Returns the filename without its extension.
 *
 * This is useful for deriving stable artifact names without manually stripping
 * directory segments or extensions.
 *
 * Powered by `pathe` (MIT): https://github.com/unjs/pathe
 *
 * @param path - Path to inspect.
 * @returns The filename without its extension, or `undefined` when it cannot be derived.
 *
 * @example
 * ```ts
 * filename("generated/models/user.ts");
 * // returns "user"
 * ```
 */
export function filename(path: string): string | undefined {
  return patheFilename(path);
}

/**
 * Checks whether a path is absolute.
 *
 * Powered by `pathe` (MIT): https://github.com/unjs/pathe
 *
 * @param path - Path to inspect.
 * @returns `true` when `path` is absolute, otherwise `false`.
 *
 * @example
 * ```ts
 * isAbsolute("/generated/models/user.ts");
 * // returns true
 * ```
 */
export function isAbsolute(path: string): boolean {
  return patheIsAbsolute(path);
}
