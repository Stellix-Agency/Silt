import { createContext, useContext } from "solid-js"
import type { ComponentContext } from "../types"

/** Internal context holding the current component state and setter. */
const componentContext = createContext<ComponentContext<any>>()

/**
 * Hook to access the active component context.
 * Throws if used outside of a `defineComponent` render.
 */
export function useComponent<TState extends Record<string, unknown>>() {
  const ctx = useContext(componentContext)
  if (!ctx) throw new Error("useComponent must be used inside defineComponent")

  return ctx as ComponentContext<TState>
}

export { componentContext }
