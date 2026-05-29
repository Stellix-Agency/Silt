import type { ComponentContext } from "@/types";
import { createContext, useContext } from "solid-js";

/** Internal Solid context carrying the active component's state and setter */
export const componentContext = createContext<ComponentContext<Record<string, unknown>>>();

/**
 * Access the parent `defineComponent` context from within a render function or slot
 * Throws if called outside a `defineComponent` tree
 *
 * @template TState - The component's state shape.
*/
export function useComponent<TState extends Record<string, unknown>>(): ComponentContext<TState> {
  const ctx = useContext(componentContext);
  if (!ctx) throw new Error("useComponent must be used inside defineComponent");

  return ctx as ComponentContext<TState>;
};