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
	constructor() {

		const initialState = {
			modelLoadingProgress: 0,
			current: 0,
			from: 0,
			to: 0,
			duration: 500,
			viewportHeight: window.innerHeight,
			syntaticScroll: {
				from:0,
				to: 1,
				duration: 500,
				direction: "normal",
				enabled: false,
			},
			thresholdScroll: { desktop: 10, mobile: 60 },
			currentScrollThreshold: 0,
			afterEventTimeout: 200,
			locked: false,
			direction: "normal",
			timeout: null,
			cameraState: {},
			scrollProgress: 0,
			sections: [],
			currentSection: null,
			scenesRect: [],
			scrollerSection: null,
			characterClass: null,

			classColors: {
				demon: [0xc9bbff, 0xff3d0c, 0xff0633, 0xc9bbff],
				mage: [0xbd50ff, 0xff6b47, 0xff03a5, 0xbd50ff],
				barbarian: [0xbf744a, 0xff7a50, 0xff7760, 0xbf744a]
			},

			backgroundColors: {
				mage: 0x7c00ff,
				demon: 0xff0000,
				barbarian: 0xFF401A,
			},

			characterClassUniform: {
				demon: 0.0,
				barbarian: 1.0,
				mage: 2.0,
			},

			scrollStatus: {
				"offset": {
					"x": 0,
					"y": 0
				},
				"limit": {
					"x": 0,
					"y": 0
				}
			}
		}

		this.storeKeys = new Map(
			Object.keys(initialState).map((key) => [key, key])
		);

		this.store = createStore(() => ({
			...initialState,
		}));
	}

	setState(state) {

		if (isObject(state)) {
			let newState = { ...this.getState() }

			for (const key of Object.keys(state)) {
				if (this.storeKeys.has(key)) {
					newState = { ...newState, [key]: state[key]}
					if (key === 'to' || key === 'from') {
						newState = {
							...newState,
							to: Math.min(Math.max(newState.scenesRect.length - 1, 0), newState.to),
							from: Math.max(0, newState.from)
						}
					}

					if (key === 'direction') {

						const directions = ['normal', 'reverse']

						if (directions.includes(state)) {
							newState = {
								...newState,
								direction: state
							}
						}

					}

				} else {
					console.log(`key ${key} is not valid`);
				}
			}

			this.store.setState(newState);

		} else {
			console.log("state must be an object");
		}
	}

	getState() {
		const state = this.store.getState();
		return {...state}
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

	lockScroll(mouseWheel) {
		this.setState({ locked: true });
		if (mouseWheel) {
			this.setState({ mouseWheel });
		}
	}

	unLockScroll() {
		this.setState({ locked: false });
	}

	scrollTo({ to, from, duration = 200 }) {

		const f = from || this.getState().current;

		let direction = "normal";
		if (to < from) {
			direction = "reverse";
		}

		if(to === from) return;

		this.setState({
			syntaticScroll: {
				from: f,
				to,
				duration,
				direction,
				enabled: true,
		} });

	}
}

export default Store;
