import { getProject, types } from '@theatre/core'
import { Vector3 } from 'three'
import Scrollbar, { ScrollbarPlugin } from 'smooth-scrollbar'
import { throttle } from './utils'

const REVERSE = 'reverse'
const NORMAL = 'normal'

const isNumberInRange = (number, [lowerBound, upperBound]) => {
	const normalized = (number - lowerBound) / (upperBound - lowerBound)
	return normalized >= 0 && normalized <= 1
}

const max = (a, b) => {
	return Math.max(a, b)
}

const min = (a, b) => {
	return Math.min(a, b)
}

const clamp = (number, [lowerBound, upperBound]) => {
	return min(max(number, lowerBound), upperBound)
}

class CameraOnScroll {
	constructor(camera, store) {
		this.camera = camera
		this.store = store

		const { cameraState } = this.store.getState()

		this.project = getProject('lights', { state: cameraState })

		this.sheet = this.project.sheet('lights')

		this.cameraObj = this.sheet.object('Camera', {
			position: types.compound({ ...this.camera.position }),
			lookAt: types.compound({ x: 0, y: 0, z: 0 }),
		})

		this.cameraObj.onValuesChange((values) => {
			this.camera.position.set(values.position.x, values.position.y, values.position.z)
			const { x, y, z } = values.lookAt
			this.camera.lookAt(new Vector3(x, y, z))
			this.camera.updateProjectionMatrix()
		})

		this.store.subscribe(this.onBodyScroll.bind(this), 'current')
	}

	onBodyScroll() {
		const { direction, current } = this.store.getState()
		const normal = direction === NORMAL
		const from = normal ? current - 1 : current
		const to = normal ? current : current + 1
		this.sheet.sequence.play({ range: [from, to], direction })
	}
}

class LockPlugin extends ScrollbarPlugin {
	static pluginName = 'lock'
	transformDelta(delta, { deltaY }) {
		const { currentScrollThreshold } = this.store.getState()
		if (this.options.isLock || Math.abs(deltaY) < currentScrollThreshold) {
			return { x: 0, y: 0 }
		}
		return delta
	}
}

const deltaEl = document.querySelector('.delta')

class SmoothScroller {
	constructor(scrollerContainer, store) {
		this.scroller = document.querySelector(scrollerContainer)

		if (!this.scroller) {
			throw new Error(`we need a container to scroll ${scrollerContainer}`)
		}

		this.store = store

		const [currentSection] = this.store.getState().sections

		this.store.setState({
			current: 0,
			currentSection,
			scrollerSection: this.scroller,
			viewportHeight: this.scroller.offsetHeight,
		})

		this.bodyScrollBar = Scrollbar.init(this.scroller, {
			damping: 0.001,
			continuousScrolling: false,
			renderByPixels: false,
			delegateTo: document.body,
			plugins: {
				lock: {
					isLock: false,
				},
			},
		})

		Scrollbar.use(LockPlugin)

		this.bodyScrollBar.addListener((status) => {
			this.store.setState({
				scrollProgress: status.offset.y / status.limit.y,
				scrollStatus: status,
			})
		})

		this.store.subscribe((isLock) => this.bodyScrollBar.updatePluginOptions('lock', { isLock }), 'locked')

		this.store.subscribe((syntaticScroll) => this.handleWheel(syntaticScroll), 'syntaticScroll')

		this.onScrollTimeout = null
		this.handleMouseWheel = this.handleMouseWheel.bind(this)
		this.handleTouchStart = this.handleTouchStart.bind(this)
		this.handleTouchMove = this.handleTouchMove.bind(this)
		this.handleWheel = this.handleWheel.bind(this)

		this.scroller.addEventListener('wheel', this.handleMouseWheel, { passive: false })
		this.scroller.addEventListener('touchstart', this.handleTouchStart, { passive: false })
		this.scroller.addEventListener('touchmove', this.handleTouchMove, { passive: false })

		this.throttledUpdateMouseWhell = throttle(({ scroll, direction }) => {
			this.handleWheel({ scroll, direction })
		}, 0)
	}

