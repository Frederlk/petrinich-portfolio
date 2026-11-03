"use client";

import { XIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useRef } from "react";

import { SCREENSHOT_SIZE } from "~/lib/screenshot";

const SIZES = "(min-width: 1536px) 1344px, 100vw";

// Runs a DOM change inside a view transition, or plainly where the API is missing or motion is reduced; `after` runs once either way is done. While it runs, `data-zoom` on <html> takes the header's own view-transition name away (styles/motion.css), so the header is captured with the page and dims under the backdrop with it instead of floating above the morph.
function swap(update: () => Promise<void> | void, after = () => {}) {
  if (
    typeof document.startViewTransition !== "function" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    void Promise.resolve(update()).finally(after);
    return;
  }
  const root = document.documentElement;
  root.dataset.zoom = "";
  void document
    .startViewTransition(update)
    .finished.catch(() => {})
    .finally(() => {
      delete root.dataset.zoom;
      after();
    });
}

// A project screenshot that opens full screen in a native modal <dialog> (focus, Esc and the top layer come with it; styles/motion.css stops the page scrolling behind it). The `shot` view-transition name moves from the thumbnail to the full image inside the transition, so the browser morphs one into the other, and back on close (`::view-transition-group(shot)`). The name is set on the element's style because it has to change between the two captures of one transition, which a render cannot do. Both images take the same `sizes`, so the full one is the cached file of the thumbnail; the open waits for it to decode, so the morph never lands on an empty box. A click while a morph runs is ignored (`busy`): a second transition would cut the first one short and leave the names half moved. Both images are `object-contain`, so a screenshot is never cropped.
export function ScreenshotZoom({ alt, src }: { alt: string; src: string }) {
  const thumb = useRef<HTMLImageElement>(null);
  const full = useRef<HTMLImageElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const busy = useRef(false);

  // The full image is lazy and sits in a closed dialog, so it has not loaded; it is made eager and decoded before the transition starts, because rendering is paused inside the update and a load awaited there never finishes (the browser aborts the transition after 4 to 5s).
  const open = async () => {
    const [t, f, d] = [thumb.current, full.current, dialog.current];
    if (t === null || f === null || d === null || busy.current) {
      return;
    }
    busy.current = true;
    f.loading = "eager";
    await f.decode().catch(() => {});
    t.style.viewTransitionName = "shot";
    swap(
      () => {
        t.style.viewTransitionName = "";
        f.style.viewTransitionName = "shot";
        d.showModal();
      },
      () => {
        busy.current = false;
      }
    );
  };

  const close = () => {
    const [t, f, d] = [thumb.current, full.current, dialog.current];
    if (t === null || f === null || d === null || !d.open || busy.current) {
      return;
    }
    busy.current = true;
    swap(
      () => {
        f.style.viewTransitionName = "";
        t.style.viewTransitionName = "shot";
        d.close();
        // Safari does not focus a button on click, so the dialog has nothing to give focus back to; the thumbnail's button takes it.
        t.closest("button")?.focus({ preventScroll: true });
      },
      () => {
        t.style.viewTransitionName = "";
        busy.current = false;
      }
    );
  };

  return (
    <>
      <button
        aria-label={`Enlarge: ${alt}`}
        className="block w-full cursor-zoom-in"
        onClick={() => {
          void open();
        }}
        type="button"
      >
        <Image
          alt={alt}
          className="h-auto w-full object-contain"
          height={SCREENSHOT_SIZE.height}
          ref={thumb}
          sizes={SIZES}
          src={src}
          width={SCREENSHOT_SIZE.width}
        />
      </button>
      <dialog
        aria-label={alt}
        className="m-0 size-full max-h-none max-w-none bg-transparent backdrop:bg-surface-container-lowest/95"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        ref={dialog}
      >
        {/* The whole view is the close button, so a click anywhere or Enter closes it; the cross marks the corner. */}
        <button
          aria-label="Close screenshot"
          className="group flex size-full cursor-zoom-out items-center justify-center p-space-md outline-none md:p-space-xl"
          onClick={close}
          type="button"
        >
          <Image
            alt=""
            className="h-auto max-h-full w-auto max-w-full border border-surface-container-high object-contain"
            height={SCREENSHOT_SIZE.height}
            ref={full}
            sizes={SIZES}
            src={src}
            width={SCREENSHOT_SIZE.width}
          />
          <span className="fixed top-space-md right-space-md flex size-10 items-center justify-center border border-surface-container-high bg-surface text-on-surface group-hover:text-primary-container group-focus-visible:outline-2 group-focus-visible:outline-ring">
            <XIcon aria-hidden className="size-5" />
          </span>
        </button>
      </dialog>
    </>
  );
}
