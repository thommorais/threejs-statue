import {
	WebGLRenderer,
	sRGBEncoding,
	ACESFilmicToneMapping,
	Scene,
	PerspectiveCamera,
	BoxGeometry,
	MeshStandardMaterial,
	MeshLambertMaterial,
	Mesh,
	PlaneGeometry,
	Group,
	PointLight,
	ImageBitmapLoader,
	CanvasTexture,
	Clock,
} from 'three';

import { clamp, randomIntFromInterval } from '../utils'

import Sparks from './sparks';

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
		this.camera = new PerspectiveCamera(45, this.width / this.height, 1, 100);
		this.camera.position.set(0, 0, 60);
	}
}

function loadTextureOffScreen(bgTexturePath) {

	const path = import.meta.resolve('../../')


	return new Promise((resolve, reject) => {
		const loader = new ImageBitmapLoader().setPath(path);
		const onLoad = (imageBitmap) => {
			const texture = new CanvasTexture(imageBitmap);
			resolve(texture)
		}

		const onError = (err) => {
			reject(err)
		}

		const onProgress = (xhr) => {
			console.log((xhr.loaded / xhr.total * 100) + '% loaded')
		}

		loader.load(bgTexturePath, onLoad, onError, onProgress);
	})
}

class Background {
	constructor(scene, state, options, pixelRatio) {

		this.scene = scene
		this.state = state
		this.characterClass = options.characterClass
		this.zRange = []
		this.frequency = 0.5
		this.lastRAF = 0
		this.initialized = false
		this.gpuData = state.gpuData
		this.cloudsCount = clamp(4 * this.gpuData.tier * pixelRatio, [4, 12])
		this.init()

	}


	init() {
		this.loadTexture().then((texture) => {
			this.createClouds(texture)
			this.createThunder()
			this.initialized = true
		})
	}


	loadTexture() {
		const { bgTexturePath } = this.state
		return loadTextureOffScreen(bgTexturePath)
	}


	createClouds(texture) {
		const cloudGeo = new PlaneGeometry(175, 175)

		const cloudMaterial = new MeshLambertMaterial({
			map: texture,
			transparent: true,
		})

		this.Clouds = new Group()

		for (let count = 0; count < this.cloudsCount; count += 1) {
			const cloud = new Mesh(cloudGeo, cloudMaterial)
			const z = Math.abs(randomIntFromInterval(-36, -20, this.zRange)) * -1
			this.zRange.push(z)
			const x = randomIntFromInterval(-10, 10)
			cloud.position.set(x, -9, z)
			cloud.rotation.x = 0
			cloud.rotation.y = -0.25
			cloud.rotation.z = randomIntFromInterval(-5, 15)

			cloud.material.opacity = 0.55
			cloud.name = `${cloud}-${count}`
			this.Clouds.add(cloud)
		}

		this.cloudParticlesCount = this.Clouds.children.length
		this.scene.add(this.Clouds)
	}

	createThunder() {
		const { backgroundColors } = this.state
		const value = backgroundColors[this.characterClass] || backgroundColors[0]
		this.flash = new PointLight(value, 175, 150, 0.99)
		this.flashMaxZ = Math.max(...this.zRange)
		this.flash.position.set(0, 0, 10)
		this.scene.add(this.flash)
	}

	animateThunder() {
		const thunder = Math.random() > this.frequency
		if (thunder && this.flash) {
			if (this.flash.power < 200) {
				this.flash.intensity = randomIntFromInterval(90, 120)
				const y = randomIntFromInterval(-30, 45)
				const x = randomIntFromInterval(-18, 18)
				const z = randomIntFromInterval(Math.min(...this.zRange), this.flashMaxZ)
				this.flash.position.set(x, y, z)
			}
			this.flash.power = 50 + Math.random() * 450
		}
	}


	rotateClouds() {
		for (let i = 0; i < this.cloudParticlesCount; i += 1) {
			const cloud = this.Clouds.children[i]
			cloud.rotation.z -= 0.009
		}
	}

	update() {
		if (!this.initialized) return
		cancelAnimationFrame(this.lastRAF)
		this.lastRAF = requestAnimationFrame(() => {
			this.animateThunder()
			if (this.gpuData.tier > 1) {
				this.rotateClouds()
			}
		})
	}
}

class FasScene extends Stage {
	constructor(width, height, pixelRatio, offscreen, state, options) {
		super(width, height, pixelRatio, offscreen);

		this.width = width;
		this.height = height;
		this.pixelRatio = pixelRatio;
		this.canvas = offscreen;
		this.state = state
		this.options = options

		this.init()
		this.setAnimation()
	}

	init() {
		this.background = new Background(this.scene, this.state, this.options, this.pixelRatio)

		// scene, clock, state, pixelRatio, characterClass
		this.sparks = new Sparks(this.scene, this.clock, this.state, this.pixelRatio, this.options.characterClass, {
			width: this.width,
			height: this.height,
			pixelRatio: this.pixelRatio,
		})

		  // Create a cube
		  const geometry = new BoxGeometry(8, 30, 4);
		  const material = new MeshStandardMaterial({ color: '#0e0e0e' });
		  this.cube = new Mesh(geometry, material);

		  // Add the cube to the scene
		  this.scene.add(this.cube);
	}

	setAnimation() {
		this.renderer.setAnimationLoop((time) => {
			this.renderer.render(this.scene, this.camera);
			this.background.update(time)
			this.sparks.update(time);
			this.cube.rotation.y += 0.01;
		});

	}

}


export default FasScene