import { createContext, useContext, ParentComponent, Context } from "solid-js"
import type { ComponentContext } from "./types"

/**
 * Create a factory that generates composable slot sub-components.
 * Each slot is a context-aware ParentComponent that wraps its content
 * in the component's context, giving it automatic access to state, actions, validation.
 *
 * @param contextProvider The component's internal context provider
 * @param declaredSlots Optional list of slot names this component supports
 * @returns Record of named slot components (e.g., { Icon: ..., Label: ... })
 *
 * @example
 * const [componentCtx, slotComponents] = createSlotFactory(
 *   componentContext,
 *   { state, set },
 *   ["Icon", "Label"]
 * )
 * // Usage in component:
 * export const Button = defineComponent({
 *   definition: { name: "Button", state: { ... }, slots: ["Icon", "Label"] },
 *   slotComponents: slotComponents
 * })
 * // Consumer usage:
 * <Button><Button.Icon>ArrowRight</Button.Icon></Button>
 */
export function createSlotFactory<TState extends Record<string, unknown>>(
  componentContextInstance: Context<ComponentContext<TState>>,
  contextValue: ComponentContext<TState>,
  declaredSlots?: string[]
): Record<string, ParentComponent> {
  const slots: Record<string, ParentComponent> = {}

  const slotNames = declaredSlots || []

  for (const slotName of slotNames) {
    // Create a slot component that wraps children in the context provider
    const SlotComponent: ParentComponent = (props) => {
      return (
        <componentContextInstance.Provider value={contextValue}>
          {props.children}
        </componentContextInstance.Provider>
      )
    }
    SlotComponent.displayName = slotName
    slots[slotName] = SlotComponent
  }

  return slots
}

