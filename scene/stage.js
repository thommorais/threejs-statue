import { getDefaultSizes } from './utils';
import {
	WebGLRenderer,
	sRGBEncoding,
	ACESFilmicToneMapping,
	Scene,
	Color,
	PerspectiveCamera,
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class Stage {
	constructor() {
		this.renderer = this.createRenderer();
		this.scene = this.createScene();
		this.camera = this.createPerspectiveCamera();
		this.controls = null // this.createOrbitControl(this.camera, this.renderer);

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
		});

		renderer.physicallyCorrectLights = true;
		renderer.outputEncoding = sRGBEncoding;
		renderer.toneMapping = ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.25;
		renderer.logarithmicDepthBuffer = true;
		renderer.setSize(width, height);
		renderer.setPixelRatio(pixelRatio);

		if (pixelRatio === 1) {
			renderer.antialias = true;
		}

		return renderer;
	}

	createOrbitControl(camera, renderer) {
		const orbitControls = new OrbitControls(camera, renderer.domElement);
		orbitControls.enableDamping = true;
		orbitControls.enablePan = true;
		return orbitControls;
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
