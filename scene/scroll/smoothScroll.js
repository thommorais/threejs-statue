import Scrollbar, { ScrollbarPlugin } from 'smooth-scrollbar'

let config = {
	threshold: { desktop: 14, mobile: 30 },
	afterEventTimeout: 200,
}

class LockPlugin extends ScrollbarPlugin {
	static pluginName = 'lock'
	transformDelta(delta, { deltaY }) {
		if (this.options.isLock || Math.abs(deltaY) < config.threshold.desktop) {
			return { x: 0, y: 0 }
		}
		return delta
	}
}

async function smoothScroll(scrollerContainer, config) {
	const { default: store } = await import('../store')

	const scroller = document.querySelector(scrollerContainer)

	if (!scroller) {
		throw new Error(`we need a container to scroll ${scrollerContainer}`)
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

	bodyScrollBar.addListener((status) =>
		store.setState({ scrollProgress: status.offset.y / status.limit.y, scrollStatus: status }),
	)

	store.subscribe((isLock) => bodyScrollBar.updatePluginOptions('lock', { isLock }), 'locked')

	let onScrollTimeout = null

	function handleWheel(event) {
		const { deltaY } = event

		if (deltaY > config.threshold.desktop) {
			store.setState({ direction: 'normal' })
		} else if (deltaY < -config.threshold.desktop) {
			store.setState({ direction: 'reverse' })
		}

		const scrollState = store.getState()
		const direction = scrollState.direction
		const sections = scrollState.sections
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
			store.lockScroll(true)
			clearTimeout(onScrollTimeout)
			onScrollTimeout = setTimeout(() => {
				clearTimeout(scrollState.timeout)
				const direction = scrollState.direction === 'normal' ? +1 : -1
				const next = Math.max(Math.min(scrollState.current + direction, scenesLength), 0)

				bodyScrollBar.scrollTo(0, scrollState.scenes[next], 600, {
					callback() {
						const timeout = setTimeout(store.lockScroll, 500)
						store.setState({
							current: next,
							timeout,
							currentSection: sections[next],
						})
					},
				})
			}, config.afterEventTimeout)
		}
	}

	scroller.addEventListener('wheel', handleWheel, { passive: false })

	return { bodyScrollBar, scroller }
}

export default smoothScroll
