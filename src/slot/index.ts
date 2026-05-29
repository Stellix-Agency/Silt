import type { Component, JSXElement, ParentComponent } from "solid-js";
import type { ComponentContext } from "@/types";
import { createComponent } from "solid-js";
import { useComponent } from "@/context";

/**
 * Define a structural slot component for use inside `defineComponent`
 *
 * The render callback receives two arguments:
 * - `content` : JSX already resolved from the consumer's slot usage (e.g. `<AuthForm.Header>`)
 *   `undefined` when the consumer did not provide that slot
 * - `state` : reactive state of the parent component, typed via `TState`
 *   Use it to resolve CVA variant classes (e.g. `labelStyles({ size: state.size })`)
 *
 * For write access to state (`set`), call `useComponent<TState>()` directly inside
 * the render callback. Capability hooks (`useValidation`, `useActions`) are also
 * safe to call inside the callback : they run in the correct reactive scope
 *
 * @template TState - Parent component's state shape. Defaults to `Record<string, unknown>`
 *
 * @example
 * // Wrapper slot : Consumer provides content
 * export default defineSlot((content) =>
 *   content ? <div class={headerStyles()}>{content}</div> : null
 * );
 *
 * @example
 * // State-aware slot : Resolves CVA variants from parent state
 * export default defineSlot<ButtonState>((content, state) =>
 *   content ? <span class={labelStyles({ size: state.size })}>{content}</span> : null
 * );
 *
 * @example
 * // Internal slot : Reads and writes parent state, no consumer content
 * export default defineSlot<FormState>((_, state) => {
 *   const { set } = useComponent<FormState>();
 *   const { errors } = useValidation();
 * 
 *   return <input value={state.email} onInput={(e) => set("email", e.currentTarget.value)} />
 * });
*/
export function defineSlot<TState extends Record<string, unknown> = Record<string, unknown>>(
  render: (content: JSXElement | undefined, state: TState) => JSXElement | null
): Component<{ content?: ParentComponent }> {
  return (props) => {
    const { state } = useComponent<TState>() as ComponentContext<TState>;
    const C = props.content;

    return render(C ? createComponent(C, {}) : undefined, state);
  };
};