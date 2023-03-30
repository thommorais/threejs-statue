import { SpotLight } from 'three';

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
	constructor(store, scene, characterClass) {
		this.intensityFactor = 1;
		this.characterClass = characterClass;
		this.lights = [];
		this.initialized = false
		this.store = store
		this.scene = scene
		this.init();
	}

	init() {
		this.createLights();
		this.initialized = true
	}

	createLights() {
		const { classColors } = this.store.getState();

		this.lights = LIGHTS_CONFIG.map((config, index) => {
			const color = classColors[this.characterClass][index];
			const light = new SpotLight(color, 1);
			light.distance = config.distance;
			light.position.set(...config.position);
			light.intensity = config.intensity * this.intensityFactor;
			light.penumbra = config.penumbra;
			return light;
		});

		for (const light of this.lights) {
			this.scene.add(light);
		}



		// const directionalLight = new DirectionalLight()
		// directionalLight.intensity = 1
		// directionalLight.position.set(1, 0.5, -1.5).normalize().multiplyScalar(3)
		// directionalLight.castShadow = true
		// directionalLight.shadow.mapSize.set(1024, 1024)
		// directionalLight.shadow.camera.near = 0.5
		// directionalLight.shadow.camera.far = 5.5
		// directionalLight.shadow.camera.left = -2
		// directionalLight.shadow.camera.right = 2
		// directionalLight.shadow.camera.top = 1.5
		// directionalLight.shadow.camera.bottom = -0.5
		// directionalLight.shadow.normalBias = 0.005
		// directionalLight.shadow.bias = 0.01
		// // this.scene.add(directionalLight)

	}


}

export default Lights;
