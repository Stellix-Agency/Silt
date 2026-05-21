import type { Component } from "solid-js"
import { createStore } from "solid-js/store"
import { componentContext } from "./context"
import type { ComponentDefinition, SlotRecord, CapabilityEntry, ComponentContext, LayoutFn } from "./types"

/** Options used to create a component instance. */
interface ComponentOptions<TState extends Record<string, unknown>> {
  /** The declarative component definition */
  definition: ComponentDefinition<TState>
  /** Slots provided by the host */
  slots: SlotRecord
  /** Optional layout wrapper that receives rendered slots */
  layout?: LayoutFn
  /** Optional capabilities applied as providers around the component */
  capabilities?: CapabilityEntry[]
}

/**
 * Create a renderable component from a `ComponentDefinition` and slots.
 * The returned component wires state, optional layout and capability providers.
 */
export function defineComponent<TState extends Record<string, unknown>>({
  definition,
  slots,
  layout,
  capabilities = [],
}: ComponentOptions<TState>): Component {
  return () => {
    const [state, setState] = createStore<TState>({ ...definition.state })

    function set(key: keyof TState, value: unknown) {
      setState(key as any, value as any)
    }

    const ctx: ComponentContext<TState> = { state, set }

    const Slots: Component = () => {
      return (
        <componentContext.Provider value={ctx}>
          {layout
            ? layout(<>{Object.values(slots).map((Slot) => <Slot />)}</>)
            : Object.values(slots).map((Slot) => <Slot />)}
        </componentContext.Provider>
      )
    }

    const Wrapped = capabilities.reduce(
      (Inner, { Provider, props }) => {
        return () => (
          <Provider {...props} state={state}>
            <Inner />
          </Provider>
        )
      },
      Slots as Component
    )

    return <Wrapped />
  }
}