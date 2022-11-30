async function theater(camera, cameraState, options) {
	const [{ Vector3 }, { getProject, types }, { default: Scrollbar, ScrollbarPlugin }] = await Promise.all([
		import('three'),
		import('@theatre/core'),
		import('smooth-scrollbar'),
	])

	const { default: store } = await import('../store')

	let config = {
		threshold: { desktop: 14, mobile: 30 },
		afterEventTimeout: 200,
	}

	const sections = [...(document.querySelectorAll(options.selector) || [])]
	let currentSection = sections[0]

	const project = getProject('Camera', { state: cameraState })
	const sheet = project.sheet('Scene')

	const cameraObj = sheet.object('Camera', {
		position: types.compound({
			...camera.position,
		}),
		lookAt: types.compound({
			x: 0,
			y: 0,
			z: 0,
		}),
	})

	cameraObj.onValuesChange((values) => {
		camera.position.set(values.position.x, values.position.y, values.position.z)
		const { x, y, z } = values.lookAt
		camera.lookAt(new Vector3(x, y, z))
		camera.updateProjectionMatrix()
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
		store.setState({ locked: isLock })
	}

	function updateConfig(update) {
		config = {
			...config,
			...update,
			threshold: config.threshold,
		}
	}

	function updateProgress(status) {
		store.setState({ progress: status.offset.y / status.limit.y })
	}

	function updateScrollStatus(status) {
		store.setState({ scrollStatus: status })
	}

	function updateCssProperties() {
		clearCssProperties()
		currentSection.style.setProperty('--opacity', 1)
	}

	function clearCssProperties() {
		sections.forEach((e) => e.style.setProperty('--opacity', 0))
	}

	function onResize() {
		const scenes = sections.map((t, e) => {
			return 0 === e ? 0 : t.getBoundingClientRect().top + t.getBoundingClientRect().height / 2 - window.innerHeight / 2
		})

		store.setState({ scenes })
	}

	function onBodyScroll(event) {
		const scrollState = store.getState()
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
				store.setState({ scrollEvent: event })
				updateCssProperties()
			})
	}

	function setDirection(deltaY) {
		if (deltaY > config.threshold.desktop) {
			store.setState({ direction: 'normal' })
		} else if (deltaY < -config.threshold.desktop) {
			store.setState({ direction: 'reverse' })
		}
	}

	let onScrollTimeout = null

	function handleWheel(event) {
		const { deltaY } = event
		setDirection(deltaY)

		const scrollState = store.getState()
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
						currentSection = sections[next]
						store.setState({
							current: next,
							timeout,
						})
						onBodyScroll(event)
					},
				})
			}, config.afterEventTimeout)
		}
	}

	scroller.addEventListener('wheel', handleWheel, { passive: false })
	document.addEventListener('resize', onResize, { passive: false })

	bodyScrollBar.addListener(updateProgress)
	bodyScrollBar.addListener(updateScrollStatus)

	updateConfig(options)
	onResize()
	updateCssProperties()

	store.subscribe((isLock) => bodyScrollBar.updatePluginOptions('lock', { isLock }), 'locked')

	return {
		lockScroll() {
			lockScroll(true)
		},
		unlockScroll() {
			lockScroll(false)
		},
	}
}

export default theater
