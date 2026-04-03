/**
 * Attaches WebGL context-loss handlers to a renderer's canvas.
 *
 * Calling `e.preventDefault()` on the loss event tells the browser to attempt
 * context restoration rather than treating it as permanent. R3F v9 handles the
 * actual re-initialisation once the context is restored, so no manual reload
 * is needed — and attempting one would create an infinite loop during normal
 * navigation when R3F tears down the renderer on unmount.
 */
export function attachContextHandlers(canvas: HTMLCanvasElement) {
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
  });
}
