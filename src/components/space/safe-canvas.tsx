/**
 * SafeCanvas — a thin wrapper around R3F <Canvas> that:
 *
 * 1. Delays rendering by one frame so the previous Canvas (from the outgoing
 *    route) has time to unmount and release its WebGL context before we
 *    request a new one.  Without this, TanStack Router's synchronous mount of
 *    the incoming route can briefly keep two live WebGL contexts open, which
 *    exceeds browser limits and causes "Context Lost".
 *
 * 2. Distinguishes real context loss (GPU crash / driver issue while the
 *    component is still mounted) from the normal teardown loss that R3F fires
 *    when the renderer is disposed during unmount.  On real loss it remounts
 *    the Canvas via a key change.  On teardown loss it does nothing.
 *
 * 3. Exits pointer lock before remounting so drei's PointerLockControls
 *    never tries to call requestPointerLock() on a canvas element that has
 *    already been removed from the DOM (WrongDocumentError).
 */

import { useEffect, useRef, useState } from 'react';
import { Canvas, type CanvasProps } from '@react-three/fiber';

export function SafeCanvas({ onCreated, children, ...rest }: CanvasProps) {
  // Start hidden; show after one animation frame so the previous Canvas can
  // fully unmount and release its WebGL context first.
  const [ready, setReady] = useState(false);

  // Increment this key to force a fresh Canvas mount after real context loss.
  const [canvasKey, setCanvasKey] = useState(0);

  // Track whether this component is still mounted so we can tell the
  // difference between a "navigation teardown" context loss and a "real" one.
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const raf = requestAnimationFrame(() => setReady(true));
    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!ready) return null;

  return (
    <Canvas
      key={canvasKey}
      {...rest}
      onCreated={(state) => {
        const canvas = state.gl.domElement;

        canvas.addEventListener('webglcontextlost', (e) => {
          // Always prevent default so the browser can attempt restoration.
          e.preventDefault();

          // If the component is still mounted this is a real GPU context
          // loss — remount the Canvas after a short back-off.
          if (mountedRef.current) {
            setTimeout(() => {
              if (!mountedRef.current) return;

              // Exit pointer lock BEFORE the canvas element is removed from
              // the DOM.  drei's PointerLockControls attaches a `click`
              // listener to `document` that calls domElement.requestPointerLock().
              // If the element is already gone when that fires the browser
              // throws a WrongDocumentError.  exitPointerLock() here gives
              // the controls a chance to clean up before we swap the canvas.
              if (document.pointerLockElement) {
                document.exitPointerLock();
              }

              setCanvasKey((k) => k + 1);
            }, 1500);
          }
          // If unmounted, R3F is tearing down the renderer during navigation —
          // do nothing; the incoming route will create its own fresh context.
        });

        // Forward the original onCreated callback if supplied.
        onCreated?.(state);
      }}
    >
      {children}
    </Canvas>
  );
}
