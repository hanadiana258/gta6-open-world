/* Helpers for spatial queries. */
export const WORLD_SIZE = 5200;

export function isIntersection(x, y, blockSize) {
    return (x % blockSize === 0) && (y % blockSize === 0);
}

export function nearestRoadPoint(x, y, blockSize) {
    return {
        x: Math.round(x / blockSize) * blockSize,
        y: Math.round(y / blockSize) * blockSize
    };
}
