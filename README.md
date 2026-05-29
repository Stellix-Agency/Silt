<div align="center">

# Silt

**A declarative, capability-driven component framework for SolidJS.**

</div>

---

## Installation

```bash
bun add @stellix.agency/silt
```

Peer dependencies: `solid-js`, `zod`

---

## Core concepts

Silt structures UI components around three primitives:

| Primitive | Purpose |
|---|---|
| **`defineComponent`** | Declares state, wires slots, wraps capabilities |
| **`defineSlot`** | Defines a structural section of a component |
| **Capabilities** | Pluggable custom behaviors (validation, async actions) |

---

## Quick start

```tsx
// button/slots/label/index.tsx
import type { ButtonState } from "../../types";
import { defineSlot } from "@stellix.agency/silt";
import { labelStyles } from "./styles";

export default defineSlot<ButtonState>((content, state) =>
  content ? <span class={labelStyles({ size: state.size })}>{content}</span> : null
);
```

```tsx
// button/index.tsx
import { defineComponent, useComponent } from "@stellix.agency/silt";
import { buttonStyles } from "./button.styles";
import * as slots from "./slots";

const initialState: ButtonState = { loading: false, disabled: false, size: "md", variant: "primary" };

export const Button = defineComponent({
  name: "Button",
  state: initialState,
  slots,
  render: ({ Icon, Label, Spinner }) => {
    const { state, class: className } = useComponent<ButtonState>()
    return (
      <button
        disabled={state.disabled || state.loading}
        class={buttonStyles({ size: state.size, variant: state.variant, class: className })}
      >
        <Spinner />
        <Icon />
        <Label />
      </button>
    )
  },
});
```

```tsx
// Consumer usage
<Button size="lg" variant="primary">
  <Button.Label>Send</Button.Label>
</Button>

// With class override and controlled loading
<Button class="w-full" loading={isSaving()}>
  <Button.Label>Save</Button.Label>
</Button>
```

---

## API

### `defineComponent(options)`

Creates a composable, stateful component.

```ts
defineComponent({
  name: string,
  state: TState,
  slots?: Record<string, SlotComponent>,
  capabilities?: CapabilityEntry[],
  render: (slots: { [K in keyof TSlots]: Component }) => JSXElement,
})
```

**`slots`** : Object mapping slot names to slot components (created via `defineSlot`).
The framework wires each slot automatically: in `render`, slot names arrive as ready-to-render `<SlotName />` components.

**Controlled props** : All state keys, plus `class`, are accepted as props from outside:
```tsx
<Button loading={true} class="w-full" />
```

**Sub-components** : One sub-component is attached per slot key, for consumer usage:
```tsx
<Button>
  <Button.Icon><ArrowRight /></Button.Icon>
  <Button.Label>Send</Button.Label>
</Button>
```

---

### `defineSlot<TState>(render)`

Defines a structural slot component.

```ts
defineSlot<TState>(
  render: (content: JSXElement | undefined, state: TState) => JSXElement | null
): Component<{ content?: ParentComponent }>
```

The render callback receives:
- `content` : Consumer-provided JSX (`undefined` if slot was not used).
- `state` : Parent component's reactive state, for CVA variant resolution.

For write access to state or capability hooks, call them directly inside the callback:

```tsx
// Wrapper slot : Only renders if consumer used it
export default defineSlot((content) =>
  content ? <div class={headerStyles()}>{content}</div> : null
)

// State-aware slot : Resolves CVA variants
export default defineSlot<ButtonState>((content, state) =>
  content ? <span class={labelStyles({ size: state.size })}>{content}</span> : null
)

// Internal slot : Uses context hooks, ignores consumer content
export default defineSlot<FormState>((_, state) => {
  const { set } = useComponent<FormState>()
  const { errors } = useValidation()
  return (
    <input
      value={state.email}
      onInput={(e) => set("email", e.currentTarget.value)}
      class={inputStyles({ invalid: !!errors()["email"] })}
    />
  )
})
```

---

### `useComponent<TState>()`

Reads state and exposes `set` from within any render function or slot.
Throws if called outside a `defineComponent` tree.

```ts
const { state, set, class: className } = useComponent<ButtonState>()

set("loading", true)
```

---

### `useValidation()`

Available when `ValidationProvider` is mounted as a capability.

```ts
const { errors, validate } = useValidation()

validate("login")  // Runs schema keyed "login" against state
errors()["email"]  // Reactive error string or undefined
```

---

### `useActions()`

Available when `ActionsProvider` is mounted as a capability.

```ts
const { loading, error, run } = useActions()

run("submit")    // Executes action keyed "submit"
loading()        // True while running
error()          // Last error message, undefined when none
```

---

## Capabilities

Capabilities wrap a component's render tree in context providers.
Mount them via the `capabilities` array in `defineComponent`.

### Validation

```ts
import { ValidationProvider } from "@stellix.agency/silt";
import { z } from "zod";

const schemas = {
  login: z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Min 8 characters"),
  }),
};

capabilities: [
  { Provider: ValidationProvider, props: { schemas } },
];
```

Action errors are passed through automatically, throw from an action and the message appears in `error()`.

### Actions

```ts
import { ActionsProvider } from "@stellix.agency/silt"
import type { ActionRecord } from "@stellix.agency/silt"

const actions: ActionRecord = {
  submit: async (state) => {
    await api.post("/login", { email: state["email"], password: state["password"] })
  },
}

capabilities: [
  { Provider: ActionsProvider, props: { actions } },
]
```

---

## File structure convention

```
my-component/
  types.ts               ← ComponentState interface
  my-component.styles.ts ← Root CVA styles
  actions/
    submit.action.ts     ← One action per file
    index.ts             ← ActionRecord barrel
  slots/
    header/
      index.tsx          ← defineSlot
      styles.ts          ← CVA styles for this slot
    fields/
      index.tsx
      styles.ts
    footer/
      index.tsx
      styles.ts
    index.ts             ← export { default as Header } from "./header" ...
  index.tsx              ← defineComponent
```

`import * as slots from "./slots"` then `slots` passes directly to `defineComponent`.

---

## Styling convention

All styles live in `*.styles.ts` according to [CVA](https://cva.style)

```ts
// button.styles.ts
import { cva } from "class-variance-authority";

export const buttonStyles = cva("inline-flex items-center ...", {
  variants: {
    size: { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-base" },
    variant: { primary: "bg-blue-600 text-white", secondary: "bg-gray-100 text-gray-900" },
  },

  defaultVariants: { size: "md", variant: "primary" },
});
```

State flows from `defineSlot`'s second argument into CVA variant calls:

```tsx
export default defineSlot<ButtonState>((content, state) =>
  content ? <span class={labelStyles({ size: state.size })}>{content}</span> : null
)
```