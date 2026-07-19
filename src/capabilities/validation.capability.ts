import type { ZodSchema } from "zod";
import { createSignal } from "solid-js";
import { createContextProvider } from "../context";

/** Named map of Zod schemas, keyed by the field or form section they validate */
export type SchemaRecord = Record<string, ZodSchema>;

/**
 * Capability that adds Zod-based validation to a component
 *
 * Provides:
 * - `errors()` : reactive map of `{ fieldName: errorMessage }`
 * - `validate(schemaKey)` : runs the named schema against current state;
 *   returns `true` on success, `false` and populates `errors()` on failure
 *
 * Mount via `capabilities` in `defineComponent`:
 * ```ts
 * { Provider: ValidationProvider, props: { schemas: mySchemas } }
 * ```
*/
export const [ValidationProvider, useValidation] = createContextProvider(
  (props: { state: Record<string, unknown>; schemas: SchemaRecord }) => {
    const [errors, setErrors] = createSignal<Record<string, string>>({});

    function validate(schemaKey: string): boolean {
      const schema = props.schemas[schemaKey];
      if (!schema) return true;

      const result = schema.safeParse(props.state);
      if (!result.success) {
        setErrors(
          result.error.issues.reduce<Record<string, string>>((acc, issue) => ({
            ...acc,
            [String(issue.path[0])]: issue.message,
          }), {})
        )

        return false;
      }

      setErrors({});
      return true;
    }

    return { errors, validate };
  }
);