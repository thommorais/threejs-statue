import create from 'zustand/vanilla'

const isObject = (object) => {
	return object !== null && typeof object === 'object'
}

const isString = (string) => {
	return string !== null && typeof string === 'string'
}

const isDeepEqual = (object1, object2) => {
	const objKeys1 = Object.keys(object1)
	const objKeys2 = Object.keys(object2)

	if (objKeys1.length !== objKeys2.length) return false

	for (const key of objKeys1) {
		const value1 = object1[key]
		const value2 = object2[key]

		const isObjects = isObject(value1) && isObject(value2)

		if ((isObjects && !isDeepEqual(value1, value2)) || (!isObjects && value1 !== value2)) {
			return false
		}
	}
	return true
}

export const modelStore = create(() => ({
	character: '',
	modelLoadingProgress: 0,
	current: 0,
	locked: false,
	direction: 'normal',
	timeout: null,
}))

export function subscribe(callback, selector) {
	return modelStore.subscribe((state, prevState) => {
		if (isString(selector)) {
			if (!isObject(prevState[selector]) && !isObject(state[selector])) {
				if (prevState[selector] !== state[selector]) {
					callback(state[selector])
				}
			} else {
				if (!isDeepEqual(prevState[selector], state[selector])) {
					callback(state[selector])
				}
			}
		} else {
			callback(state)
		}
	})
}

function lockScroll(isLock = false) {
	modelStore.setState({ locked: isLock })
}

export default {
	...modelStore,
	subscribe,
	lockScroll,
}
