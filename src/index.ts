/** Public entry: component factory and helpers */
export { defineComponent } from "./handler"
export { useComponent } from "./context"
export { ValidationProvider, useValidation, ActionsProvider, useActions } from "./capabilities"
export type { ComponentContext, ComponentDefinition, SlotRecord, CapabilityEntry } from "./types"