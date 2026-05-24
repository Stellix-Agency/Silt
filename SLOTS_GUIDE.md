# Silt Composable Slots Architecture

## Overview

Silt now supports **composable slots** — a pattern where component sub-components (e.g., `<Button.Icon>`, `<Button.Label>`) are context-aware and automatically inherit state, actions, and validation from their parent component.

This is a departure from traditional JSX slot patterns. Instead of passing JSX as props, slots are named sub-components that the consumer composes directly in the render tree.

## Problem Solved

**Before (static JSX props):**
```tsx
// Slot is just a passive function
<Button slots={{ Icon: () => <ArrowRight /> }} />
```

**Now (composable context-aware slots):**
```tsx
// Button.Icon automatically has access to parent state
<Button>
  <Button.Icon>
    {state.loading ? <Spinner /> : <ArrowRight />}
  </Button.Icon>
  <Button.Label>
    {state.loading ? "Sending..." : "Send"}
  </Button.Label>
</Button>
```

## How It Works

### 1. Declare Slots in Component Definition

Define which slots your component supports:

```tsx
const Button = defineComponent({
  definition: {
    name: "Button",
    state: {
      loading: false,
      disabled: false,
    },
    // Declare available slots
    slots: ["Icon", "Label", "Badge"],
  },
  render: ({ slots }) => {
    const { state } = useComponent<ButtonState>()
    
    return (
      <button disabled={state.disabled || state.loading}>
        {/* Slots are automatically wired to context */}
        {slots.Icon && <slots.Icon />}
        {slots.Label && <slots.Label />}
        {slots.Badge && <slots.Badge />}
      </button>
    )
  },
})
```

### 2. Sub-Components Are Automatically Attached

The `defineComponent` factory automatically attaches slot sub-components to the component:

```tsx
// Button.Icon, Button.Label, Button.Badge are now available
export Button // has Icon, Label, Badge attached
```

### 3. Consumer Composes Slots with Full Context Access

Consumers render slots as sub-components. Each slot automatically has access to parent state:

```tsx
<Button>
  <Button.Icon>
    {/* Can call useComponent() here to access button state */}
    <ArrowRight />
  </Button.Icon>
  <Button.Label>Send</Button.Label>
</Button>
```

Inside a slot, you can call `useComponent()` to access the parent state:

```tsx
<Button.Icon>
  {useComponent().state.loading && <Spinner />}
</Button.Icon>
```

## API Reference

### `defineComponent(options)`

Creates a composable component with attached slot sub-components.

**Parameters:**

- `definition` (ComponentDefinition)
  - `name` — Component name
  - `state` — Initial state object
  - `slots?` — Array of slot names this component supports (e.g., `["Icon", "Label"]`)

- `render?` — Function that renders the component body
  - Receives `{ slots: Record<string, ParentComponent> }`
  - Inside render, call `useComponent()` to access state

- `capabilities?` — Array of capability providers (validation, actions)

- `slots?` — (Legacy) static slots dictionary

**Returns:**

A composable component with slot sub-components attached.

**Example:**

```tsx
const MyButton = defineComponent({
  definition: {
    name: "MyButton",
    state: { loading: false },
    slots: ["Icon", "Label"],
  },
  render: ({ slots }) => (
    <button>
      {slots.Icon && <slots.Icon />}
      {slots.Label && <slots.Label />}
    </button>
  ),
  capabilities: [{ Provider: ValidationProvider, props: { schemas: {...} } }],
})
```

### `createSlotFactory(context, contextValue, slotNames)`

Factory function that creates context-aware slot components.

**Used internally by `defineComponent`** — you typically don't call this directly.

**Parameters:**

- `context` — The component's internal context provider
- `contextValue` — The current `{ state, set }` value
- `slotNames` — Array of slot names to create

**Returns:**

Record of `ParentComponent` functions, one per slot name.

## Type System

### `ComposableComponent<TState>`

Interface for components with attached slots.

```typescript
interface ComposableComponent<TState> extends Component {
  [slotName: string]: ParentComponent | undefined
}
```

### `ComponentDefinition<TState>`

```typescript
interface ComponentDefinition<TState> {
  name: string
  state: TState
  slots?: string[] // NEW: Declare available slots
}
```

### `NamedSlotComponent<TState>`

Descriptor for a named slot (internal use).

```typescript
interface NamedSlotComponent<TState> {
  displayName: string
  Component: ParentComponent
}
```

## Design Principles

### 1. Slots Are Sub-Components, Not Props

Don't pass slots as JSX prop values. Instead, compose them as children in the render tree:

```tsx
// ❌ Don't do this (old pattern)
<Button icon={<ArrowRight />} />

// ✅ Do this (composable pattern)
<Button>
  <Button.Icon><ArrowRight /></Button.Icon>
</Button>
```

### 2. Slots Inherit Parent Context Automatically

When a consumer includes a slot, it automatically has access to the parent component's state via `useComponent()`:

```tsx
<Button.Icon>
  {/* useComponent() works here, no manual prop passing */}
  {useComponent().state.loading && <Spinner />}
</Button.Icon>
```

### 3. Slots Are Optional and Independently Omitted

If a consumer doesn't include a slot, the component doesn't render it. No fallback required:

```tsx
<Button>
  <Button.Label>Send</Button.Label>
  {/* No <Button.Icon> — icon is simply not rendered */}
</Button>
```

### 4. Slots Can Be Wrapped or Replaced

Consumers can wrap slot content with additional markup:

```tsx
<Button>
  <Button.Label>
    <span class="premium">Send Premium</span>
  </Button.Label>
</Button>
```

### 5. Backwards Compatibility

The legacy `slots` prop pattern still works. New code should use the composable pattern:

