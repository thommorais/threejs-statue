import { getDefaultSizes } from './utils';
import {
	WebGLRenderer,
	SRGBColorSpace,
	ACESFilmicToneMapping,
	Scene,
	PerspectiveCamera,
	Clock,
} from 'three';

class Stage {

	initStage(store) {
		this.createScene();
		this.createPerspectiveCamera();
		this.clock = new Clock();
		this.clock.start();
		this.createRenderer();

		this.addEventListener();

		this.store = store;

		this.store.subscribe(({ gpuData }) => {
			this.renderer.powerPreference = gpuData.tier > 1 ? 'high-performance' : 'low-power';
			this.renderer.resetState();
		}, ['gpuData'])
	}

	addEventListener() {
		window.addEventListener('resize', () => {
			const { width, height } = getDefaultSizes();
			this.camera.aspect = width / height;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(width, height);
			this.pixelRatio = this.renderer.getPixelRatio()
		});
	}

	createRenderer() {
		const { width, height, pixelRatio } = getDefaultSizes();
		const canvas = document.querySelector('.webgl');

		this.renderer = new WebGLRenderer({
			canvas,
			stencil: true,
			depth: true,
			alpha: false,
		});


		this.renderer.useLegacyLights = false;
		this.renderer.outputColorSpace = SRGBColorSpace;
		this.renderer.toneMapping = ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.25;

		this.renderer.setSize(width, height);
		this.renderer.setPixelRatio(pixelRatio);

		this.renderer.setClearColor('#100C0D', 1)

		this.pixelRatio = this.renderer.getPixelRatio()
		this.renderer.render(this.scene, this.camera)
	}


	createScene() {
		this.scene = new Scene();
	}

	createPerspectiveCamera() {
		const { width, height } = getDefaultSizes();
		this.camera = new PerspectiveCamera(45, width / height, 1, 180);
		this.camera.position.set(0, 24, 20);
	}
}

export default Stage;
