import type { Component, ParentComponent, ParentProps } from "solid-js"

/**
 * Context injected into every component render and slot
 * Access via `useComponent<TState>()`
 *
 * @template TState - The component's state shape
*/
export interface ComponentContext<TState extends Record<string, unknown>> {
  /** Reactive state snapshot (SolidJS store) */
  state: TState

  /** Update a single state key */
  set: (key: keyof TState, value: unknown) => void

  /** Whether the consumer provided content for the named slot (e.g. `hasSlot("Label")`) */
  hasSlot: (name: string) => boolean

  /** CSS class passed from outside the component, applied to the root element */
  class?: string
};

/**
 * Describes a capability provider to wrap around a component
 * Each capability receives `state` and any extra `props` automatically
*/
export interface CapabilityEntry {
  Provider: Component<any>
  props?: Record<string, unknown>
};

/**
 * A composable component returned by `defineComponent`
 * Accepts `class`, `children`, and all state keys as controlled props
 * When `TSlots` is provided, sub-components (e.g. `Button.Label`) are attached
 *
 * @template TState - The component's state shape
 * @template TSlots - Union of slot name strings (e.g. `"Icon" | "Label"`)
*/
export type ComposableComponent<
  TState extends Record<string, unknown> = Record<string, unknown>,
  TSlots extends string = never
> = Component<ParentProps & { class?: string } & Partial<TState>>
  & ([TSlots] extends [never] ? unknown : { [K in TSlots]: ParentComponent });