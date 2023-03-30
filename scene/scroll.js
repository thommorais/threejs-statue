import { debounce, rIC } from './utils';
import ScrollSmoth from './scrollSmooth';

class ScrollHandler extends ScrollSmoth {
	constructor(store, camera, options, gpuData) {
		super(store, camera, options);
		this.store = store;
		this.options = options;
		this.camera = camera;
		this.initialized = false;
		this.gpuData = gpuData;
		rIC(this.init.bind(this), { timeout: 720 });
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

					for (let item in cameraPositions.sheetsById) {
						this.store.setState({
							cameraScenesCount: cameraPositions.sheetsById[item].sequence.length
						})
					}

					this.store.setState({ cameraPositions })
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
		const scrollMarginVP = Math.abs(Math.floor(viewportHeight * 0.05));
		this.store.setState({ sectionsRect, viewportHeight, scrollMarginVP });
	}
}

export default ScrollHandler;
