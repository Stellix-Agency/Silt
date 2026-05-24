import type { Component, ParentComponent } from "solid-js"
import { createStore } from "solid-js/store"
import { componentContext } from "./context"
import type { ComponentDefinition, SlotRecord, CapabilityEntry, ComponentContext, LayoutFn, ComposableComponent } from "./types"
import { createSlotFactory } from "./slot-factory"

/** Options used to create a component instance. */
interface ComponentOptions<TState extends Record<string, unknown>> {
  /** The declarative component definition */
  definition: ComponentDefinition<TState>
  /** Slots provided by the host (legacy) */
  slots?: SlotRecord
  /** Optional layout wrapper that receives rendered slots */
  layout?: LayoutFn
  /** Optional capabilities applied as providers around the component */
  capabilities?: CapabilityEntry[]
  /** Component render function that uses slots */
  render?: (props: {
    slots: Record<string, ParentComponent>
  }) => any
}

/**
 * Create a renderable component from a `ComponentDefinition` and slots.
 * The returned component wires state, optional layout and capability providers.
 *
 * **Composable slots pattern:**
 * When `definition.slots` is defined and a `render` function is provided,
 * the returned component has sub-components attached (e.g., Button.Icon, Button.Label).
 * These sub-components automatically have access to the parent's state via useComponent().
 *
 * @example
 * ```tsx
 * const Button = defineComponent({
 *   definition: {
 *     name: "Button",
 *     state: { loading: false },
 *     slots: ["Icon", "Label"]
 *   },
 *   render: ({ slots }) => (
 *     <button>
 *       {slots.Icon && <slots.Icon />}
 *       {slots.Label && <slots.Label />}
 *     </button>
 *   )
 * })
 *
 * // Consumer usage:
 * <Button>
 *   <Button.Icon>ArrowRight</Button.Icon>
 *   <Button.Label>Send</Button.Label>
 * </Button>
 * ```
 */
export function defineComponent<TState extends Record<string, unknown>>(
  options: ComponentOptions<TState>
): ComposableComponent<TState> {
  const { definition, slots: legacySlots, layout, capabilities = [], render } = options

  // The factory function that creates the actual component instance
  const ComponentFactory = () => {
    const [state, setState] = createStore<TState>({ ...definition.state })

    function set(key: keyof TState, value: unknown) {
      setState(key as any, value as any)
    }

    const ctx: ComponentContext<TState> = { state, set }

    // Create composable slot sub-components if slots are declared
    const slotComponents = definition.slots
      ? createSlotFactory(componentContext, ctx, definition.slots)
      : {}

    const renderContent = () => {
      if (render) {
        // Composable pattern: render function receives slots
        return (
          <componentContext.Provider value={ctx}>
            {render({ slots: slotComponents })}
          </componentContext.Provider>
        )
      } else if (legacySlots) {
        // Legacy pattern: static slots
        const Slots: Component = () => {
          return (
            <componentContext.Provider value={ctx}>
              {layout
                ? layout(<>{Object.values(legacySlots).map((Slot) => <Slot />)}</>)
                : Object.values(legacySlots).map((Slot) => <Slot />)}
            </componentContext.Provider>
          )
        }
        return <Slots />
      }
      return null
    }

    const Wrapped = capabilities.reduce(
      (Inner, { Provider, props }) => {
        return () => (
          <Provider {...props} state={state}>
            <Inner />
          </Provider>
        )
      },
      renderContent as Component
    )

    return <Wrapped />
  }

  // Attach slot sub-components to the component factory function.
  // These provide the consumer API: <Button><Button.Icon>...</Button.Icon></Button>
  // The actual wiring happens inside the render when consumers include these slots.
  if (definition.slots) {
    for (const slotName of definition.slots) {
      // Each slot is a pass-through wrapper. The real slot component is created
      // in the factory and passed through the render function.
      ;(ComponentFactory as any)[slotName] = ((props: any) => {
        return <>{props.children}</>
      }) as ParentComponent
    }
  }

  return ComponentFactory as ComposableComponent<TState>
}