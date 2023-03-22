import {
	TextureLoader, MeshLambertMaterial, Mesh, PlaneGeometry, PointLight,
} from 'three';

import { randomIntFromInterval } from './utils';

class Background {
	constructor(scene) {
		this.scene = scene;
		this.cloudParticles = [];
		this.zRange = [];
		this.frequency = 0.85;
		this.init();
	}

	init() {

		const loader = new TextureLoader();
		const cloudGeo = new PlaneGeometry(250, 250);

		const createClouds = (texture) => {
			const cloudMaterial = new MeshLambertMaterial({
				map: texture,
				transparent: true,
			});

			for (let count = 0; count < 8; count += 1) {
				const cloud = new Mesh(cloudGeo, cloudMaterial);
				const z = Math.abs(randomIntFromInterval(-70, -30, this.zRange)) * -1;
				const x = randomIntFromInterval(-10, 10);
				const rz = randomIntFromInterval(0, 15);
				this.zRange.push(z);
				cloud.position.set(x, -10, z);
				cloud.rotation.x = 0;
				cloud.rotation.y = -0.15;
				cloud.rotation.z = rz;
				cloud.material.opacity = 0.33;
				cloud.name = 'cloud';
				this.cloudParticles.push(cloud);
				this.scene.add(cloud);
			}
			this.createThunder(this.zRange);
		}

		new Promise(
			(resolve) => loader.load('smoke-o.webp', (texture) => resolve(texture))
		).then(createClouds);
	}

	createThunder(zRange) {
		const witch = 0x7c00ff
		const demon = 0xff0000
		this.flash = new PointLight(witch, 175, 250, 1.5);
		this.flashMaxZ = Math.max(...zRange);
		this.flashMinZ = this.flashMaxZ - 1;
		this.flash.position.set(0, 0, this.flashMinZ);
		this.scene.add(this.flash);
	}

	animateThumder() {
		const thunder = Math.random() > this.frequency;
		if (thunder && this.flash) {
			if (this.flash.power < 100) {
				this.flash.intensity = 400;
				const x = randomIntFromInterval(-20, 20);
				const y = randomIntFromInterval(-40, 45);
				const z = randomIntFromInterval(this.flashMinZ, this.flashMaxZ);
				this.flash.position.set(x, y, z);
			}
			this.flash.power = 50 + Math.random() * 500;
		}
	}

	animate() {
		// eslint-disable-next-line no-param-reassign
		this.cloudParticles.forEach((cloud) => { cloud.rotation.z -= 0.009; });
		this.animateThumder();
	}
}

export default Background;
