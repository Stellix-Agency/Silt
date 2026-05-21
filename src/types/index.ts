import type { Component, JSXElement } from "solid-js"

/**
 * Definition shape for a component managed by the system.
 * @template TState - the shape of the component's state object
 */
export interface ComponentDefinition<TState extends Record<string, unknown>> {
  /** Human-readable component name */
  name: string
  /** Initial state for the component */
  state: TState
}

/** Map of slot name → slot component */
export type SlotRecord = Record<string, Component>

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
