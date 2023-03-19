import { SpotLight } from 'three';

class Lights {
	constructor() {
		this.intensityFactor = 1;
		this.lights = [];
		this.create();
		return this.lights;
	}

	create() {
		const leftSpotLight = new SpotLight(0xc9bbff, 1);
		leftSpotLight.distance = 150;
		leftSpotLight.position.set(-56, 87, 47);
		leftSpotLight.intensity = 3500 * this.intensityFactor;
		leftSpotLight.penumbra = 1;

		const topSpotLight = new SpotLight(0xff3d0c, 1);
		topSpotLight.distance = 150;
		topSpotLight.position.set(6, 80, 0);
		topSpotLight.intensity = 1800 * this.intensityFactor;
		topSpotLight.penumbra = 0.75;

		const rightSpotLight = new SpotLight(0xff0633, 1);
		rightSpotLight.distance = 150;
		rightSpotLight.position.set(46, 70, -20);
		rightSpotLight.intensity = 1016.4556962025315 * this.intensityFactor;
		rightSpotLight.penumbra = 1;

		const extraSpotLight = new SpotLight(0xc9bbff, 1);
		rightSpotLight.distance = 400;
		rightSpotLight.position.set(-13.89, -22.29, 30.41);
		rightSpotLight.intensity = 190 * this.intensityFactor;
		rightSpotLight.penumbra = 1;

		const lights = [leftSpotLight, topSpotLight, rightSpotLight, extraSpotLight];

		this.lights = lights;
	}
}

export default Lights;
