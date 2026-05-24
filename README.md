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

Silt turns your UI components into structured, declarative modules.

Instead of writing monolithic components, you define:
- **composable slots** — Context-aware sub-components (e.g., `<Button.Icon>`, `<Button.Label>`)
- **capabilities** — Pluggable behaviors (validation, actions, etc.)
- **state** — Declarative component state
- **layout** — How pieces are arranged (optional)

---

## Composable Slots

Slots are named sub-components that automatically inherit parent context. Instead of passing JSX as props, consumers compose slots directly in the render tree:

```tsx
// ✅ Composable slots (recommended)
<Button>
  <Button.Icon>{loading ? <Spinner /> : <Send />}</Button.Icon>
  <Button.Label>Send</Button.Label>
</Button>

// Slots automatically have access to parent state via useComponent()
```

**See [SLOTS_GUIDE.md](./SLOTS_GUIDE.md) for detailed composable slots documentation and [SLOTS_EXAMPLES.md](./SLOTS_EXAMPLES.md) for practical examples.**

---

## Traditional Slots (Legacy)

For backwards compatibility, the original static slots pattern is still supported:

```tsx
// ❌ Legacy pattern (still works, but use composable slots instead)
export const AuthForm = defineComponent({
  definition: {
    name: "AuthForm",
    state: { email: "", password: "" },
  },
  slots: { Header, Fields, Submit }, // Static slots
  layout: (slots) => <div class="flex flex-col">{slots}</div>,
  capabilities: [
    { Provider: ValidationProvider, props: { schemas } },
  ],
})
```

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

### Composable Slots Example

```tsx
import { defineComponent, useComponent, ValidationProvider } from "@stellix.agency/silt"
import { z } from "zod"

// 1. Define component with slots
const EmailInput = defineComponent({
  definition: {
    name: "EmailInput",
    state: { value: "", focused: false },
    slots: ["Label", "Input", "Error"], // Declare which slots are available
  },
  render: ({ slots }) => {
    const { state, set } = useComponent<{ value: string; focused: boolean }>()
    const { errors } = useValidation()

    return (
      <div>
        {slots.Label && (
          <label>
            <slots.Label />
          </label>
        )}
        {slots.Input && (
          <div>
            <slots.Input />
          </div>
        )}
        {slots.Error && state.focused && errors.value && (
          <p class="error">
            <slots.Error />
          </p>
        )}
      </div>
    )
  },
  capabilities: [
    {
      Provider: ValidationProvider,
      props: { schemas: { email: z.object({ value: z.string().email() }) } },
    },
  ],
})

// 2. Use with composable slots
export function LoginForm() {
  return (
    <EmailInput>
      <EmailInput.Label>Email Address</EmailInput.Label>
      <EmailInput.Input>
        <input type="email" placeholder="you@example.com" />
      </EmailInput.Input>
      <EmailInput.Error>Invalid email address</EmailInput.Error>
    </EmailInput>
  )
}
```

---

## API

### `defineComponent(options)`

| Option | Type | Description |
|---|---|---|
| `definition` | `{ name: string, state: TState, slots?: string[] }` | Component identity, initial state, and available slot names |
| `render` | `(props: { slots: Record<string, ParentComponent> }) => JSXElement` | Render function that uses composable slots |
| `slots` | `Record<string, Component>` | (Legacy) Static slots dictionary |
| `layout` | `(slots: JSXElement) => JSXElement` | (Legacy) Optional wrapper around slots |
| `capabilities` | `CapabilityEntry[]` | Pluggable behaviors (validation, actions, etc.) |

**New composable pattern:**
```tsx
const MyComponent = defineComponent({
  definition: { name: "MyComponent", state: {...}, slots: ["Icon", "Label"] },
  render: ({ slots }) => (
    <div>
      {slots.Icon && <slots.Icon />}
      {slots.Label && <slots.Label />}
    </div>
  ),
})
```

### `useComponent<TState>()`

Returns `{ state, set }` from inside any component or slot.

```tsx
const { state, set } = useComponent<MyState>()
set("fieldName", newValue)
```

### `useValidation()`

Provides `{ errors, validate }` when used with `ValidationProvider`.

### `useActions()`

Provides `{ loading, error, run }` when used with `ActionsProvider`.

---

## Key Concepts

### Slots Are Sub-Components

Don't pass slots as props. Instead, compose them as children:

```tsx
// ✅ Correct
<Button>
  <Button.Icon>ArrowRight</Button.Icon>
</Button>

// ❌ Wrong
<Button icon={<ArrowRight />} />
```

### Automatic Context Inheritance

Slots automatically have access to parent state — no manual prop passing needed:

```tsx
<Button.Icon>
  {/* useComponent() works here! */}
  {useComponent().state.loading && <Spinner />}
</Button.Icon>
```

### Slots Are Optional

If the consumer doesn't include a slot, it simply won't render:

```tsx
<Button>
  <Button.Label>Submit</Button.Label>
  {/* No Icon? That's fine — it just won't render. */}
</Button>
```

---
