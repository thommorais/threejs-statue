import * as THREE from 'three'

function randomIntFromInterval(min, max) {
	// min and max included
	return Math.floor(Math.random() * (max - min + 1) + min)
}

async function background(scene, renderer) {
	const pixelRatio = renderer.getPixelRatio()

	const { TextureLoader, MeshLambertMaterial, Mesh, PlaneGeometry, PointLight } = await import('three')

	let loader = new TextureLoader()
	const zRange = []

	let cloudParticles = []
	loader.load('smoke.png', function (texture) {
		const cloudGeo = new PlaneGeometry(250, 250)

		const cloudMaterial = new MeshLambertMaterial({
			map: texture,
			transparent: true,
		})

		for (let p = 0; p < 16 / pixelRatio; p++) {
			const cloud = new Mesh(cloudGeo, cloudMaterial)
			const z = randomIntFromInterval(-70, -30)
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
		animate()
	})

	let flash
	if (pixelRatio === 1) {
		flash = new PointLight(0xff0000, 75, 250, 1.5)
		flash.position.set(0, 0, -40)
		scene.add(flash)
	}

	const flashMinZ = Math.min(...zRange) + 10
	const flashMaxZ = Math.max(...zRange) + 10

	function animate() {
		cloudParticles.forEach((p) => {
			p.rotation.z -= 0.005
		})

		if (Math.random() > 0.75 && pixelRatio === 1) {
			if (flash.power < 100) {
				const x = randomIntFromInterval(-15, 15)
				const y = randomIntFromInterval(-40, 40)
				const z = randomIntFromInterval(flashMinZ, flashMaxZ)
				flash.position.set(x, y, z)
			}
			flash.power = 50 + Math.random() * 500
		}
		requestAnimationFrame(animate)
	}
}

export default background
