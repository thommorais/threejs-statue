async function theater(camera) {
	const [{ Vector3 }, { getProject, types }, { default: state }, { default: Scrollbar, ScrollbarPlugin }] =
		await Promise.all([import('three'), import('@theatre/core'), import('./state.json'), import('smooth-scrollbar')])

	let scrollState = {
		current: 0,
		locked: false,
		direction: 'normal',
		timeout: null,
		subscribers: [],
	}

	let config = {
		threshold: { desktop: 14, mobile: 30 },
		afterEventTimeout: 200,
	}

	const project = getProject('Camera', { state })
	const sheet = project.sheet('Scene')

	const cameraObj = sheet.object('Camera', {
		position: types.compound({
			...camera.camera.position,
		}),
		lookAt: types.compound({
			x: 0,
			y: 0,
			z: 0,
		}),
	})

	cameraObj.onValuesChange((values) => {
		camera.camera.position.set(values.position.x, values.position.y, values.position.z)
		const { x, y, z } = values.lookAt
		camera.camera.lookAt(new Vector3(x, y, z))
		camera.camera.updateProjectionMatrix()
	})

	const scroller = document.querySelector('.container-3d')

	class LockPlugin extends ScrollbarPlugin {
		static pluginName = 'lock'
		transformDelta(delta, { deltaY }) {
			if (this.options.isLock || Math.abs(deltaY) < config.threshold.desktop) {
				return { x: 0, y: 0 }
			}

			return delta
		}
	}

	Scrollbar.use(LockPlugin)

	const bodyScrollBar = Scrollbar.init(scroller, {
		damping: 1,
		continuousScrolling: false,
		delegateTo: document.body,
		plugins: {
			lock: {
				isLock: false,
			},
		},
	})

	function lockScroll(isLock = false) {
		bodyScrollBar.updatePluginOptions('lock', {
			isLock,
		})

		updateState({ locked: isLock })
	}

	function updateState(update) {
		scrollState = {
			...scrollState,
			...update,
		}
	}

	function getState() {
		return { ...scrollState }
	}

	function updateConfig(update) {
		config = {
			...config,
			...update,
			threshold: config.threshold,
		}
	}

	function updateProgress(status) {
		updateState({ progress: status.offset.y / status.limit.y })
	}

	function updateScrollStatus(status) {
		updateState({ scrollStatus: status })
	}

	function updateSubscribers(event) {
		const { timeout, subscribers, ...currentState } = getState()
		subscribers.forEach((subscriber) => subscriber({ ...currentState, event }))
	}

	function updateCssProperties() {
		const { currentSection } = getState()
		clearCssProperties()
		currentSection.style.setProperty('--opacity', 1)
	}

	function clearCssProperties() {
		const { sections } = getState()
		sections.forEach((e) => e.style.setProperty('--opacity', 0))
	}

	function onResize() {
		const { sections } = getState()

		const scenes = sections.map((t, e) => {
			return 0 === e ? 0 : t.getBoundingClientRect().top + t.getBoundingClientRect().height / 2 - window.innerHeight / 2
		})

		updateState({ scenes })
	}

	function onBodyScroll(event) {
		const scrollState = getState()
		const direction = scrollState.direction
		const normal = direction === 'normal'
		const from = normal ? scrollState.current - 1 : scrollState.current
		const to = normal ? scrollState.current : scrollState.current + 1

		sheet.sequence
			.play({
				range: [from, to],
				direction,
			})
			.then(() => {
				updateSubscribers(event)
				updateCssProperties()
			})
	}

	function setDirection(deltaY) {
		if (deltaY > config.threshold.desktop) {
			updateState({ direction: 'normal' })
		} else if (deltaY < -config.threshold.desktop) {
			updateState({ direction: 'reverse' })
		}
	}

	let onScrollTimeout = null

	function handleWheel(event) {
		const { deltaY } = event
		setDirection(deltaY)

		const scrollState = getState()
		const direction = scrollState.direction
		const normal = direction === 'normal'

		const scenesLength = scrollState.scenes.length - 1

		if (
			(scrollState.current === scenesLength && normal) ||
			(scrollState.current === 0 && !normal) ||
			scrollState.locked
		) {
			return
		}

		if (Math.abs(deltaY) > config.threshold.desktop) {
			lockScroll(true)
			clearCssProperties()
			clearTimeout(onScrollTimeout)
			onScrollTimeout = setTimeout(() => {
				clearTimeout(scrollState.timeout)
				const direction = scrollState.direction === 'normal' ? +1 : -1
				const next = Math.max(Math.min(scrollState.current + direction, scenesLength), 0)

				bodyScrollBar.scrollTo(0, scrollState.scenes[next], 600, {
					callback() {
						const timeout = setTimeout(lockScroll, 500)
						updateState({
							currentSection: scrollState.sections[next],
							current: next,
							timeout,
						})
						onBodyScroll(event)
					},
				})
			}, config.afterEventTimeout)
		}
	}

	function init(options) {
		const sections = [...(document.querySelectorAll(options.selector) || [])]

		scroller.addEventListener('wheel', handleWheel, { passive: false })
		document.addEventListener('resize', onResize, { passive: false })

		bodyScrollBar.addListener(updateProgress)
		bodyScrollBar.addListener(updateScrollStatus)

		updateState({ sections, currentSection: sections[0] })
		updateConfig(options)
		onResize()
		updateCssProperties()

		return getState()
	}

	return {
		init,
		lock() {
			lockScroll(true)
			return getState()
		},
		unlock() {
			lockScroll(false)
			return getState()
		},
		subscribe(subscriber) {
			scrollState.subscribers.push(subscriber)
			return getState()
		},
		unsubscribe(subscriber) {
			const index = scrollState.subscribers.indexOf(subscriber)
			if (index > -1) {
				scrollState.subscribers.splice(index, 1)
			}

			return getState()
		},
		getState,
	}
}

export default theater
