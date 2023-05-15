import { SpotLight, LinearSRGBColorSpace } from 'three';

const LIGHTS_CONFIG = [
	{
		intensity: 3500,
		distance: 150,
		position: [-56, 87, 47],
		penumbra: 1,
	},
	{
		intensity: 1800,
		distance: 150,
		position: [6, 80, 0],
		penumbra: 0.75,
	},
	{
		intensity: 1016.4556962025315,
		distance: 150,
		position: [46, 70, -20],
		penumbra: 1,
	},
	{
		intensity: 190,
		distance: 400,
		position: [-13.89, -22.29, 30.41],
		penumbra: 1,
	},
];

class Lights {
	constructor(scene, store, characterClass) {
		this.intensityFactor = 1;
		this.characterClass = characterClass;
		this.lights = [];
		this.initialized = false
		this.store = store
		this.scene = scene
		this.gpuData = this.store.getState().gpuData
		this.init();

	}

	init() {
		this.createLights();
		this.initialized = true
	}

	createLights() {
		const { classColors } = this.store.getState();

		const lights = LIGHTS_CONFIG.filter((_, i) => (this.gpuData.isMobile && i !== 2) || !this.gpuData.isMobile)

		this.lights = lights.map((config, index) => {
			const color = classColors[this.characterClass][index];
			const light = new SpotLight(color, 1);
			light.color.setHex(color, LinearSRGBColorSpace)
			light.distance = config.distance;
			light.position.set(...config.position);
			light.intensity = config.intensity * this.intensityFactor;
			light.penumbra = config.penumbra;
			return light;
		});

		this.scene.add(...this.lights);
	}


}

export default Lights;
