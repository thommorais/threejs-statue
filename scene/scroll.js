import { debounce, clamp } from './utils';
import ScrollSmoth from './scrollSmooth';

class ScrollHandler extends ScrollSmoth {
	constructor(store, camera, options) {
		super(store, camera, options);
		this.store = store;
		this.options = options;
		this.camera = camera;
		this.initialized = false;

		this.init();
	}

	init() {
		this.fetchCameraPositions().then((cameraPositions) => { this.loadProject(cameraPositions) });
		this.saveSections();
		this.onResize();
		this.initScrollBody();
		this.initialized = true;
	}


	fetchCameraPositions() {
		return new Promise((resolve) => {
			fetch(this.options.cameraPositionsPath)
				.then((response) => response.json())
				.then((cameraPositions) => {
					this.store.setState({ cameraPositions })

					try {
						for (let item in cameraPositions.sheetsById) {
							this.store.setState({
								cameraScenesCount: cameraPositions.sheetsById[item].sequence.length
							})
						}
					} catch (error) {
						console.log(error)
					}

					resolve(cameraPositions);
				});
		});
	}

	addEventListener() {
		const deboucedOnResize = debounce(this.onResize.bind(this), 500);
		window.addEventListener('resize', deboucedOnResize, { passive: true });
	}

	saveSections() {
		this.sections = [...(document.querySelectorAll(this.options.sectionSelectors) || [])];
		this.store.setState({ sections: this.sections, sectionsCount: this.sections.length });
	}

	onResize() {
		const sectionsRect = this.sections.map((section) => {
			const { top, bottom } = section.getBoundingClientRect();
			return { top: top + 1, bottom };
		});

		const viewportHeight = window.innerHeight;
		const scrollMarginVP = clamp( Math.abs(Math.floor(viewportHeight * 0.05)), [10, 40])
		this.store.setState({ sectionsRect, viewportHeight, scrollMarginVP });
	}
}

export default ScrollHandler;
