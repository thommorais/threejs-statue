import { getDefaultSizes } from './utils';
import {
	WebGLRenderer,
	sRGBEncoding,
	ACESFilmicToneMapping,
	Scene,
	Color,
	PerspectiveCamera,
	Clock,
} from 'three';



class Stage {
	constructor() {
		this.renderer = this.createRenderer();
		this.scene = this.createScene();
		this.camera = this.createPerspectiveCamera();
		this.controls = null // this.createOrbitControl(this.camera, this.renderer);
		this.clock = new Clock();
		this.clock.start();

		this.addEventListener();
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

		const renderer = new WebGLRenderer({
			canvas,
			stencil: true,
			depth: true,
			powerPreference: 'high-performance',
			antialias: true,
		});

		renderer.physicallyCorrectLights = true;
		renderer.outputEncoding = sRGBEncoding;
		renderer.toneMapping = ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.25;
		renderer.logarithmicDepthBuffer = false;

		renderer.setSize(width, height);
		renderer.setPixelRatio(pixelRatio);

		this.pixelRatio = renderer.getPixelRatio()

		return renderer;
	}


	createScene() {
		const scene = new Scene();
		scene.background = new Color('#100C0D');
		return scene;
	}

	createPerspectiveCamera() {
		const { width, height } = getDefaultSizes();
		const camera = new PerspectiveCamera(45, width / height, 1, 180);
		camera.position.set(0, 0, 50);
		camera.focus = 0;
		return camera;
	}
}

export default Stage;
