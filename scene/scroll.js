import { debounce } from './utils';
import CameraOnScroll from './scrollCamera';
import SmoothScroller from './scrollSmooth';

class ScrollHandler {
	constructor(store, camera, options) {
		this.store = store;
		this.options = options;
		this.camera = camera;
		this.init();
	}

	init() {
		this.sections = [...(document.querySelectorAll(this.options.sectionSelectors) || [])];
		this.store.setState({ sections: this.sections });

		this.onResize();
		const deboucedOnResize = debounce(this.onResize.bind(this), 500);
		window.addEventListener('resize', deboucedOnResize, { passive: true });

		fetch(this.options.cameraStatePath)
			.then((response) => response.json())
			.then((cameraState) => {
				this.store.setState({ cameraState });
				this.smoothScroller = new SmoothScroller(this.options.scrollSelector, this.store);
				this.cameraOnScroll = new CameraOnScroll(this.camera, this.store);
			});
	}

	onResize() {
		const scenesRect = this.sections.map((section) => {
			const { top, bottom } = section.getBoundingClientRect();
			return { top, bottom };
		});

		this.store.setState({ scenesRect });
	}
}

export default ScrollHandler;
