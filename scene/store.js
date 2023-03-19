import { createStore } from "zustand/vanilla";

function isString(string) {
	return string !== null && typeof string === "string";
}

function isObject(object) {
	return object !== null && typeof object === "object";
}

const memoizedResults = new Map();

function isDeepEqual(object1, object2) {
	const key = JSON.stringify([object1, object2]);

	if (memoizedResults.has(key)) {
		return memoizedResults.get(key);
	}

	const objKeys1 = Object.keys(object1);
	const objKeys2 = Object.keys(object2);

	if (objKeys1.length !== objKeys2.length) {
		memoizedResults.set(key, false);
		return false;
	}

	for (const key of objKeys1) {
		const value1 = object1[key];
		const value2 = object2[key];

		const isObjects = isObject(value1) && isObject(value2);

		if (
			(isObjects && !isDeepEqual(value1, value2)) ||
			(!isObjects && value1 !== value2)
		) {
			memoizedResults.set(key, false);
			return false;
		}
	}

	memoizedResults.set(key, true);
	return true;
}

function shallowEqual(objA, objB) {
	if (objA === objB) return true;

	const keysA = Object.keys(objA);
	const keysB = Object.keys(objB);

	if (keysA.length !== keysB.length) return false;

	for (let i = 0; i < keysA.length; i++) {
		if (!objB.hasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
			return false;
		}
	}

	return true;
}

class Store {
	constructor(initialState) {
		this.storeKeys = new Map(
			Object.keys(initialState).map((key) => [key, key])
		);

		this.store = createStore(() => ({
			...initialState,
		}));
	}

	setState(state) {

		if (!state) return;

		if (isObject(state)) {
			for (const key of Object.keys(state)) {
				if (this.storeKeys.has(key)) {
					this.store.setState(state);
				} else {
					console.log(`key ${key} is not valid`);
				}
			}
		}
	}

	getState() {
		return this.store.getState();
	}

	subscribe(callback, selector) {
		return this.store.subscribe((state, prevState) => {
			const isSingleSelector = isString(selector);
			const isArraySelector = Array.isArray(selector);

			if (isSingleSelector || isArraySelector) {
				let shouldCallCallback = false;
				const selectedState = {};

				const checkAndUpdateSelectedState = (key) => {
					const prevValue = prevState[key];
					const currentValue = state[key];

					if (
						(!isObject(prevValue) &&
							!isObject(currentValue) &&
							prevValue !== currentValue) ||
						(isObject(prevValue) &&
							isObject(currentValue) &&
							!isDeepEqual(prevValue, currentValue))
					) {
						shouldCallCallback = true;
					}
					selectedState[key] = currentValue;
				};

				if (isSingleSelector) {
					checkAndUpdateSelectedState(selector);
				} else {
					for (const key of selector) {
						checkAndUpdateSelectedState(key);
					}
				}

				if (shouldCallCallback) {
					callback(selectedState);
				}
			} else {
				callback(state);
			}
		}, shallowEqual);
	}

	lockScroll(isLock = false, mouseWheel) {
		this.setState({ locked: isLock });
		if (mouseWheel) {
			this.setState({ mouseWheel });
		}
	}

	scrollTo(scroll, duration = 200) {
		this.setState({ syntaticScroll: { scroll, duration } });
	}
}

export default Store;
