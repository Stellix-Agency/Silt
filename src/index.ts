/** @packageDocumentation Silt — Declarative, capability-driven component framework for SolidJS. */

export type { ActionRecord } from "./capabilities/actions.capability";
export type { SchemaRecord } from "./capabilities/validation.capability";
export type { ComponentContext, CapabilityEntry, ComposableComponent } from "./types";

export { defineComponent } from "./handler";
export { defineSlot } from "./slot";
export { useComponent } from "./context";
export { ValidationProvider, useValidation, ActionsProvider, useActions } from "./capabilities";
export { createLazyMount } from "./lazy-mount";