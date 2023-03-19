import { getProject, types } from '@theatre/core';
import { Vector3 } from 'three';
import Scrollbar, { ScrollbarPlugin } from 'smooth-scrollbar';
import { throttle } from './utils';
import config from './config';

class CameraOnScroll {
	constructor(camera, store) {
		this.camera = camera;
		this.store = store;
		this.cameraState = this.store.getState().cameraState;
		const project = getProject('lights', { state: this.cameraState });
		const sheet = project.sheet('lights');
		this.cameraObj = sheet.object('Camera', {
			position: types.compound({
				...this.camera.position,
			}),
			lookAt: types.compound({
				x: 0,
				y: 0,
				z: 0,
			}),
		});
		this.cameraObj.onValuesChange((values) => {
			this.camera.position.set(values.position.x, values.position.y, values.position.z);
			const { x, y, z } = values.lookAt;
			this.camera.lookAt(new Vector3(x, y, z));
			this.camera.updateProjectionMatrix();
		});
		this.onBodyScroll = this.onBodyScroll.bind(this);
		this.store.subscribe(this.onBodyScroll, 'current');
	}

	onBodyScroll() {
		const scrollState = this.store.getState();
		const direction = scrollState.direction;
		const normal = direction === 'normal';
		const from = normal ? scrollState.current - 1 : scrollState.current;
		const to = normal ? scrollState.current : scrollState.current + 1;
		const project = getProject('lights', { state: scrollState.cameraState });
		const sheet = project.sheet('lights');
		sheet.sequence.play({ range: [from, to], direction });
	}
}

class LockPlugin extends ScrollbarPlugin {
	static pluginName = 'lock';
	transformDelta(delta, { deltaY }) {
		if (this.options.isLock || Math.abs(deltaY) < config.threshold.desktop) {
			return { x: 0, y: 0 };
		}
		return delta;
	}
}

class SmoothScroller {
	constructor(scrollerContainer, store) {
		this.scroller = document.querySelector(scrollerContainer);
		if (!this.scroller) {
			throw new Error(`we need a container to scroll ${scrollerContainer}`);
		}
		this.store = store;
		this.store.setState({
			current: 0,
			currentSection: this.store.getState().sections[0],
		});
		this.bodyScrollBar = Scrollbar.init(this.scroller, {
			damping: 1,
			continuousScrolling: false,
			delegateTo: document.body,
			plugins: {
				lock: {
					isLock: false,
				},
			},
		});
		this.bodyScrollBar.addListener((status) =>
			this.store.setState({
				scrollProgress: status.offset.y / status.limit.y,
				scrollStatus: status,
			})
		);
		this.store.subscribe(
			(isLock) => this.bodyScrollBar.updatePluginOptions('lock', { isLock }),
			'locked'
		);
		this.store.subscribe(
			(syntaticScroll) => this.handleWheel(syntaticScroll),
			'syntaticScroll'
		);
		this.onScrollTimeout = null;
		this.handleMouseWheel = this.handleMouseWheel.bind(this);
		this.handleTouchStart = this.handleTouchStart.bind(this);
		this.handleTouchMove = this.handleTouchMove.bind(this);
		this.handleWheel = this.handleWheel.bind(this);
		this.scroller.addEventListener('wheel', this.handleMouseWheel, { passive: false });
		this.scroller.addEventListener('touchstart', this.handleTouchStart, { passive: false });
		this.scroller.addEventListener('touchmove', this.handleTouchMove, { passive: false });
		Scrollbar.use(LockPlugin);
	}

	handleWheel({ scroll, duration = 600 }) {
		const { direction, sections, scenes, current, locked, timeout } = this.store.getState();
		const normal = direction === 'normal';

		function scrollTo(y, next) {
			this.bodyScrollBar.scrollTo(0, y, Math.max(duration, 100), {
				callback: () => {
					const timeout = setTimeout(() => this.store.lockScroll(), Math.max(duration - 100, 100));
					this.store.setState({
						current: next,
						timeout,
						currentSection: sections[next],
					});
				},
			});
		}

		const scenesLength = scenes.length - 1;

		if (current === scenesLength && normal || current === 0 && !normal || locked) {
			return;
		}

		if (scroll) {
			this.store.lockScroll(true, 'wheel');
			clearTimeout(this.onScrollTimeout);
			this.onScrollTimeout = setTimeout(() => {
				clearTimeout(timeout);
				const directionIncrement = normal ? +1 : -1;
				const next = Math.max(Math.min(current + directionIncrement, scenesLength), 0);
				scrollTo.call(this, scenes[next], next);
			}, config.afterEventTimeout);
		}
	}

	handleMouseWheel(event) {
		const { deltaY } = event;
		if (deltaY > config.threshold.desktop) {
			this.store.setState({ direction: 'normal' });
		} else if (deltaY < -config.threshold.desktop) {
			this.store.setState({ direction: 'reverse' });
		}
		const scroll = Math.abs(deltaY) > config.threshold.desktop;
		this.handleWheel({ scroll });
	}

	handleTouchStart(event) {
		this.startY = event.touches[0].clientY;
	}

	handleTouchMove(event) {
		this.currentY = event.touches[0].clientY;
		const deltaY = this.startY - this.currentY;
		if (deltaY > config.threshold.mobile) {
			this.store.setState({ direction: 'normal' });
		} else if (deltaY < -config.threshold.mobile) {
			this.store.setState({ direction: 'reverse' });
		}
		const scroll = Math.abs(deltaY) > config.threshold.mobile;
		this.handleWheel({ scroll });
	}
}

class ScrollHandler {
	constructor(store, camera, options) {
		this.store = store;
		this.options = options;
		this.camera = camera;

		this.init()

	}

	init() {

		this.sections = [...(document.querySelectorAll(this.options.sectionSelectors) || [])];
		this.store.setState({ sections: this.sections });

		const throttleOnResize = throttle(this.onResize.bind(this), 1000);
		throttleOnResize()
		window.addEventListener('resize', throttleOnResize, { passive: true });

		fetch(this.options.cameraStatePath)
			.then((response) => response.json())
			.then((cameraState) => {
				this.store.setState({
					cameraState,
				});
				this.smoothScroller = new SmoothScroller(this.options.scrollSelector, this.store);
				this.cameraOnScroll = new CameraOnScroll(this.camera, this.store);
			});
	}

	onResize() {
		const scenes = this.sections.map((section, index) => {
			const { top, height } = section.getBoundingClientRect();
			return index === 0 ? 0 : top + height / 2 - window.innerHeight / 2;
		});

		this.store.setState({ scenes });
	}
}


export default ScrollHandler;
