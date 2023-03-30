/* eslint-disable no-plusplus */
import { BufferGeometry, BufferAttribute, Points, ShaderMaterial, AdditiveBlending } from 'three'

import fragmentShader from './shaders/sparks.fragment.glsl'
import vertexShader from './shaders/sparks.vertex.glsl'

import { randomIntFromInterval, clamp } from './utils'

const classIntervals = {
	demon: [0.85, 2],
	mage: [1.25, 3],
	barbarian: [0.5, 2.5],
}

class Sparks {
	constructor(scene, clock, store, pixelRatio, characterClass) {
		this.store = store
		this.clock = clock
		this.scene = scene
		this.pixelRatio = pixelRatio
		this.sparks = null
		this.characterClass = characterClass
		this.minimalDrawTimeout = 2000
		this.currentDrwaTimeout = 0
		this.initialized = false

		this.gpuData = this.store.getState().gpuData
		this.count = 240 * this.gpuData.tier * clamp(pixelRatio, [1, 1.5])
		this.init()

	}

	init() {
		this.addEventListener()
		this.updateWindowDimensions()
		this.createParticles()
		this.updateSparksByCharacterClass()

		this.scene.add(this.sparks)

		this.runDrawLoop(classIntervals[this.characterClass], 100)

		this.initialized = true
	}

	addEventListener() {
		window.addEventListener('resize', () => {
			this.updateWindowDimensions()
		})
	}

	updateWindowDimensions() {
		const h = {
			'mage': 1.5,
			'demon': 2.25,
			'barbarian': 2.5,
		}[this.characterClass]

		const a = {
			'mage': 1,
			'demon': 1,
			'barbarian': 0.75,
		}[this.characterClass]

		this.wWidth = window.innerWidth
		this.wHeight = window.innerHeight
		this.aspectRatio = clamp((this.wWidth / this.wHeight).toPrecision(2), [1.8, 5])
		this.boxWidth = clamp(4 * this.aspectRatio, [a, 4])
		this.boxHeight = this.boxWidth * h
		this.boxDepth = (this.boxWidth * 5.2)

		if (this.sparks) {
			this.sparks.material.uniforms.u_screenHeight.value = this.wHeight
		}
	}
	createParticles() {
		this.createGeometry()
		this.createMaterial()
		this.sparks = new Points(this.geometry, this.material)
	}

	createMaterial() {
		const { characterClassUniform } = this.store.getState()
		this.material = new ShaderMaterial({
			transparent: true,
			depthTest: true,
			depthWrite: false,
			blending: AdditiveBlending,
			uniforms: {
				u_hardness: { value: 0.9 },
				u_time: { value: 1.2 },
				u_opacity: { value: 0.1 },
				u_screenHeight: { value: this.wHeight },
				u_pointSize: { value: 0.005 * this.pixelRatio },
				u_tailLength: { value: 0.15 },
				u_windY: { value: 0.3 },
				u_amplitude: { value: 0.5 },
				u_falloff: { value: 0.9 },
				u_twist: { value: 0.35 },
				u_spatialFrequency: { value: this.boxHeight * 0.25 },
				u_temporalFrequency: { value: 0.15 },
				u_blink: { value: 1.0 },
				u_dof: { value: 0.2 },
				u_gradient: { value: 1 },
				u_boxHeight: { value: this.boxHeight },
				u_characterClass: { value: characterClassUniform[this.characterClass] || 0.0 },
			},
			vertexShader,
			fragmentShader,
		})

		return this.material
	}

	createGeometry() {
		this.geometry = new BufferGeometry()
		return this.geometry
	}

