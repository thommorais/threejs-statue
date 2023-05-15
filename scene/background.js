import {
	TextureLoader,
	MeshLambertMaterial,
	Mesh,
	PlaneGeometry,
	PointLight,
	Group,
} from 'three';

import { randomIntFromInterval, clamp } from './utils';

class Background {
	constructor(scene, store, options) {
		this.scene = scene;
		this.store = store;
		this.characterClass = options.characterClass;
		this.zRange = [];
		this.frequency = 0.87;

		this.lastRAF = 0;

		this.initialized = false;

		this.gpuData = this.store.getState().gpuData;
		this.cloudsCount = this.gpuData.isMobile ? 3 : 5;
		this.init();
	}

	init() {
		this.loadTexture().then(() => {
			this.createThunder();
			this.initialized = true;
		});
	}

	loadTexture() {
		const { bgTexturePath } = this.store.getState();
		const loader = new TextureLoader();
		// eslint-disable-next-line max-len
		return new Promise((resolve) => loader.load(bgTexturePath, (texture) => resolve(texture))).then(this.createClouds.bind(this));
	}

	createClouds(texture) {
		const cloudGeo = new PlaneGeometry(175, 175);

		const cloudMaterial = new MeshLambertMaterial({
			map: texture,
			transparent: true,
		});

		this.Clouds = new Group();

		for (let count = 0; count < this.cloudsCount; count += 1) {
			const cloud = new Mesh(cloudGeo, cloudMaterial);
			const z = Math.abs(randomIntFromInterval(-36, -20, this.zRange)) * -1;
			this.zRange.push(z);
			const x = randomIntFromInterval(-10, 10);
			cloud.position.set(x, -9, z);
			cloud.rotation.x = 0;
			cloud.rotation.y = -0.25;
			cloud.rotation.z = randomIntFromInterval(-5, 15);

			cloud.material.opacity = 0.55;
			cloud.name = `cloud-${count}`;
			this.Clouds.add(cloud);
		}

		this.cloudParticlesCount = this.Clouds.children.length;
		this.scene.add(this.Clouds);
	}

	createThunder() {
		const { backgroundColors } = this.store.getState();
		const value = backgroundColors[this.characterClass] || backgroundColors[0];
		this.flash = new PointLight(value, 175, 150, 0.99);
		this.flashMaxZ = Math.max(...this.zRange);
		this.flash.position.set(0, 0, this.flashMaxZ - 1);
		this.scene.add(this.flash);
	}

	animateThumder() {
		if (this.gpuData.isMobile) {
			this.frequency = 0.98;
		}

		const thunder = Math.random() > this.frequency;
		if (thunder && this.flash) {
			if (this.flash.power < 200) {
				this.flash.intensity = randomIntFromInterval(90, 120);
				const y = randomIntFromInterval(-30, 45);
				const x = randomIntFromInterval(-18, 18);
				const z = randomIntFromInterval(
					Math.min(...this.zRange),
					this.flashMaxZ
				);
				this.flash.position.set(x, y, z);
			}
			this.flash.power = 50 + Math.random() * 450;
		}
	}

	rotateClouds() {
		for (let i = 0; i < this.cloudParticlesCount; i += 1) {
			const cloud = this.Clouds.children[i];
			if (cloud) {
				cloud.rotation.z -= 0.007;
			} else {
				cancelAnimationFrame(this.lastRAF);
			}
		}
	}

	update() {
		if (!this.initialized) return;
		cancelAnimationFrame(this.lastRAF);
		this.lastRAF = requestAnimationFrame(() => {
			this.animateThumder();
			this.rotateClouds();
		});
	}
}

export default Background;
