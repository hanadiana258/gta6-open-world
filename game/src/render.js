// authored r10 — written by this agent session
/* Utilities for camera and world bounds. */
export function worldToScreen(x, y, cam) {
    return { x: x - cam.x, y: y - cam.y };
}

export function clampCamera(cam, worldBounds) {
    cam.x = Math.max(0, Math.min(cam.x, worldBounds));
    cam.y = Math.max(0, Math.min(cam.y, worldBounds));
}
