# Composable Slots Examples

This file demonstrates practical uses of Silt's composable slots API.

## Example 1: Simple Button with Icon

### Component Definition

```tsx
import { defineComponent, useComponent } from "@stellix.agency/silt"
import type { ComposableComponent } from "@stellix.agency/silt"

interface ButtonState {
  loading: boolean
  disabled: boolean
}

export const Button: ComposableComponent<ButtonState> = defineComponent({
  definition: {
    name: "Button",
    state: {
      loading: false,
      disabled: false,
    },
    slots: ["Icon", "Label"],
  },
  render: ({ slots }) => {
    const { state } = useComponent<ButtonState>()

    return (
      <button
        disabled={state.disabled || state.loading}
        class="px-4 py-2 rounded bg-blue-500 text-white"
        aria-busy={state.loading}
      >
        {slots.Icon && (
          <span class="inline-flex mr-2">
            {state.loading ? <Spinner /> : <slots.Icon />}
          </span>
        )}
        {slots.Label && <slots.Label />}
      </button>
    )
  },
})
```

### Usage

```tsx
function MyPage() {
  return (
    <div>
      <Button>
        <Button.Icon>
          <PlusIcon />
        </Button.Icon>
        <Button.Label>Add Item</Button.Label>
      </Button>

      {/* Icon without label */}
      <Button>
        <Button.Icon>
          <SaveIcon />
        </Button.Icon>
      </Button>

      {/* Label without icon */}
      <Button>
        <Button.Label>Cancel</Button.Label>
      </Button>
    </div>
  )
}
```

## Example 2: Form Field with Validation

### Component Definition

```tsx
import { defineComponent, useComponent, ValidationProvider, useValidation } from "@stellix.agency/silt"
import { z } from "zod"

interface FormFieldState {
  value: string
  touched: boolean
}

export const FormField = defineComponent({
  definition: {
    name: "FormField",
    state: {
      value: "",
      touched: false,
    },
    slots: ["Label", "Input", "Hint", "Error"],
  },
  render: ({ slots }) => {
    const { state, set } = useComponent<FormFieldState>()
    const { errors } = useValidation()

    const handleBlur = () => set("touched", true)

    return (
      <div class="form-group">
        {slots.Label && (
          <label class="block font-semibold mb-2">
            <slots.Label />
          </label>
        )}
        
        {slots.Input && (
          <div class="mb-2">
            <slots.Input onBlur={handleBlur} />
          </div>
        )}

        {slots.Hint && !state.touched && (
          <p class="text-sm text-gray-500 mb-1">
            <slots.Hint />
          </p>
        )}

        {slots.Error && state.touched && errors["value"] && (
          <p class="text-sm text-red-500">
            <slots.Error />
          </p>
        )}
      </div>
    )
  },
  capabilities: [
    {
      Provider: ValidationProvider,
      props: {
        schemas: {
          email: z.object({
            value: z.string().email("Invalid email"),
          }),
        },
      },
    },
  ],
})
```

### Usage

```tsx
function SignupForm() {
  return (
    <form>
      <FormField>
        <FormField.Label>Email</FormField.Label>
        <FormField.Input>
          <input type="email" placeholder="you@example.com" />
        </FormField.Input>
        <FormField.Hint>We'll never share your email</FormField.Hint>
        <FormField.Error>Please enter a valid email</FormField.Error>
      </FormField>
    </form>
  )
}
```

## Example 3: Card Component

### Component Definition

```tsx
interface CardState {
  expanded: boolean
}

export const Card = defineComponent({
  definition: {
    name: "Card",
    state: {
      expanded: false,
    },
    slots: ["Header", "Body", "Footer", "Actions"],
  },
  render: ({ slots }) => {
    const { state, set } = useComponent<CardState>()

    return (
      <div class="border rounded-lg shadow-sm">
        {slots.Header && (
          <div
            class="p-4 border-b cursor-pointer hover:bg-gray-50"
            onClick={() => set("expanded", !state.expanded)}
          >
            <slots.Header />
          </div>
        )}

        {state.expanded && slots.Body && (
          <div class="p-4">
            <slots.Body />
          </div>
        )}

        {slots.Actions && (
          <div class="p-4 border-t flex gap-2">
            <slots.Actions />
          </div>
        )}

        {slots.Footer && (
          <div class="p-4 border-t text-sm text-gray-500">
            <slots.Footer />
          </div>
        )}
      </div>
    )
  },
})
```

### Usage

```tsx
function ProductCard() {
  return (
    <Card>
      <Card.Header>
        <h3 class="font-bold">Product Details</h3>
      </Card.Header>

      <Card.Body>
        <p>Click to expand and see the full product information...</p>
      </Card.Body>

      <Card.Actions>
        <button>Edit</button>
        <button>Delete</button>
      </Card.Actions>

      <Card.Footer>
        Last updated 2 hours ago
      </Card.Footer>
    </Card>
  )
}
```

## Example 4: Dynamic State Access in Slots

Slots have full access to parent state via `useComponent()`:

