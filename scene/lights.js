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
	constructor(store) {
		this.intensityFactor = 1;
		this.lights = [];
		this.store = store
		this.create();
		return this.lights;
	}

	create() {

		const { characterClass, classColors } = this.store.getState();

		this.lights = LIGHTS_CONFIG.map((config, index) => {
			const color = classColors[characterClass][index];
			const light = new SpotLight(color, 1);
			light.distance = config.distance;
			light.position.set(...config.position);
			light.intensity = config.intensity * this.intensityFactor;
			light.penumbra = config.penumbra;
			return light;
		});
	}
}

export default Lights;
