import type { Accessor } from "solid-js";
import { createEffect, createSignal } from "solid-js";

/**
 * `createLazyMount` returns an accessor that flips to `true` the first time
 * `open()` becomes `true`, and stays `true` afterwards. Gate the overlay's
 * `defineComponent` instance behind it with a plain `<Show>` so it isn't
 * mounted : and Silt's slot collection isn't triggered : until the overlay
 * has actually been opened once.
 *
 * @example
 * const everOpened = createLazyMount(() => props.open);
 * return (
 *   <Show when={everOpened()}>
 *     <RealOverlayComponent {...props}>{props.children}</RealOverlayComponent>
 *   </Show>
 * );
 */
export function createLazyMount(open: Accessor<boolean>): Accessor<boolean> {
  const [everOpened, setEverOpened] = createSignal(false);
  createEffect(() => {
    if (open()) setEverOpened(true);
  });

  return everOpened;
};