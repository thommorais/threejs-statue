export function getDefaultSizes() {
    const width = window.innerWidth
    const height = window.innerHeight

    return {
        width,
        height,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
    }
}

export function randomIntFromInterval(min, max, avoid = []) {
    if (!Array.isArray(avoid)) {
        avoid = [avoid]
    }
    let number = Math.floor(Math.random() * (max - min + 1)) + min
    if (avoid.includes(number)) {
        return randomIntFromInterval(min, max, avoid)
    }
    return number
}

export function throttle(func, delay) {
    let lastCall = 0;

    return function (...args) {
        const now = Date.now();

        if (now - lastCall >= delay) {
            lastCall = now;
            return func.apply(this, args);
        }
    };
}
