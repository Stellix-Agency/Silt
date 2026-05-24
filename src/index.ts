/** Public entry: component factory and helpers */
export { defineComponent } from "./handler"
export { useComponent } from "./context"
export { ValidationProvider, useValidation, ActionsProvider, useActions } from "./capabilities"
export { createSlotFactory } from "./slot-factory"
export type { ComponentContext, ComponentDefinition, SlotRecord, CapabilityEntry, ComposableComponent, NamedSlotComponent } from "./types"