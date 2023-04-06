import {
	WebGLRenderer,
	sRGBEncoding,
	ACESFilmicToneMapping,
	Scene,
	PerspectiveCamera,
	Clock,
} from 'three';


class Stage {

	constructor(width, height, pixelRatio, offscreen) {

		this.width = width;
		this.height = height;
		this.pixelRatio = pixelRatio;
		this.canvas = offscreen;
		this.clock = new Clock();
		this.clock.start();

		this.createScene();
		this.createPerspectiveCamera();
		this.createRenderer();
	}

	createRenderer() {

		this.renderer = new WebGLRenderer({
			canvas: this.canvas,
			stencil: true,
			depth: true,
			antialias: true,
			alpha: false,
			powerPreference: 'high-performance',
		});

		this.renderer.physicallyCorrectLights = true;
		this.renderer.outputEncoding = sRGBEncoding;
		this.renderer.toneMapping = ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.25;
		this.renderer.setSize(this.width, this.height, false);
		this.renderer.setPixelRatio(this.pixelRatio);
		this.renderer.setClearColor('#100C0D', 1)

		this.renderer.render(this.scene, this.camera)
	}

	createScene() {
		this.scene = new Scene();
	}

	createPerspectiveCamera() {
		this.camera = new PerspectiveCamera(45, this.width / this.height, 1, 180);
		this.camera.position.set(0, 20, 60);
	}
}

export default Stage
