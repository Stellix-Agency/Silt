import { createSignal } from "solid-js";
import { createContextProvider } from "@/context";

/** Named map of async actions, each receives the current component state */
export type ActionRecord = Record<string, (state: Record<string, unknown>) => Promise<void>>;

/**
 * Capability that adds async action execution to a component.
 *
 * Provides:
 * - `loading()` : `true` while an action is running.
 * - `error()` : last action error message, `undefined` when none.
 * - `run(actionKey)` : executes the named action; manages loading/error automatically.
 *
 * Mount via `capabilities` in `defineComponent`:
 * ```ts
 * { Provider: ActionsProvider, props: { actions: myActions } }
 * ```
*/
export const [ActionsProvider, useActions] = createContextProvider(
  (props: { state: Record<string, unknown>; actions: ActionRecord }) => {
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal<string | undefined>();

    async function run(actionKey: string): Promise<void> {
      const action = props.actions[actionKey];
      if (!action) return;

      setLoading(true);
      setError(undefined);
      try {
        await action(props.state);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    return { loading, error, run };
  }
);