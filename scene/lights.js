import { SpotLight } from 'three';

const colors = {
	demon: [0xc9bbff, 0xff3d0c, 0xff0633, 0xc9bbff],
	mage: [0xbd50ff, 0xff6b47, 0xff03a5, 0xbd50ff],
	barbarian: [0xbf744a, 0xff7a50, 0xff7760, 0xbf744a]
}

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
	constructor() {
		this.intensityFactor = 1;
		this.lights = [];
		this.character = 'barbarian'
		this.create();
		return this.lights;
	}

	create() {
		this.lights = LIGHTS_CONFIG.map((config, index) => {
			const color = colors[this.character][index];
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
