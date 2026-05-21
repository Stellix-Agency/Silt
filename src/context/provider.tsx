import { createContext, useContext } from "solid-js"
import type { FlowComponent } from "solid-js"

/**
 * Factory helper to create a typed context provider and its hook.
 * Returns a provider component and a corresponding `use` hook.
 *
 * Example: `const [Provider, useFoo] = createContextProvider((props) => ({...}), {})`
 */
export function createContextProvider<T, Props extends Record<string, any> = {}>(
  factory: (props: Props) => T,
  defaultValue?: T
): [provider: FlowComponent<Props>, useContext: () => T] {
  const Context = createContext<T>(defaultValue as T)

  const Provider: FlowComponent<Props> = (props) => {
    const value = factory(props)
    return (
      <Context.Provider value={value}>
        {props.children}
      </Context.Provider>
    )
  }

  function use(): T {
    const ctx = useContext(Context)
    if (ctx === undefined) throw new Error("useContext must be used inside Provider")
    return ctx
  }

  return [Provider, use]
}
