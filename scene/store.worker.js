import { createStore } from "zustand/vanilla";

import { NORMAL, REVERSE, clamp } from "./utils";

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

export function isNumber(number) {
	return number !== null && typeof number === "number";
}


const directions = [NORMAL, REVERSE]


const sectionState = {
	sectionTransitionComplete: false,
	sectionCurrent: 0,
	sections: [],
	sectionsCount: 0,
	sectionsRect: [],
	sectionScroll: {
		from: 0,
		to: 1,
		duration: 500,
		direction: NORMAL,
		enabled: false,
	},
}

const cameraState = {
	cameraTransitionProgress: 0,
	cameraTransitionDuration: 0.33,
	cameraTransitionComplete: false,
	cameraTransitionFailedToComplete: false,
	cameraPositions: null,
	cameraScenesCount: 0,
	cameraCurrentPose: 0,
	rate: 0.33,
	cameraPose: {
		from: 0,
		to: 1,
		rate: 0.3,
		direction: NORMAL,
		enabled: false,
		ignoreCameraCurrentState: false,
	},
	doCameraScroll: false,
}

const scrollState = {
	scrollMarginVP: 0,
	scrollerSection: null,
	duration: 700,
	locked: true,
	direction: NORMAL,
	scrollProgress: 0,
	scrollable: false,
	viewportHeight: 0 ,
	scrollingStarted: false,
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

const modelState = {
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
	modelError: false,
	modelAdded: false,
	modelLoadingProgress: 0,
	characterClass: null,
}

const initialState = {
	...sectionState,
	...cameraState,
	...scrollState,
	...modelState,
	sceneChange: {
		from: 0,
		to: 1,
		duration: 500,
		direction: NORMAL,
		enabled: false,
		ignoreCameraCurrentState: false,
	},
	bgTexturePath: '/smoke-o.webp',
	gpuData: {
		tier: 3,
		isMobile: false
	},
}

const storeKeys = new Map(
	Object.keys(initialState).map((key) => [key, key])
);

export const store = createStore(() => ({
	...initialState,
}));

export function getState() {
	return store.getState();
}

export function setState(state) {

	if (isObject(state)) {
		let newState = { ...store.getState() }

		for (const key of Object.keys(state)) {
			if (storeKeys.has(key)) {
				newState = { ...newState, [key]: state[key] }

				if (key === 'to' || key === 'from') {

					if (!isNumber(newState[key])) {
						throw new Error(`${key} must be a number, got ${newState[key]}`)
					}

					newState = {
						...newState,
						[key]: newState[key]
					}
				}

				if (key === 'direction') {

					if (directions.includes(newState[key])) {
						newState = {
							...newState,
							[key]: newState[key]
						}
					} else {
						console.log(`direction ${JSON.stringify(state[key])} is not valid`)
						console.log(`direction must be one of ${directions}`)
					}

				}

			} else {
				console.log(`key ${key} is not valid`);
			}
		}

		store.setState(newState);

	} else {
		console.log("state must be an object");
	}
}


export function subscribe(callback, selector) {
	store.subscribe((state, prevState) => {
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

export function lockScroll() {
	setState({ locked: true });
}

export function unLockScroll() {
	setState({ locked: false });
}

export function setScenePose({ to, from, duration = 200, camera = {}, keepScrollLocked = true,  ignoreCameraCurrentState = false }) {

	// check if to and f are valid numbers
	if (!isNumber(to)) {
		throw new Error(`to must be a number, got ${to}`)
	}

	if (!isNumber(from)) {
		throw new Error(`from must be a number, got ${from}`)
	}

	let direction = NORMAL
	if (to < from) {
		direction = REVERSE
	}

	if (to === from) return;

	const { sectionsRect } = getState();

	const clampedTo = clamp(to, [0, sectionsRect.length - 1]);
	const clampedFrom = clamp(from, [0, sectionsRect.length - 1]);

	setState({
		sceneChange: {
			from: clampedFrom,
			to: clampedTo,
			duration,
			direction,
			enabled: true,
			keepScrollLocked,
			ignoreCameraCurrentState,
			camera: {
				from: clampedFrom,
				to: clampedTo,
				rate: 0.33,
				...camera,
			}
		}
	});

}

export function  cameraPose({ to, from, rate = 0.33, keepScrollLocked = false, ignoreCameraCurrentState = false }) {
	if (!isNumber(to)) {
		throw new Error(`to must be a number, got ${to}`)
	}

	if (!isNumber(from)) {
		throw new Error(`from must be a number, got ${from}`)
	}

	let direction = NORMAL

	if (to < from) {
		direction = REVERSE
	}

	if (to === from) return;


	setState({
		cameraPose: {
			from: from || 0,
			to,
			rate,
			direction,
			enabled: true,
			keepScrollLocked,
			ignoreCameraCurrentState
		}
	});

}

export function sectionScroll({ to, from, duration = 200, keepScrollLocked = true }) {

	// check if to and f are valid numbers
	if (!isNumber(to)) {
		throw new Error(`to must be a number, got ${to}`)
	}

	if (!isNumber(from)) {
		throw new Error(`from must be a number, got ${from}`)
	}

	let direction = NORMAL
	if (to < from) {
		direction = REVERSE
	}

	if (to === from) return;

	const { sectionsRect } = getState();

	setState({
		sectionScroll: {
			from: clamp(from, [0, sectionsRect.length - 1]),
			to: clamp(to, [0, sectionsRect.length - 1]),
			duration,
			direction,
			enabled: true,
			keepScrollLocked
		}
	});

}