	updateSparksByCharacterClass() {
		const base = 8 * this.gpuData.tier

		if (this.characterClass === 'mage') {
			const depth = clamp(base * this.gpuData.tier, [32, 112])
			const count = clamp(this.count, [60, 400])
			this.updateGeometryAttributes(depth, count)

			this.sparks.material.uniforms.u_twist.value = 1.0;
			this.sparks.material.uniforms.u_falloff.value = 0.5;
			this.sparks.material.uniforms.u_windY.value = 0.75;
		}

		if (this.characterClass === 'demon') {
			const depth = clamp(base * 2, [12, 16])
			this.updateGeometryAttributes(depth, this.count * 1.25)
			this.sparks.material.uniforms.u_windY.value = -0.75
			this.sparks.material.uniforms.u_temporalFrequency.value = 0.0005
			this.sparks.material.uniforms.u_tailLength.value = 0.025
			this.sparks.material.uniforms.u_amplitude.value = 0.1
		}

		if (this.characterClass === 'barbarian') {
			const depth = clamp(base * this.gpuData.tier, [12, 28])
			this.sparks.material.uniforms.u_temporalFrequency.value = 0.65
			this.updateGeometryAttributes(depth, this.count * 0.65)
		}

		this.sparks.material.needsUpdate = true
	}


	updateDrawLoop() {
		clearTimeout(this.currentDrwaTimeout)
		const currentClassInterval = classIntervals[this.characterClass]
		this.draw(this.clock.getDelta(), currentClassInterval)
	}

	updateClassUniform(characterClassUniform) {
		this.sparks.material.uniforms.u_characterClass.value = characterClassUniform[this.characterClass] || 0.0
	}

	updateGeometryAttributes(bitLength, count) {
		const deep = count * bitLength

		const data0Array = new Float32Array(deep * 4)
		const data1Array = new Float32Array(deep * 4)
		const positions = new Float32Array(deep * 3)

		const random = () => Math.random()

		const yHeight = this.boxHeight * 4

		let index1 = 0
		let index2 = 0

		for (let i = 0; i < count; i++) {
			const xx = random()
			const yy = random()
			const zz = random()
			const ww = random()

			const posX = clamp((2 * random() - 1) * (this.boxWidth / 2), [-1, 1])
			const posY = (2 * random() - 1) * yHeight
			const posZ = randomIntFromInterval(this.boxDepth * -1, this.boxDepth)

			for (let j = 0; j < bitLength; j++) {
				const px = index1++
				const py = index1++
				const pz = index1++
				const pw = index1++

				positions[px] = posX
				positions[py] = posY
				positions[pz] = posZ

				data0Array[px] = posX
				data0Array[py] = posY
				data0Array[pz] = posZ
				data0Array[pw] = j / bitLength

				data1Array[index2++] = xx
				data1Array[index2++] = yy
				data1Array[index2++] = zz
				data1Array[index2++] = ww
			}
		}

		this.sparks.geometry.setAttribute('aData0', new BufferAttribute(data0Array, 4))
		this.sparks.geometry.setAttribute('aData1', new BufferAttribute(data1Array, 4))
		this.sparks.geometry.setAttribute('position', new BufferAttribute(positions, 3))

		this.sparks.geometry.attributes.position.needsUpdate = true
		this.sparks.geometry.attributes.aData0.needsUpdate = true
		this.sparks.geometry.attributes.aData1.needsUpdate = true
	}

	randomValueFromInterval([min, max]) {
		return Math.random() * (max - min + 1) + min
	}

	runDrawLoop(classInterval, timeout) {
		const run = () => {
			const newTimeout = randomIntFromInterval(this.minimalDrawTimeout, this.minimalDrawTimeout * 1.5)
			this.currentDrwaTimeout = newTimeout
			requestAnimationFrame(this.runDrawLoop.bind(this, classInterval, newTimeout))
			this.draw(this.clock.getDelta(), classInterval)
		}
		setTimeout(run, timeout)
	}

	draw(deltaTime, classInterval) {
		if (!this.initialized) return
		const multiplyer = this.randomValueFromInterval(classInterval)
		this.sparks.material.uniforms.u_opacity.value = multiplyer * deltaTime
	}

	update(time) {
		if (!this.initialized) return
		this.sparks.material.uniforms.u_time.value = time * 0.002
	}
}

export default Sparks