	hasReachedScrollBoundary(threshold) {
		const { scenesRect, scrollStatus, scrollerSection, locked, mouseWheel } = this.store.getState()

		const scrollTop = scrollStatus.offset.y
		const scrollBottom = scrollTop + scrollerSection.offsetHeight

		const currentIndex = scenesRect.findIndex((scene) => isNumberInRange(scrollTop, [scene.top, scene.bottom]))

		const { bottom } = scenesRect[currentIndex]
		const { top } = scenesRect[min(currentIndex + 1, scenesRect.length - 1)]

		const goingDown = threshold > 0

		deltaEl.innerHTML = `
		     scrollBottom: ${scrollBottom} <br>
			 scrollTop: ${scrollTop} <br>
			 bottom: ${bottom} <br>
			 top: ${top} <br>
			 threshold: ${threshold} <br>
			 currentIndex: ${currentIndex} <br>
			 direction: ${goingDown ? 'down' : 'up'} <br>
			 wheel: ${mouseWheel}
		`

		const scrollDown = goingDown && !locked && scrollBottom >= bottom + threshold
		const scrollUp = !goingDown && !locked && scrollTop <= top + threshold

		return scrollDown || scrollUp
	}

	scrollTo({ positionY, current }) {
		const { duration } = this.store.getState()

		this.bodyScrollBar.scrollTo(0, positionY, max(duration, 100), {
			callback: () => {
				const timeout = setTimeout(() => this.store.lockScroll(), max(duration - 100, 100))
				const { sections } = this.store.getState()
				this.store.setState({ current, currentSection: sections[current], timeout })
			},
		})
	}

	handleWheel({ scroll, direction }) {
		const { scenesRect, current, locked, timeout, afterEventTimeout, viewportHeight } = this.store.getState()
		const normal = direction === NORMAL
		const scenes = scenesRect.length - 1

		const avoidScroll = (current === scenes && normal) || (current === 0 && !normal) || locked

		if (avoidScroll) {
			return
		}

		if (scroll) {
			clearTimeout(this.onScrollTimeout)
			this.store.lockScroll(true, true)

			this.onScrollTimeout = setTimeout(() => {
				clearTimeout(timeout)
				this.store.setState({ direction })
				const nextPoint = clamp(current + (normal ? +1 : -1), [0, scenes])
				const y = normal ? scenesRect[nextPoint].top : scenesRect[nextPoint].bottom - viewportHeight
				this.scrollTo({ positionY: y, current: nextPoint })
			}, afterEventTimeout)
		}
	}

	handleMouseWheel({ deltaY }) {
		const {
			thresholdScroll: { desktop },
		} = this.store.getState()
		this.store.setState({ currentScrollThreshold: desktop })

		const direction = deltaY > 0 ? NORMAL : REVERSE
		this.store.setState({ mouseWheel: true })

		const clampedDelta = clamp(deltaY, [-120, 120])

		if (this.hasReachedScrollBoundary(clampedDelta)) {
			this.throttledUpdateMouseWhell({ scroll: Math.abs(deltaY) > 0, direction })
		}
	}

	handleTouchStart(event) {
		this.startY = event.touches[0].clientY
	}

	handleTouchMove(event) {
		const {
			thresholdScroll: { mobile },
		} = this.store.getState()
		this.store.setState({ currentScrollThreshold: mobile })

		const deltaY = this.startY - event.touches[0].clientY
		const direction = deltaY > 0 ? NORMAL : REVERSE

		const clampedDelta = clamp(deltaY, [-72, 72])

		this.store.setState({ mouseWheel: false })

		if (this.hasReachedScrollBoundary(clampedDelta)) {
			this.handleWheel({ scroll: Math.abs(deltaY) > 0, direction })
		}
	}
}

class ScrollHandler {
	constructor(store, camera, options) {
		this.store = store
		this.options = options
		this.camera = camera
		this.init()
	}

	init() {
		this.sections = [...(document.querySelectorAll(this.options.sectionSelectors) || [])]
		this.store.setState({ sections: this.sections })

		const throttleOnResize = throttle(this.onResize.bind(this), 1000)
		throttleOnResize()
		window.addEventListener('resize', throttleOnResize, { passive: true })

		fetch(this.options.cameraStatePath)
			.then((response) => response.json())
			.then((cameraState) => {
				this.store.setState({ cameraState })
				this.smoothScroller = new SmoothScroller(this.options.scrollSelector, this.store)
				this.cameraOnScroll = new CameraOnScroll(this.camera, this.store)
			})
	}

	onResize() {
		const scenesRect = this.sections.map((section) => {
			const { top, bottom } = section.getBoundingClientRect()
			return { top, bottom }
		})

		this.store.setState({ scenesRect })
	}
}

export default ScrollHandler
