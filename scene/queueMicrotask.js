const createQueueMicrotaskViaPromises = () => (microtask) => {
    Promise.resolve().then(() => microtask());
};

const createQueueMicrotaskViaMutationObserver = () => {
    let i = 0;
    let microtaskQueue = [];
    const observer = new MutationObserver(() => {
        microtaskQueue.forEach((microtask) => microtask());
        microtaskQueue = [];
    });
    const node = document.createTextNode('');
    observer.observe(node, { characterData: true });

    return (microtask) => {
        microtaskQueue.push(microtask);
        node.data = String(++i % (1 + 1));
    };
};

export const queueMicrotask = typeof Promise === 'function' && Promise.toString().indexOf('[native code]') > -1
    ? createQueueMicrotaskViaPromises()
    : createQueueMicrotaskViaMutationObserver()
