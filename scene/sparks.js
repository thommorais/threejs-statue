import * as THREE from 'three'

import fragmentShader from './shaders/sparks.fragment.glsl'
import vertexShader from './shaders/sparks.vertex.glsl'

async function sparks(scene, renderer, count) {
	const snowflake = '/sparks.png'
	const snowflakeTexture = new THREE.TextureLoader().load(snowflake)
	/**
	 * Particles
	 */

	const parameters = {}
	parameters.count = count
	parameters.randomness = 0.5
	parameters.randomnessPower = 5
	parameters.sizeMin = 150.0
	parameters.sizeMax = 400.0
	parameters.opacityMin = 0.1
	parameters.opacityMax = 1.0
	parameters.gravity = 180.0

	let wind = {
		current: -1,
		force: 0.9,
		target: 1.0,
		min: 0.1,
		max: 1.0,
		easing: 0.05,
	}

	/**
	 * Geometry
	 */
	const geometry = new THREE.BufferGeometry()

	const positions = new Float32Array(parameters.count * 3)
	const scales = new Float32Array(parameters.count * 1)
	const randomness = new Float32Array(parameters.count * 3)
	const speeds = new Float32Array(parameters.count * 3)
	const rotations = new Float32Array(parameters.count * 3)
	const opacities = new Float32Array(parameters.count * 1)

	for (let i = 0; i < parameters.count; i++) {
		const i3 = i * 3

		// Position
		positions[i3] = (Math.random() - 0.5) * 12
		positions[i3 + 1] = (Math.random() - 0.5) * 12
		positions[i3 + 2] = (Math.random() - 0.5) * 12

		// Randomness
		const randomX =
			Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness
		const randomY =
			Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness
		const randomZ =
			Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness

		// Random Positioning
		randomness[i3 + 0] = randomX
		randomness[i3 + 1] = randomY
		randomness[i3 + 2] = randomZ

		// Random Positioning
		opacities[i3 + 0] = Math.random() * (parameters.opacityMax - parameters.opacityMin) + parameters.opacityMin

		// Scale
		scales[i] = Math.random() * (parameters.sizeMax - parameters.sizeMin) + parameters.sizeMin

		// Speeds
		speeds[i3 + 0] = 1 + Math.random()
		speeds[i3 + 1] = Math.random() * (0.06 - 0.05) + 0.09
		speeds[i3 + 2] = Math.random() * (0.2 - 0.05) + 1.05

		// Rotations
		rotations[i3 + 0] = Math.random() * 5 * Math.PI
		rotations[i3 + 1] = Math.random() * 10
		rotations[i3 + 2] = Math.random() * 10
	}

	geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
	geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
	geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3))
	geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 3))
	geometry.setAttribute('aRotation', new THREE.BufferAttribute(rotations, 3))
	geometry.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1))

	/**
	 * Textures
	 */
	const particleTexture = snowflakeTexture
	const w = window.innerWidth
	const h = window.innerHeight
	/**
	 * Material
	 */
	const material = new THREE.ShaderMaterial({
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		vertexColors: true,
		vertexShader,
		fragmentShader,
		uniforms: {
			uTime: { value: 10.0 },
			uSize: { value: 15 * renderer.getPixelRatio() },
			uSpeed: { value: new THREE.Vector3(0.0000001, 0.02, Math.random()) },
			uGravity: { value: parameters.gravity },
			uWorldSize: { value: new THREE.Vector3(160, 100, 8) },
			uTexture: { value: particleTexture },
			uRotation: { value: new THREE.Vector3(1, 1, 1) },
			uWind: { value: 0 },
			uResolution: {
				value: new THREE.Vector2(w, h),
			},
		},
	})

	/**
	 * Points
	 */
	const points = new THREE.Points(geometry, material)
	points.scale.x = 48
	points.scale.y = 24
	points.scale.z = 18
	points.position.z = -10
	scene.add(points)

	/**
	 * Animate
	 */
	const clock = new THREE.Clock()
	let previousTime = 0

	const tick = () => {
		const elapsedTime = clock.getElapsedTime()
		const deltaTime = elapsedTime - previousTime
		previousTime = elapsedTime

		// Wind Calculation
		wind.force += (wind.target - wind.force) * wind.easing
		wind.current += wind.force * (deltaTime * 0.2)

		// Current Wind Uniform
		material.uniforms.uWind.value = wind.current

		if (Math.random() > 0.995) {
			wind.target = (wind.min + Math.random() * (wind.max - wind.min)) * (Math.random() > 0.5 ? -1 : 1) * 100
		}

		// Elapsed Time Uniform update
		material.uniforms.uTime.value = elapsedTime + 200

		// Call tick again on the next frame
		window.requestAnimationFrame(tick)
	}

	tick()
}

export default sparks
