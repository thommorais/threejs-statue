/**
 * Polyfill for setImmediate
 * https://developer.mozilla.org/pt-BR/docs/Web/API/Window/setImmediate
 */
import './setImmediate'
/** */

const listeners = new WeakMap()
const sender = Symbol()
const isHermes = Symbol()
const timer = Symbol()
const isArray = Symbol()
const updates = Symbol()

const METHODS_TO_REMAP = ['sort', 'reverse']

/**
 * Public api
 * @type {Object}
 */
const API = {
	/**
	 * Set a listener on any object function or array
	 * @param   {Function} fn - callback function associated to the property to listen
	 * @returns {API}
	 */
	listen(fn) {
		if (!listeners.has(this)) listeners.set(this, [])
		listeners.get(this).push(fn)

		return this
	},

	/**
	 * Unsubscribe to a property previously listened or to all of them
	 * @param   {Function} fn - function to unsubscribe
	 * @returns {API}
	 */
	unlisten(fn) {
		const callbacks = listeners.get(this)
		if (!callbacks) {
			return
		}

		if (fn) {
			const index = callbacks.indexOf(fn)
			if (~index) {
				callbacks.splice(index, 1)
			}
		} else {
			listeners.set(this, [])
		}

		return this
	},
}

/**
 * proxy handler
 * @type {Object}
 */
const HERMES_HANDLER = {
	set(target, property, value) {
		// filter the values that didn't change
		if (target[property] !== value) {
			if (value === Object(value) && !value[isHermes]) {
				target[property] = hermes(value)
			} else {
				target[property] = value
			}
			target[sender](property, value)
		}

		return true
	},
}

/**
 * Define a private property
 * @param   {*} obj - receiver
 * @param   {String} key - property name
 * @param   {*} value - value to set
 */
function define(obj, key, value) {
	Object.defineProperty(obj, key, {
		value: value,
		enumerable: false,
		configurable: false,
		writable: false,
	})
}

/**
 * Handle also array updates
 * @param   {array}    options.obj    - array to modify
 * @param   {string}   options.method - method name we want to use to modify the array
 * @param   {function} options.originalMethod - original array method
 * @param   {array} args - arguments to proxy to the original array method
 * @returns {*} whatever the array method natively returns
 */
function handleArrayMethod({ obj, method, originalMethod }, ...args) {
	const ret = originalMethod.apply(obj, args)
	obj[sender](method, obj)
	return ret
}

/**
 * Enhance objects adding some hidden props to them and the API methods
 * @param   {*} obj - anything
 * @returns {*} the object received enhanced with some extra properties
 */
function enhance(obj) {
	// add some "kinda hidden" properties
	Object.assign(obj, {
		[updates]: new Map(),
		[timer]: null,
		[isHermes]: true,
		[sender](property, value) {
			if (listeners.has(obj)) {
				clearImmediate(obj[timer])
				obj[updates].set(property, value)
				obj[timer] = setImmediate(function () {
					listeners.get(obj).forEach(function (fn) {
						fn(obj[updates])
					})
					obj[updates].clear()
				})
			}
		},
	})

	// Add the API methods bound to the original object
	Object.keys(API).forEach(function (key) {
		define(obj, key, API[key].bind(obj))
	})

	// remap values and methods
	if (Array.isArray(obj)) {
		obj[isArray] = true
		// remap the inital array values
		obj.forEach(function (item, i) {
			obj[i] = null
			HERMES_HANDLER.set(obj, i, item)
		})

		METHODS_TO_REMAP.forEach(function (method) {
			define(
				obj,
				method,
				handleArrayMethod.bind(null, {
					obj,
					method,
					originalMethod: obj[method],
				}),
			)
		})
	}

	return obj
}

/**
 * Factory function
 * @param   {*} obj
 * @returns {Proxy}
 */
export default function hermes(obj) {
	return new Proxy(enhance(obj), Object.create(HERMES_HANDLER))
}
