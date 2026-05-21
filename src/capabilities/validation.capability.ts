import { createSignal } from "solid-js"
import { createContextProvider } from "../context"
import type { ZodSchema } from "zod"

/** Record of named zod schemas used for validation */
export type SchemaRecord = Record<string, ZodSchema>

/**
 * Provider + hook pair that expose `errors` and a `validate` helper.
 * `validate` runs the named schema against the provided `state`.
 */
export const [ValidationProvider, useValidation] = createContextProvider(
  (props: { state: any; schemas: SchemaRecord }) => {
    const [errors, setErrors] = createSignal<Record<string, string>>({})

    function validate(schemaKey: string) {
      const schema = props.schemas[schemaKey]
      if (!schema) return true

      const result = schema.safeParse(props.state)
      if (!result.success) {
        setErrors(
          result.error.issues.reduce((acc, issue) => ({
            ...acc,
            [issue.path[0]]: issue.message,
          }), {})
        )
        return false
      }

      setErrors({})
      return true
    }

    return { errors, validate }
  }
)