/* eslint-disable id-length */
export function getDefaultSizes() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    return {
        width,
        height,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
    };
}

export const REVERSE = 'reverse';
export const NORMAL = 'normal';

export const isNumberInRange = (number, [lowerBound, upperBound]) => {
    const normalized = (number - lowerBound) / (upperBound - lowerBound);
    return normalized >= 0 && normalized <= 1;
};

export const max = (a, b) => Math.max(a, b);

export const min = (a, b) => Math.min(a, b);

export const clamp = (number, [lowerBound, upperBound]) => min(max(number, lowerBound), upperBound);

export const getDistance = (a, b) => Math.abs(a - b);

// eslint-disable-next-line no-shadow
export function randomIntFromInterval(min, max, avoid = []) {
    if (!Array.isArray(avoid)) {
        // eslint-disable-next-line no-param-reassign
        avoid = [avoid];
    }
    const number = Math.floor(Math.random() * (max - min + 1)) + min;
    if (avoid.includes(number)) {
        return randomIntFromInterval(min, max, avoid);
    }
    return number;
}

export function throttle(func, delay) {
    let lastCall = 0;

    // eslint-disable-next-line func-names, consistent-return
    return function (...args) {
        const now = Date.now();

        if (now - lastCall >= delay) {
            lastCall = now;
            return func.apply(this, args);
        }
    };
}

export function debounce(func, wait) {
    let timeoutId = null;

    // eslint-disable-next-line func-names
    return function (...args) {
        const context = this;
        const later = () => {
            timeoutId = null;
            func.apply(context, args);
        };

        clearTimeout(timeoutId);
        timeoutId = setTimeout(later, wait);
    };
}

export function checkDirection(deltaY) {
    const direction = deltaY >= 0 ? NORMAL : REVERSE;
    const goingDown = direction === NORMAL;
    return { direction, goingDown };
}

export const now = () => +new Date();

class IdleDeadline {
    constructor(initTime) {
        this.initTime_ = initTime;
    }
    get didTimeout() {
        return false;
    }
    timeRemaining() {
        return Math.max(0, 50 - (now() - this.initTime_));
    }
}

const requestIdleCallbackShim = (callback) => {
    const deadline = new IdleDeadline(now());
    return setTimeout(() => callback(deadline), 0);
};

const cancelIdleCallbackShim = (handle) => {
    clearTimeout(handle);
};

const supportsRequestIdleCallback_ = typeof requestIdleCallback === 'function';

export const rIC = supportsRequestIdleCallback_ ?
    requestIdleCallback : requestIdleCallbackShim;

export const cIC = supportsRequestIdleCallback_ ?
    cancelIdleCallback : cancelIdleCallbackShim;
