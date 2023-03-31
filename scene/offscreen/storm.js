import {

	MeshLambertMaterial,
	Mesh,
	PlaneGeometry,
	Group,
	PointLight,
	ImageBitmapLoader,
	CanvasTexture,
} from 'three';

import { clamp, randomIntFromInterval } from '../utils'


function loadTextureOffScreen(bgTexturePath) {

	const path = './'

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

class Storm {
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
		this.flash.position.set(0, 0, this.flashMaxZ - 1)
		this.scene.add(this.flash)
	}


	animateThunder() {
		if (this.gpuData.tier === 1) {
			this.frequency = 0.97
		}

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

export default Storm