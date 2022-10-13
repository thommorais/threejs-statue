export function getDefaultSizes() {
    const width = window.innerWidth
    const height = window.innerHeight

    return {
        width,
        height,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        aspect: width / height,
    }
}