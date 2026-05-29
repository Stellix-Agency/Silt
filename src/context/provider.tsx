import type { FlowComponent } from "solid-js"
import { createContext, useContext } from "solid-js"

/**
 * Create a typed context provider/hook pair
 * The factory receives the provider's props and returns the context value
 * The returned hook throws if called outside the provider tree
 *
 * @param factory - Builds the context value from provider props
 * @param defaultValue - Optional fallback used when no provider is mounted
 * @returns Tuple of `[Provider, useContextHook]`
 *
 * @example
 * const [ThemeProvider, useTheme] = createContextProvider(
 *   (props: { dark: boolean }) => ({ dark: props.dark }),
 * )
*/
export function createContextProvider<T, Props extends Record<string, unknown> = Record<never, never>>(
  factory: (props: Props) => T,
  defaultValue?: T
): [provider: FlowComponent<Props>, useContext: () => T] {
  const Context = createContext<T>(defaultValue as T);

  const Provider: FlowComponent<Props> = (props) => {
    const value = factory(props);

    return (
      <Context.Provider value={value}>
        {props.children}
      </Context.Provider>
    );
  };

  function use(): T {
    const ctx = useContext(Context);
    if (ctx === undefined) throw new Error("useContext must be used inside Provider");

    return ctx;
  }

  return [Provider, use];
};