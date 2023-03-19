import { TextureLoader, MeshLambertMaterial, Mesh, PlaneGeometry, PointLight } from 'three';

import { randomIntFromInterval } from './utils';

class Background {
	constructor(scene, renderer) {
		this.scene = scene;
		this.renderer = renderer;
		this.cloudParticles = [];
		this.zRange = [];
		this.init();
	}

	init() {
		const pixelRatio = this.renderer.getPixelRatio();

		const loader = new TextureLoader();
		const cloudGeo = new PlaneGeometry(250, 250);
		this.createThunder(this.zRange);

		new Promise((resolve) =>
			loader.load('smoke-o.webp', (texture) => resolve(texture))
		).then((texture) => {

			const cloudMaterial = new MeshLambertMaterial({
				map: texture,
				transparent: true,
			});

			for (let p = 0; p < 16 / pixelRatio; p++) {
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

		});
	}

	createThunder(zRange) {
		this.flash = new PointLight(0xff0000, 175, 250, 1.5)
		this.flashMaxZ = Math.max(...zRange)
		this.flashMinZ = this.flashMaxZ - 1
		this.flash.position.set(0, 0, this.flashMinZ)
		this.scene.add(this.flash)
	}

	animateThumder() {
		const frequency = Math.min(0.85 * this.renderer.getPixelRatio(), 0.9)

		if (Math.random() > frequency) {
			if (this.flash.power < 100) {
				this.flash.intensity = 400
				const x = randomIntFromInterval(-20, 20)
				const y = randomIntFromInterval(-40, 45)
				const z = randomIntFromInterval(this.flashMinZ, this.flashMaxZ)
				this.flash.position.set(x, y, z)
			}
			this.flash.power = 50 + Math.random() * 500
		}
	}

	animate() {
		this.cloudParticles.forEach((p) => {
			p.rotation.z -= 0.005
		})

		this.animateThumder()
	}
}

export default Background
