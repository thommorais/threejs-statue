function randomIntFromInterval(min, max, avoid = []) {
	if (!Array.isArray(avoid)) {
		avoid = [avoid]
	}
	let number = Math.floor(Math.random() * (max - min + 1)) + min
	if (avoid.includes(number)) {
		return randomIntFromInterval(min, max, avoid)
	}
	return number
}
async function background(scene, renderer) {
	const pixelRatio = renderer.getPixelRatio()

	const { TextureLoader, MeshLambertMaterial, Mesh, PlaneGeometry, PointLight } = await import('three')

	const loader = new TextureLoader()
	const zRange = []

	const texture = await new Promise((resolve) => loader.load('smoke-o.webp', (texture) => resolve(texture)))

	const cloudGeo = new PlaneGeometry(250, 250)
	const cloudParticles = []

	const cloudMaterial = new MeshLambertMaterial({
		map: texture,
		transparent: true,
	})

	for (let p = 0; p < 16 / pixelRatio; p++) {
		const cloud = new Mesh(cloudGeo, cloudMaterial)
		const z = Math.abs(randomIntFromInterval(-70, -30, zRange)) * -1
		const x = randomIntFromInterval(-10, 10)
		const rz = randomIntFromInterval(0, 15)
		zRange.push(z)
		cloud.position.set(x, -10, z)
		cloud.rotation.x = 0
		cloud.rotation.y = -0.15
		cloud.rotation.z = rz
		cloud.material.opacity = 0.33
		cloudParticles.push(cloud)
		scene.add(cloud)
	}

	function createThunder(zRange) {
		if (pixelRatio > 1) {
			return () => {}
		}

		const flashMaxZ = Math.max(...zRange)
		const flashMinZ = flashMaxZ - 1

		const flash = new PointLight(0xff0000, 175, 250, 1.5)
		flash.position.set(0, 0, flashMinZ)
		scene.add(flash)

		const frequency = Math.min(0.85 * pixelRatio, 0.9)

		return () => {
			if (Math.random() > frequency) {
				if (flash.power < 100) {
					flash.intensity = 400
					const x = randomIntFromInterval(-20, 20)
					const y = randomIntFromInterval(-40, 45)
					const z = randomIntFromInterval(flashMinZ, flashMaxZ)
					flash.position.set(x, y, z)
				}
				flash.power = 50 + Math.random() * 500
			}
		}
	}

	const animateThunder = createThunder(zRange)

	function animate() {
		cloudParticles.forEach((p) => {
			p.rotation.z -= 0.005
		})

		animateThunder()
	}

	return animate
}

export default background