```tsx
interface CounterButtonState {
  count: number
  isMaxed: boolean
}

export const CounterButton = defineComponent({
  definition: {
    name: "CounterButton",
    state: {
      count: 0,
      isMaxed: false,
    },
    slots: ["Icon", "Label", "Badge"],
  },
  render: ({ slots }) => {
    const { state, set } = useComponent<CounterButtonState>()

    return (
      <button
        onClick={() => {
          const newCount = state.count + 1
          set("count", newCount)
          set("isMaxed", newCount >= 10)
        }}
        disabled={state.isMaxed}
      >
        {slots.Icon && <slots.Icon />}
        {slots.Label && <slots.Label />}
        {slots.Badge && state.count > 0 && <slots.Badge />}
      </button>
    )
  },
})
```

### Usage - Slots React to Parent State

```tsx
function App() {
  return (
    <CounterButton>
      <CounterButton.Icon>
        {
          // This reactive expression runs whenever count changes
          useComponent<CounterButtonState>().state.isMaxed ? (
            <MaxIcon />
          ) : (
            <PlusIcon />
          )
        }
      </CounterButton.Icon>

      <CounterButton.Label>
        {
          // Labels can also react to state
          useComponent<CounterButtonState>().state.isMaxed
            ? "Max Reached"
            : "Add More"
        }
      </CounterButton.Label>

      <CounterButton.Badge>
        {useComponent<CounterButtonState>().state.count}
      </CounterButton.Badge>
    </CounterButton>
  )
}
```

## Example 5: Composable List Items

```tsx
interface ListItemState {
  selected: boolean
  hovering: boolean
}

export const ListItem = defineComponent({
  definition: {
    name: "ListItem",
    state: {
      selected: false,
      hovering: false,
    },
    slots: ["Checkbox", "Avatar", "Title", "Subtitle", "Actions"],
  },
  render: ({ slots }) => {
    const { state, set } = useComponent<ListItemState>()

    return (
      <div
        class={`p-3 border-b cursor-pointer transition ${
          state.selected ? "bg-blue-50" : ""
        } ${state.hovering ? "bg-gray-50" : ""}`}
        onClick={() => set("selected", !state.selected)}
        onMouseEnter={() => set("hovering", true)}
        onMouseLeave={() => set("hovering", false)}
      >
        <div class="flex items-center gap-3">
          {slots.Checkbox && (
            <div>
              <slots.Checkbox />
            </div>
          )}

          {slots.Avatar && (
            <div class="flex-shrink-0">
              <slots.Avatar />
            </div>
          )}

          <div class="flex-1 min-w-0">
            {slots.Title && <div class="font-semibold truncate"><slots.Title /></div>}
            {slots.Subtitle && <div class="text-sm text-gray-500 truncate"><slots.Subtitle /></div>}
          </div>

          {state.hovering && slots.Actions && (
            <div class="flex-shrink-0">
              <slots.Actions />
            </div>
          )}
        </div>
      </div>
    )
  },
})
```

### Usage

```tsx
function UserList() {
  return (
    <div class="border rounded">
      {users.map((user) => (
        <ListItem>
          <ListItem.Checkbox>
            <input type="checkbox" />
          </ListItem.Checkbox>

          <ListItem.Avatar>
            <img src={user.avatar} class="w-10 h-10 rounded-full" />
          </ListItem.Avatar>

          <ListItem.Title>{user.name}</ListItem.Title>
          <ListItem.Subtitle>{user.email}</ListItem.Subtitle>

          <ListItem.Actions>
            <button onClick={() => editUser(user.id)}>Edit</button>
            <button onClick={() => deleteUser(user.id)}>Delete</button>
          </ListItem.Actions>
        </ListItem>
      ))}
    </div>
  )
}
```

## Example 6: Modal with Header and Footer

```tsx
interface ModalState {
  isOpen: boolean
}

export const Modal = defineComponent({
  definition: {
    name: "Modal",
    state: {
      isOpen: false,
    },
    slots: ["Header", "Body", "Footer"],
  },
  render: ({ slots }) => {
    const { state, set } = useComponent<ModalState>()

    if (!state.isOpen) return null

    return (
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div class="bg-white rounded-lg shadow-lg max-w-md w-full">
          {slots.Header && (
            <div class="p-4 border-b flex justify-between items-center">
              <slots.Header />
              <button onClick={() => set("isOpen", false)}>✕</button>
            </div>
          )}

          {slots.Body && (
            <div class="p-4">
              <slots.Body />
            </div>
          )}

          {slots.Footer && (
            <div class="p-4 border-t flex gap-2 justify-end">
              <slots.Footer />
            </div>
          )}
        </div>
      </div>
    )
  },
})
```

### Usage

```tsx
function ConfirmDialog() {
  const { set } = useComponent<ModalState>()

  return (
    <Modal>
      <Modal.Header>Confirm Delete</Modal.Header>
      <Modal.Body>Are you sure you want to delete this item?</Modal.Body>
      <Modal.Footer>
        <button onClick={() => set("isOpen", false)}>Cancel</button>
        <button onClick={() => {/* delete */; set("isOpen", false)}}>
          Delete
        </button>
      </Modal.Footer>
    </Modal>
  )
}
```

---

These examples show how composable slots enable clean, context-aware component composition while maintaining full access to parent state.
