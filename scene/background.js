import { TextureLoader, MeshLambertMaterial, Mesh, PlaneGeometry, PointLight, Group } from 'three'

import { randomIntFromInterval, rIC, clamp } from './utils'

class Background {
	constructor(scene, store, options, pixelRatio, loadingManager) {
		this.scene = scene
		this.store = store
		this.characterClass = options.characterClass
		this.zRange = []
		this.frequency = 0.87

		this.loadingManager = loadingManager

		this.initialized = false

		this.gpuData = this.store.getState().gpuData

		this.cloudsCount = clamp(4 * this.gpuData.tier * pixelRatio, [4, 12])

		rIC(this.init.bind(this), { timeout: 720 })
	}

	init() {
		this.loadTexture().then(() => {
			this.createThunder()
			this.subscribeToCharacterClassChange()
			this.initialized = true
		})
	}

	loadTexture() {
		const { bgTexturePath } = this.store.getState()
		const loader = new TextureLoader(this.loadingManager)
		return new Promise((resolve) => loader.load(bgTexturePath, (texture) => resolve(texture))).then(
			this.createClouds.bind(this),
		)
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
		const { backgroundColors } = this.store.getState()
		const value = backgroundColors[this.characterClass] || backgroundColors[0]
		this.flash = new PointLight(value, 175, 150, 0.99)
		this.flashMaxZ = Math.max(...this.zRange)
		this.flash.position.set(0, 0, this.flashMaxZ - 1)
		this.scene.add(this.flash)
	}

	subscribeToCharacterClassChange() {
		this.store.subscribe(
			({ characterClass, backgroundColors }) => {
				if (this.characterClass === characterClass) return
				const value = backgroundColors[characterClass] || backgroundColors[0]
				this.flash.color.setHex(value)
			},
			['backgroundColors', 'characterClass'],
		)
	}

	animateThumder() {
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
		requestAnimationFrame(() => {
			this.animateThumder()
			this.rotateClouds()
		})
	}
}

export default Background