```tsx
// Legacy (still supported)
const OldButton = defineComponent({
  definition: { name: "Button", state: {} },
  slots: { Icon: () => <DefaultIcon /> },
})

// Modern (preferred)
const NewButton = defineComponent({
  definition: { name: "Button", state: {}, slots: ["Icon"] },
  render: ({ slots }) => <button><slots.Icon /></button>,
})
```

## Examples

### Button with Icon, Label, and Badge

```tsx
const Button = defineComponent({
  definition: {
    name: "Button",
    state: { loading: false, disabled: false, count: 0 },
    slots: ["Icon", "Label", "Badge"],
  },
  render: ({ slots }) => {
    const { state } = useComponent<{ loading: boolean; disabled: boolean; count: number }>()

    return (
      <button disabled={state.disabled || state.loading} class="btn">
        {slots.Icon && (
          <span class="btn__icon">
            {state.loading ? <Spinner /> : <slots.Icon />}
          </span>
        )}
        {slots.Label && <span class="btn__label"><slots.Label /></span>}
        {slots.Badge && state.count > 0 && (
          <span class="btn__badge"><slots.Badge /></span>
        )}
      </button>
    )
  },
})

// Usage:
export function MyPage() {
  return (
    <Button>
      <Button.Icon><Plus /></Button.Icon>
      <Button.Label>Add Item</Button.Label>
      <Button.Badge>5</Button.Badge>
    </Button>
  )
}
```

### Card with Header and Footer

```tsx
const Card = defineComponent({
  definition: {
    name: "Card",
    state: { expanded: false },
    slots: ["Header", "Body", "Footer"],
  },
  render: ({ slots }) => (
    <div class="card">
      {slots.Header && <div class="card__header"><slots.Header /></div>}
      {slots.Body && <div class="card__body"><slots.Body /></div>}
      {slots.Footer && <div class="card__footer"><slots.Footer /></div>}
    </div>
  ),
})
```

### Form Field with Label, Input, and Error

```tsx
const FormField = defineComponent({
  definition: {
    name: "FormField",
    state: { value: "", error: null as string | null },
    slots: ["Label", "Input", "Error"],
  },
  render: ({ slots }) => {
    const { state, set } = useComponent<{ value: string; error: string | null }>()

    return (
      <div class="form-field">
        {slots.Label && <label class="form-field__label"><slots.Label /></label>}
        {slots.Input && (
          <div class="form-field__input">
            <slots.Input />
          </div>
        )}
        {slots.Error && state.error && (
          <div class="form-field__error"><slots.Error /></div>
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
```

## Migration Guide

### From Legacy Slots to Composable Slots

**Before:**

```tsx
export const Button = defineComponent({
  definition: { name: "Button", state: { loading: false } },
  slots: { Icon: () => <DefaultIcon /> },
})
```

**After:**

```tsx
export const Button = defineComponent({
  definition: {
    name: "Button",
    state: { loading: false },
    slots: ["Icon"], // Declare available slots
  },
  render: ({ slots }) => (
    <button>
      {slots.Icon && <slots.Icon />}
    </button>
  ),
})
```

**Consumer before:**

```tsx
<Button slots={{ Icon: () => <ArrowRight /> }} />
```

**Consumer after:**

```tsx
<Button>
  <Button.Icon><ArrowRight /></Button.Icon>
</Button>
```

## Best Practices

1. **Always declare slots in `definition.slots`** — This makes the API clear and enables IDE autocomplete
2. **Wrap slots with wrapper elements** — Use semantic markup (`<span class="btn__icon">`, etc.)
3. **Check if slot exists before rendering** — `{slots.Icon && <slots.Icon />}`
4. **Use `useComponent()` inside slots** — To access parent state within slot content
5. **Keep slot content simple** — Slots should be minimal; complex logic belongs in the parent
6. **Document slot names** — Comment which slots are available and what they're for

## Technical Details

### How Context Flows to Slots

1. **Component render** creates state with `createStore()`
2. **`createSlotFactory()`** creates slot sub-components that each wrap content in a context provider
3. **Consumer includes slots** as `<Button.Icon>...</Button.Icon>`
4. **Inside slot** content can call `useComponent()` to access parent state

### Solid.js Integration

Slots leverage Solid.js context providers for dependency injection:

```tsx
// Inside createSlotFactory:
const SlotComponent: ParentComponent = (props) => {
  return (
    <componentContext.Provider value={contextValue}>
      {props.children}
    </componentContext.Provider>
  )
}
```

This ensures every slot has automatic access to parent state.

### Why Not JSX Props?

JSX props require manual context threading and lose connection to parent state:

```tsx
// ❌ Props pattern — loses state connection
<Button Icon={() => <ArrowRight />} />

// ✅ Composable pattern — automatic state access
<Button>
  <Button.Icon>
    {useComponent().state.loading && <Spinner />}
  </Button.Icon>
</Button>
```

## Troubleshooting

### "useComponent must be used inside defineComponent"

Make sure you're calling `useComponent()` inside a slot that's rendered within the component:

```tsx
// ✅ Correct
<Button>
  <Button.Icon>
    {useComponent().state.loading && <Spinner />}
  </Button.Icon>
</Button>

// ❌ Wrong
{useComponent().state.loading && <Spinner />} {/* Called outside component */}
```

### Slot doesn't render

Check that the component's `render` function checks if the slot exists:

```tsx
// ✅ Correct
{slots.Icon && <slots.Icon />}

// ❌ Wrong
<slots.Icon /> {/* Will error if not included */}
```

### State doesn't update in slot

Ensure you're calling `set()` from `useComponent()`:

```tsx
const { state, set } = useComponent<ButtonState>()
set("loading", true) // Update state
```

---

**For more info**, see the `defineComponent` JSDoc or check the `src/examples/` directory.
