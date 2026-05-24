import type { Component, JSXElement, ParentComponent } from "solid-js"

/**
 * Definition shape for a component managed by the system.
 * @template TState - the shape of the component's state object
 */
export interface ComponentDefinition<TState extends Record<string, unknown>> {
  /** Human-readable component name */
  name: string
  /** Initial state for the component */
  state: TState
  /** Optional list of named slots this component supports (e.g., "Icon", "Label") */
  slots?: string[]
}

/**
 * Map of slot name → slot content component.
 * Deprecated: Use composable slots pattern with slot sub-components instead.
 */
export type SlotRecord = Record<string, Component>

/**
 * Named slot component descriptor. Used internally to support slot composition.
 * A named slot is a sub-component that automatically inherits parent context.
 */
export interface NamedSlotComponent<TState extends Record<string, unknown> = Record<string, unknown>> {
  /** Display name of the slot (e.g., "Icon", "Label") */
  displayName: string
  /** The slot component itself, wrapped in context provider */
  Component: ParentComponent
}

/**
 * Context exposed to component internals: current state and a setter.
 * @template TState - the shape of the component's state
 */
export interface ComponentContext<TState extends Record<string, unknown>> {
  state: TState
  set: (key: keyof TState, value: unknown) => void
}

/** Entry describing a capability wrapper to apply to a component */
export interface CapabilityEntry {
  /** Provider component that will wrap the inner component */
  Provider: Component<any>
  /** Optional props passed to the Provider */
  props?: Record<string, unknown>
}

/** Layout function receives rendered slots and returns JSX to place them */
export type LayoutFn = (slots: JSXElement) => JSXElement

/**
 * Composable component with attached slot sub-components.
 * Usage: <Button><Button.Icon>...</Button.Icon></Button>
 * @template TState - the shape of the component's state
 */
export interface ComposableComponent<
  TState extends Record<string, unknown> = Record<string, unknown>
> extends Component {
  /** Slot sub-components attached to this component (e.g., Button.Icon) */
  [slotName: string]: ParentComponent | undefined
}
