import { createSignal } from "solid-js"
import { createContextProvider } from "../context"

/** Map of named async actions that receive the current state. */
export type ActionRecord = Record<string, (state: any) => Promise<void>>

/** Provider + hook pair exposing `loading`, `error` and `run(actionKey)` */
export const [ActionsProvider, useActions] = createContextProvider(
  (props: { state: any; actions: ActionRecord }) => {
    const [loading, setLoading] = createSignal(false)
    const [error, setError] = createSignal<string | null>(null)

    async function run(actionKey: string) {
      const action = props.actions[actionKey]
      if (!action) return

      setLoading(true)
      setError(null)
      try {
        await action(props.state)
      } catch {
        setError("Une erreur est survenue")
      } finally {
        setLoading(false)
      }
    }

    return { loading, error, run }
  }
)