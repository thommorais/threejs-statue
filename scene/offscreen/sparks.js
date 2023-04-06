/* eslint-disable no-plusplus */
import { BufferGeometry, BufferAttribute, Points, ShaderMaterial, AdditiveBlending } from 'three'
import { randomIntFromInterval, clamp } from '../utils'

import * as Comlink from 'comlink'

const classIntervals = {
	demon: [0.85, 2],
	mage: [1.25, 3],
	barbarian: [0.5, 2.5],
}

class Sparks {
	constructor(scene, clock, state, pixelRatio, characterClass, dimensions, { fragmentShader, vertexShader }) {
		this.clock = clock
		this.scene = scene
		this.pixelRatio = pixelRatio
		this.sparks = null
		this.characterClass = characterClass
		this.minimalDrawTimeout = 2000
		this.currentDrwaTimeout = 0
		this.initialized = false

		this.width = dimensions.width
		this.height = dimensions.height
		this.pixelRatio = dimensions.pixelRatio

		this.state = state

		this.gpuData = this.state.gpuData
		this.fragmentShader = fragmentShader
		this.vertexShader = vertexShader

		this.count = 360 * this.gpuData.tier * clamp(pixelRatio, [1, 1.8])

		this.init()
	}

	init() {
		this.updateWindowDimensions()
		this.createParticles()
		this.updateSparksByCharacterClass().then((sparks) => {
			this.sparks = sparks
			this.runDrawLoop(classIntervals[this.characterClass], 24)
			this.scene.add(sparks)
			this.initialized = true
			console.log('sparks done')
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
			'barbarian': 1.5,
		}[this.characterClass]

		this.wWidth = this.width
		this.wHeight = this.height
		this.aspectRatio = clamp((this.wWidth / this.wHeight).toPrecision(2), [1.8, 5])
		this.boxWidth = clamp(4 * this.aspectRatio, [a, 4])
		this.boxHeight = this.boxWidth * h
		this.boxDepth = (this.boxWidth * 2)


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
		const { characterClassUniform } = this.state
		this.material = new ShaderMaterial({
			transparent: true,
			depthTest: true,
			depthWrite: false,
			blending: AdditiveBlending,
			uniforms: {
				u_hardness: { value: 0.9 },
				u_time: { value: 0 },
				u_opacity: { value: 0.9 },
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
			vertexShader: this.vertexShader,
			fragmentShader: this.fragmentShader,
		})

		return this.material
	}

	createGeometry() {
		this.geometry = new BufferGeometry()
		return this.geometry
	}

	updateSparksByCharacterClass() {

		return new Promise((resolve) => {
			const base = 8 * this.gpuData.tier

			let depth = 0
			let count = this.count

			if (this.characterClass === 'mage') {
				depth = clamp(base * this.gpuData.tier, [56, 112])
				count = clamp(this.count, [60, 400])
				this.sparks.material.uniforms.u_twist.value = 1.0;
				this.sparks.material.uniforms.u_falloff.value = 0.5;
				this.sparks.material.uniforms.u_windY.value = 0.75;

			}

			if (this.characterClass === 'demon') {
				depth = clamp(base * 2, [12, 16])
				count = this.count * 1.25
				this.sparks.material.uniforms.u_windY.value = -0.75
				this.sparks.material.uniforms.u_temporalFrequency.value = 0.0015
				this.sparks.material.uniforms.u_tailLength.value = 0.025
				this.sparks.material.uniforms.u_amplitude.value = 0.12
			}

			if (this.characterClass === 'barbarian') {
				depth = clamp(base * this.gpuData.tier, [18, 28])
				count = this.count * 0.75
				this.sparks.material.uniforms.u_temporalFrequency.value = 0.65
			}

			this.updateGeometryAttributes(depth, count).then((sparks) => {
				resolve(sparks)
			})

		})
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
		return new Promise((resolve) => {
			const deep = count * bitLength;
			const workerApi = new ComlinkWorker(new URL('./sparks.worker.js', import.meta.url), { type: 'module' });

			const attributesArray = new Float32Array(deep * 12);
			attributesArray.buffer.uuid = 'unique-identifier';

			const params = {
				count,
				bitLength,
				boxHeight: this.boxHeight,
				boxDepth: this.boxDepth,
				boxWidth: this.boxWidth,
				attributesArray
			};

			console.log('main thread', params.attributesArray.buffer.uuid);

			// Call the proxy object of the worker thread function
			workerApi.populateArray(Comlink.transfer(params, [params.attributesArray.buffer])).then((updatedAttributesArray) => {

				const positions = updatedAttributesArray.subarray(0, deep * 3);
				const data0Array = updatedAttributesArray.subarray(deep * 3, deep * 7);
				const data1Array = updatedAttributesArray.subarray(deep * 7, deep * 11);

				this.sparks.geometry.setAttribute('aData0', new BufferAttribute(data0Array, 4));
				this.sparks.geometry.setAttribute('aData1', new BufferAttribute(data1Array, 4));
				this.sparks.geometry.setAttribute('position', new BufferAttribute(positions, 3));

				resolve(this.sparks);
			}).catch((error) => {
				resolve(this.sparks);
			});
		});
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
