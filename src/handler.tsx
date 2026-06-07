import type { CapabilityEntry, ComponentContext, ComposableComponent } from "@/types";
import type { Component, JSXElement, ParentComponent, ParentProps } from "solid-js";
import { createContext, createRenderEffect, createSignal, useContext } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { componentContext } from "@/context";

/** Internal context: attached slot sub-components write their children here */
const slotCollectorContext = createContext<((name: string, content: JSXElement) => void) | undefined>(undefined);

/** A slot component created via defineSlot, accepts optional consumer content */
type SlotComponent = Component<{ content?: ParentComponent }>;

/** Map of slot name → Slot component */
type SlotMap = Record<string, SlotComponent>;

/** Props accepted by any composable component: children, class, and all state keys as overrides */
type ComponentProps<TState extends Record<string, unknown>> =
  ParentProps & { class?: string } & Partial<TState>;

/** Options used to create a component instance */
interface ComponentOptions<
  TState extends Record<string, unknown>,
  TSlots extends SlotMap = {}
> {
  name: string;
  state: TState;
  /** Map slot names to their slot components. The framework wires consumer content automatically */
  slots?: TSlots;
  capabilities?: CapabilityEntry[];
  render: (slots: { [K in keyof TSlots]: Component }) => JSXElement;
};

/**
 * Create a composable component with state, named slots and optional capabilities
 * Each key in `slots` maps a slot name to its slot component (created via defineSlot)
 * In `render`, each slot is already wired, just call `<Header />` directly
 *
 * @example
 * ```tsx
 * const AuthForm = defineComponent({
 *   name: "AuthForm",
 *   state: initialState,
 *   slots: { Header: HeaderSlot, Footer: FooterSlot },
 *   render: ({ slots: { Header, Footer } }) => (
 *     <form>
 *       <Header />
 *       <FieldsSlot />
 *       <Footer />
 *     </form>
 *   ),
 * });
 *
 * // Consumer:
 * <AuthForm>
 *   <AuthForm.Header><h2>Welcome</h2></AuthForm.Header>
 *   <AuthForm.Footer>Sign in</AuthForm.Footer>
 * </AuthForm>
 * ```
*/
export function defineComponent<
  TState extends Record<string, unknown>,
  TSlots extends SlotMap = {}
>(
  options: ComponentOptions<TState, TSlots>
): ComposableComponent<TState, Extract<keyof TSlots, string>> {
  const { state: initialState, slots: declaredSlots = {} as TSlots, capabilities = [], render } = options;
  const slotNames = Object.keys(declaredSlots);
  const stateKeys = Object.keys(initialState);

  const ComponentFactory = (props: ComponentProps<TState>) => {
    const [state, setState] = createStore<TState>({ ...initialState });

    function set(key: keyof TState, value: unknown) {
      setState(produce((s) => { (s as any)[key] = value; }));
    };

    createRenderEffect(() => {
      setState(produce((s) => {
        for (const key of stateKeys) {
          const val = (props as Partial<TState>)[key as keyof TState];
          if (val !== undefined) (s as any)[key] = val;
        }
      }));
    });

    const ctx: ComponentContext<TState> = { state, set, class: props.class };

    // One signal per slot, consumer sub-components write here
    const slotSignals: Record<string, ReturnType<typeof createSignal<JSXElement>>> = {};
    for (const slotName of slotNames) {
      slotSignals[slotName] = createSignal<JSXElement>(undefined);
    };

    const registerSlot = (name: string, content: JSXElement) => {
      slotSignals[name]?.[1](content)
    };

    // Each slot in render is already wired: () => <SlotComponent content={consumerContent} />
    const wiredSlots = new Proxy({} as Record<string, Component>, {
      get(_, name: string) {
        const signal = slotSignals[name];
        const SlotComponent = (declaredSlots as SlotMap)[name];
        if (!signal || !SlotComponent) return undefined;

        const [content] = signal;
        return () => {
          const ConsumerContent = content() !== undefined ? (() => <>{content()}</>) : undefined;
          return <SlotComponent content={ConsumerContent} />;
        };
      },
    });

    const renderContent = () => (
      <slotCollectorContext.Provider value={registerSlot}>
        {props.children}
        <componentContext.Provider value={ctx}>
          {render(wiredSlots as { [K in keyof TSlots]: Component })}
        </componentContext.Provider>
      </slotCollectorContext.Provider>
    );

    const Wrapped = capabilities.reduce(
      (Inner, { Provider, props: providerProps }) => () => (
        <Provider {...providerProps} state={state}>
          <Inner />
        </Provider>
      ),
      renderContent as Component
    );

    return <Wrapped />;
  };

  // Attach slot sub-components, collect consumer content into parent signals
  for (const slotName of slotNames) {
    Object.assign(ComponentFactory, {
      [slotName]: (props: ParentProps) => {
        const register = useContext(slotCollectorContext);
        register?.(slotName, props.children);

        return null;
      },
    })
  }

  return ComponentFactory as unknown as ComposableComponent<TState, Extract<keyof TSlots, string>>;
};