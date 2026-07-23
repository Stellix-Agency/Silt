import { createSignal } from "solid-js";
import { createContextProvider } from "../context";

/** Named map of async actions, each receives the current component state */
export type ActionRecord = Record<string, (state: Record<string, unknown>) => Promise<void>>;

/**
 * Capability that adds async action execution to a component.
 *
 * Provides:
 * - `loading(key?)` : `true` while an action runs. Without a key, `true` if *any* action
 *   is running; with a key, only that action.
 * - `error(key?)` : without a key, the last action error; with a key, that action's error.
 * - `run(actionKey)` : executes the named action; manages loading/error automatically.
 *
 * Mount via `capabilities` in `defineComponent`:
 * ```ts
 * { Provider: ActionsProvider, props: { actions: myActions } }
 * ```
*/
export const [ActionsProvider, useActions] = createContextProvider(
  (props: { state: Record<string, unknown>; actions: ActionRecord }) => {
    const [running, setRunning] = createSignal<Record<string, boolean>>({});
    const [errors, setErrors] = createSignal<Record<string, string | undefined>>({});
    const [lastError, setLastError] = createSignal<string | undefined>();

    const loading = (actionKey?: string): boolean =>
      actionKey ? !!running()[actionKey] : Object.values(running()).some(Boolean);

    const error = (actionKey?: string): string | undefined =>
      actionKey ? errors()[actionKey] : lastError();

    async function run(actionKey: string): Promise<void> {
      const action = props.actions[actionKey];
      if (!action) return;

      setRunning((prev) => ({ ...prev, [actionKey]: true }));
      setErrors((prev) => ({ ...prev, [actionKey]: undefined }));
      setLastError(undefined);
      try {
        await action(props.state);
      } catch (err) {
        const message = err instanceof Error ? err.message : "An error occurred";
        setErrors((prev) => ({ ...prev, [actionKey]: message }));
        setLastError(message);
      } finally {
        setRunning((prev) => ({ ...prev, [actionKey]: false }));
      }
    }

    return { loading, error, run };
  }
);