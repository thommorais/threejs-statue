import { getProject, types } from '@theatre/core'
import { Vector3 } from 'three'
import Scrollbar, { ScrollbarPlugin } from 'smooth-scrollbar'
import { debounce } from './utils'

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

const getDistance = (a, b) => Math.abs(a - b)

class CameraOnScroll {
	constructor(camera, store) {
		this.camera = camera
		this.store = store

		const { cameraState } = this.store.getState()
		this.project = getProject('lights', { state: cameraState })
		this.sheet = this.project.sheet('lights')
		this.setListeners()
	}

	setListeners() {
		this.cameraObj = this.sheet.object('Camera', {
			position: types.compound({ ...this.camera.position }),
			lookAt: types.compound({ x: 0, y: 0, z: 0 }),
			rotateZ: types.number(0, { range: [-10, 10], nudgeMultiplier: 0.1 }),
		})

		this.cameraObj.onValuesChange(({ position, lookAt, rotateZ }) => {
			this.camera.position.set(position.x, position.y, position.z)
			const { x, y, z } = lookAt
			this.camera.lookAt(new Vector3(x, y, z))
			this.camera.rotation.z = rotateZ
		})

		this.store.subscribe(() => this.onBodyScroll(), 'to')
	}

	onBodyScroll() {
		const { direction, from, to } = this.store.getState()
		const range = direction === NORMAL ? [from, to] : [to, from]
		const { position } = this.sheet.sequence
		this.sheet.sequence.play({ range, direction, rate: position === 2 ? 2 : getDistance(from, to) })
		this.store.setState({ from: range[0] })
	}
}

class LockPlugin extends ScrollbarPlugin {
	static pluginName = 'lock'

	transformDelta(delta) {
		if (this.options.locked) {
			return { x: 0, y: 0 }
		}
		return delta
	}

}

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

		// Scrollbar.use(LockPlugin)

		this.bodyScrollBar = Scrollbar.init(this.scroller, {
			damping: 1,
			continuousScrolling: false,
			delegateTo: document.body,
			plugins: {
				lock: {
					locked: false,
				},
			},
		})

		this.bodyScrollBar.addListener((status) => {
			this.store.setState({
				scrollProgress: status.offset.y / status.limit.y,
				scrollStatus: status,
			})
		})

		this.store.subscribe(({ locked }) => {
			this.bodyScrollBar.updatePluginOptions('lock', { locked })
		}, 'locked')

		this.store.subscribe(({syntaticScroll}) => this.handleWheel(syntaticScroll), 'syntaticScroll')

		this.onScrollTimeout = null
		this.handleMouseWheel = this.handleMouseWheel.bind(this)
		this.handleTouchStart = this.handleTouchStart.bind(this)
		this.handleTouchMove = this.handleTouchMove.bind(this)
		this.handleWheel = this.handleWheel.bind(this)

		this.scroller.addEventListener('wheel', this.handleMouseWheel, { passive: false })
		this.scroller.addEventListener('touchstart', this.handleTouchStart, { passive: false })
		this.scroller.addEventListener('touchmove', this.handleTouchMove, { passive: false })

		this.RAF = null
	}


	scrollTo({ scrollToY, nextPoint }) {
		const { duration, sections, timeout } = this.store.getState()

		this.store.lockScroll()
		clearTimeout(timeout)

		this.bodyScrollBar.update()

		this.bodyScrollBar.addMomentum(0, scrollToY - this.bodyScrollBar.offset.y)
		this.bodyScrollBar.scrollTo(0, scrollToY, max(duration, 200), {
			callback: () => {
				const newTimeout = setTimeout(() => this.store.unLockScroll(), max(duration - 100, 100))
				this.store.setState({ currentSection: sections[nextPoint], timeout: newTimeout, current: nextPoint })
			},
		})
	}

	handleWheel({ scroll, direction }) {
		const { scenesRect, current, locked } = this.store.getState()
		const goingDown = direction === NORMAL
		const scenesCount = scenesRect.length - 1

		const avoidScroll = (current === scenesCount && goingDown) || (current === 0 && !goingDown) || locked

		if (scroll && !avoidScroll) {
			cancelAnimationFrame(this.RAF)
			this.RAF = requestAnimationFrame(() => {
				const { scenesRect, current, viewportHeight } = this.store.getState()

				const nextPoint = clamp(current + (goingDown ? +1 : -1), [0, scenesCount])
				const {top, bottom} = scenesRect[nextPoint] || {top: 0, bottom: 0}
				const scrollToY = goingDown ? scenesRect[nextPoint].top : scenesRect[nextPoint].bottom - viewportHeight

				this.store.setState({ from: current, to: nextPoint, direction })
				this.scrollTo({ scrollToY, nextPoint })

			})

		}
	}

	hasReachedScrollBoundary(threshold) {
		const { scenesRect, scrollStatus, viewportHeight, locked, to } = this.store.getState()

		const scrollTop = scrollStatus.offset.y
		const scrollBottom = scrollTop + viewportHeight

		const currentIndex = scenesRect.findIndex((scene) => isNumberInRange(scrollTop, [scene.top, scene.bottom]))

		const goingDown = threshold > 0

		const { bottom: currBottom = 0} = scenesRect[currentIndex] || {bottom: 0}
		const {top: nextTop = 0} = scenesRect[to] || {top: 0}

		const scrollDown = goingDown && !locked && scrollBottom >= currBottom + threshold
		const scrollUp = !goingDown && !locked && scrollTop <= nextTop - threshold

		return scrollDown || scrollUp
	}


	handleMouseWheel({ deltaY }) {
		const { thresholdScroll: { desktop } } = this.store.getState()
		const direction = deltaY > 0 ? NORMAL : REVERSE
		if (this.hasReachedScrollBoundary(clamp(deltaY, [-desktop, desktop]))) {
			this.handleWheel({ scroll: Math.abs(deltaY) > 0, direction })
		}
	}

	handleTouchStart({touches}) {
		this.startY = touches[0].clientY
	}

	handleTouchMove({ touches }) {
		const { thresholdScroll: {mobile} } = this.store.getState()
		const deltaY = this.startY - touches[0].clientY
		const direction = deltaY > 0 ? NORMAL : REVERSE
		const clampedDelta = clamp(deltaY, [-mobile, mobile])

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

		const deboucedOnResize = debounce(this.onResize.bind(this), 1000)
		deboucedOnResize()
		window.addEventListener('resize', deboucedOnResize, { passive: true })

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
