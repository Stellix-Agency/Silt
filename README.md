<div align="center">

# Silt

**A declarative, capability-driven component framework for SolidJS.**


</div>

---

## Installation

```bash
bun add "@stellix.agency/silt"
```

---

## Concept

Silt turns your UI components into structured, declarative folders.

Instead of writing a single monolithic component, you define:
- **slots** — Isolated UI pieces
- **capabilities** — Pluggable behaviors (validation, actions, etc.)
- **layout** — How slots are arranged

---

## Structure

```
AuthForm/
  index.tsx
  schemas/
    login.schema.ts
  actions/
    login.action.ts
  slots/
    Header.tsx
    Fields.tsx
    Submit.tsx
```

---

## Usage

```tsx
import { defineComponent, ValidationProvider, ActionsProvider } from "@stellix.agency/silt"
import { Header, Fields, Submit, FormError } from "./slots"
import * as schemas from "./schemas"
import * as actions from "./actions"

export const AuthForm = defineComponent({
  definition: {
    name: "AuthForm",
    state: { email: "", password: "" },
  },
  layout: (slots) => (
    <div class="flex flex-col gap-6 p-8">
      {slots}
    </div>
  ),
  slots: { Header, Fields, FormError, Submit },
  capabilities: [
    { Provider: ValidationProvider, props: { schemas } },
    { Provider: ActionsProvider, props: { actions } },
  ],
})
```

Inside a slot, consume context via hooks:

```tsx
import { useComponent, useValidation } from "@stellix.agency/silt"

export function Fields() {
  const { state, set } = useComponent<{ email: string; password: string }>()
  const { errors } = useValidation()

  return (
    <input
      value={state.email}
      onInput={e => set("email", e.target.value)}
    />
  )
}
```

---

## Capabilities

Capabilities extend the component with pluggable behaviors.

### `withValidation`

Provides Zod-based validation via `useValidation()`.

```ts
import { useValidation } from "@stellix.agency/silt"

const { errors, validate } = useValidation()
validate("login") // Runs the "login" schema
```

### `withActions`

Provides async action runners via `useActions()`.

```ts
import { useActions } from "@stellix.agency/silt"

const { run, loading, error } = useActions()
await run("login") // Runs the "login" action
```

---

## API

### `defineComponent(options)`

| Option | Type | Description |
|---|---|---|
| `definition` | `{ name: string, state: TState }` | Component identity and initial state |
| `slots` | `Record<string, Component>` | UI pieces, rendered in key order |
| `layout` | `(slots: JSXElement) => JSXElement` | Optional wrapper around all slots |
| `capabilities` | `CapabilityEntry[]` | Pluggable behaviors |

### `useComponent<TState>()`

Returns `{ state, set }` from inside any slot.

---
