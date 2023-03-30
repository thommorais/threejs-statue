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
		this.createScene();
		this.createPerspectiveCamera();
		this.controls = null // this.createOrbitControl(this.camera, this.renderer);
		this.clock = new Clock();
		this.clock.start();
		this.createRenderer();

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

		this.renderer = new WebGLRenderer({
			canvas,
			stencil: true,
			depth: true,
			antialias: true,
		});

		this.renderer.physicallyCorrectLights = true;
		this.renderer.outputEncoding = sRGBEncoding;
		this.renderer.toneMapping = ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.25;
		this.renderer.logarithmicDepthBuffer = false;
		this.renderer.failIfMajorPerformanceCaveat = true

		this.renderer.setSize(width, height);
		this.renderer.setPixelRatio(pixelRatio);

		this.pixelRatio = this.renderer.getPixelRatio()

		this.renderer.render(this.scene, this.camera)
	}


	createScene() {
		this.scene = new Scene();
		this.scene.background = new Color('#100C0D');
	}

	createPerspectiveCamera() {
		const { width, height } = getDefaultSizes();
		this.camera = new PerspectiveCamera(45, width / height, 1, 180);
		this.camera.position.set(0, 0, 50);
		this.camera.focus = 0;
	}
}

export default Stage;
