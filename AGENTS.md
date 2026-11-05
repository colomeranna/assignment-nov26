# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Project context

This is a small take-home assignment for an interview (Next.js 16, React 19, TypeScript strict, Tailwind 4). Optimize for **clarity and correctness a reviewer can read in one sitting**, not for scale.

- Keep it simple. No abstractions, layers, or config "for later". Three similar lines beat a premature helper.
- Don't add dependencies unless they clearly earn their place. Don't add state libraries, DI, or generic repositories.
- Flat structure: `app/` for routes, `lib/` for pure logic and types, `components/` only once a component is reused.
- Small, well-named functions over comments. Comment only the *why* that the code can't say.
- Verify before calling something done: `npx tsc --noEmit`, `npm run lint`, and check the page in the browser.

# TypeScript best practices

Adapted from pstack's `typescript-best-practices`, trimmed to what a small project needs.

## Model the domain so illegal states can't exist

Use discriminated unions with one discriminant name (`kind`) instead of booleans plus optional fields.

```ts
// Don't: contradictory states are representable
type State = { loading: boolean; data?: Item[]; error?: string };

// Do: only valid states exist
type State =
  | { kind: "loading" }
  | { kind: "ready"; data: Item[] }
  | { kind: "error"; error: string };
```

Handle every variant, and make the compiler complain when a new one is added:

```ts
switch (state.kind) {
  case "loading": return <Spinner />;
  case "ready":   return <List items={state.data} />;
  case "error":   return <ErrorMessage text={state.error} />;
  default: {
    const _exhaustive: never = state;
    return _exhaustive;
  }
}
```

Keep types as simple as the code allows. Keep `T[]` unless the loose type forces a `!`, a cast, or a "should never happen" throw. Reach for a stronger type (e.g. `[T, ...T[]]` for non-empty) only then.

## Validate at the boundary, trust inside

External data is `unknown` until parsed: `fetch` responses, `JSON.parse`, form data, search params, env vars, `localStorage`.

- Parse once where data enters (route handler, server action, data-loading function) into a named domain type.
- Inside the app, trust the types. No re-validating deep in the call chain.
- Keep business logic in pure functions in `lib/` that take typed data and return typed data. That keeps it easy to test without the framework.
- If a schema library (e.g. zod) is added, derive the type from the schema (`z.infer`) instead of keeping a separate interface and guard that can drift.

## No `any`, no lying casts

- Use `unknown` instead of `any`, then narrow.
- Avoid `as`. Cast only after validation. Prefer `satisfies` to check a value against a type without widening literals:

  ```ts
  const config = { theme: "dark", cols: 3 } satisfies Config;
  ```

- Narrowing preference: discriminant check > `in` > `typeof`/`instanceof` > type guard > `as`.
- Type guards (`isX`, `hasX`) must actually check what they claim. A lying guard is worse than a cast.
- Avoid non-null assertions (`!`). Fix the type instead.

## Reuse types instead of redeclaring them

Derive with `Pick`, `Omit`, `Partial`, `ReturnType`, `Parameters`, `Awaited`, `typeof`, and `ComponentProps` before writing a new interface that duplicates an existing shape.

## Functions and components

- Use an object parameter once a function takes more than two arguments, or two of the same type, so call sites are self-documenting and can't swap arguments.
- Type component props with a named `type Props = { ... }`. Let return types be inferred for components. Annotate return types on exported `lib/` functions.
- Prefer `const` and immutable updates. Mark readonly data `readonly` / `as const` when it helps.
- Use `import type` for type-only imports.

## Errors and logging

- Throw or return errors with enough context to debug (`Invalid item id: ${id}`), and handle them at the boundary (an error UI, a status code).
- No leftover `console.log` in submitted code.

## Tests (if included)

- Test behavior through public functions, not implementation details.
- Don't mock what you can run. Pure `lib/` functions need no mocks at all.
