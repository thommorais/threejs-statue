import { getDefaultSizes } from './utils';
import {
	WebGLRenderer,
	sRGBEncoding,
	ACESFilmicToneMapping,
	Scene,
	Color,
	PerspectiveCamera,
} from 'three';


class Stage {
	constructor() {
		this.renderer = this.createRenderer();
		this.scene = this.createScene();
		this.camera = this.createPerspectiveCamera();
		this.controls = null // this.createOrbitControl(this.camera, this.renderer);

		// this.camera.position.z = 5


		window.addEventListener('resize', () => {
			const { width, height } = getDefaultSizes();
			this.camera.aspect = width / height;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(width, height);
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
			antialias: true, // Add this line
		});

		renderer.physicallyCorrectLights = true;
		renderer.outputEncoding = sRGBEncoding;
		renderer.toneMapping = ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.25;
		renderer.logarithmicDepthBuffer = true;


		renderer.setSize(width, height);
		renderer.setPixelRatio(pixelRatio);

		return renderer;
	}



	createScene() {
		const scene = new Scene();
		scene.background = new Color('#100C0D');
		return scene;
	}

	createPerspectiveCamera() {
		const { width, height } = getDefaultSizes();
		const camera = new PerspectiveCamera(45, width / height, 1, 250);
		camera.focus = 0;
		return camera;
	}
}

export default Stage;
