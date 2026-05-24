import type { ParentComponent, Context } from "solid-js"
import type { ComponentContext } from "./types"

/**
 * Create a factory that generates composable slot sub-components.
 * Each slot is a context-aware ParentComponent that wraps its content
 * in the component's context, giving it automatic access to state, actions, validation.
 *
 * @param contextProvider The component's internal context provider
 * @param contextValue The context value to provide
 * @param declaredSlots Optional list of slot names this component supports
 * @returns Record of named slot components (e.g., { Icon: ..., Label: ... })
 *
 * @example
 * const slotComponents = createSlotFactory(
 *   componentContext,
 *   { state, set },
 *   ["Icon", "Label"]
 * )
 * // Usage in component render:
 * {slots.Icon && <slots.Icon>content</slots.Icon>}
 */
export function createSlotFactory<TState extends Record<string, unknown>>(
  ContextInstance: Context<ComponentContext<TState> | undefined>,
  contextValue: ComponentContext<TState>,
  declaredSlots?: string[]
): Record<string, ParentComponent> {
  const slots: Record<string, ParentComponent> = {}
  const slotNames = declaredSlots || []

  for (const slotName of slotNames) {
    // Create a slot component that wraps children in the context provider
    const SlotComponent: ParentComponent = (props) => (
      <ContextInstance.Provider value={contextValue}>
        {props.children}
      </ContextInstance.Provider>
    )
    slots[slotName] = SlotComponent
  }

  return slots
}

