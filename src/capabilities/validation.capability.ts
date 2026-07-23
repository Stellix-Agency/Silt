import type { ZodSchema } from "zod";
import { createSignal } from "solid-js";
import { createContextProvider } from "../context";

/** Named map of Zod schemas, keyed by the field or form section they validate */
export type SchemaRecord = Record<string, ZodSchema>;

/**
 * Capability that adds Zod-based validation to a component
 *
 * Provides:
 * - `errors()` : reactive map of `{ fieldName: errorMessage }`. Keys use the full issue
 *   path joined with `.` (e.g. `"address.city"`), so nested fields don't collide.
 * - `validate(schemaKey)` : runs the named schema against current state;
 *   returns `true` on success, `false` and populates `errors()` on failure.
 * - `setError(field, message)` / `clearError(field)` / `clearErrors()` : imperatively
 *   drive errors — e.g. map a server error ("email already taken") onto a field.
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
            [issue.path.map(String).join(".")]: issue.message,
          }), {})
        )

        return false;
      }

      setErrors({});
      return true;
    }

    function setError(field: string, message: string): void {
      setErrors((prev) => ({ ...prev, [field]: message }));
    }

    function clearError(field: string): void {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }

    function clearErrors(): void {
      setErrors({});
    }

    return { errors, validate, setError, clearError, clearErrors };
  }
);