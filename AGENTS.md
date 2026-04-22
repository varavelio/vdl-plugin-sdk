# AGENTS.md

Repository constitution for AI agents working in `vdl-plugin-sdk`.

## Scope & Instruction Precedence (Mandatory)

- This file applies to all work performed inside this repository.
- Instruction priority is strict:
  1. System instructions
  2. Developer instructions
  3. User request
  4. Repository `AGENTS.md` (this file)
- If higher-priority instructions conflict with this file, follow the higher-priority instructions and keep the rest of this file enforced.
- Keep all changes aligned with project conventions and CI expectations.

## Completion Policy (Mandatory)

- Never stop at a partial result when a task is requested.
- Continue iterating until the task is fully completed (100%) according to the request.
- `npm run ci` is a required completion gate.
- If `npm run ci` fails, keep fixing and re-running until it passes.
- Work is not done until CI is green.

## Project Guidelines

- All code should be correctly documented using tsdoc (when applies) and well explained (not the implementation but it's purpose and what it does).

## Testing Policy for `src/utils` (Mandatory)

- Any new or changed functionality under `src/utils` must include unit tests and a small smoke test in `e2e/goja`.
- The smoke test must verify that the utility executes correctly in the VDL runtime context (Goja environment).
- Keep these smoke checks focused, deterministic, and minimal while still validating real execution.

## Maintaining `AGENTS.md` (Mandatory)

- Update this file whenever you discover new durable workflow rules, quality gates, or repository-wide constraints.
- Prefer small, targeted edits: adjust existing sections first; add new sections only when necessary.
- Do not remove or weaken existing constraints unless they are explicitly obsolete and replaced with clearer, enforceable guidance.
- Preserve high-value historical guidance that still applies.
- Write concise, actionable bullets using MUST/SHOULD language; avoid vague advice and implementation trivia.
- When instructions change, update the relevant section in place (do not only append at the end).
- Keep this file in English and readable for both humans and LLM agents.

## Practical Working Rules

- Prefer the smallest safe change that satisfies the request.
- Preserve and extend test coverage when behavior changes.
- Do not treat CI as a follow-up task; treat it as part of completion.
- When adding constraints, ensure they are verifiable by command, test, or observable outcome.
- Only fix the CI problems related to your task.
