import * as THREE from 'three'

function randomIntFromInterval(min, max) {
	// min and max included
	return Math.floor(Math.random() * (max - min + 1) + min)
}

async function background(scene) {
	const ambient = new THREE.AmbientLight(0x555555, 0.001)
	scene.add(ambient)
	scene.fog = new THREE.FogExp2(0x11111f, 0.0001)

	let loader = new THREE.TextureLoader()

	let cloudParticles = []
	loader.load('smoke.png', function (texture) {
		const cloudGeo = new THREE.PlaneGeometry(250, 250)

		const cloudMaterial = new THREE.MeshLambertMaterial({
			map: texture,
			transparent: true,
		})

		for (let p = 0; p < 12; p++) {
			const cloud = new THREE.Mesh(cloudGeo, cloudMaterial)
			const z = randomIntFromInterval(-100, -50)
			const x = randomIntFromInterval(-10, 10)
			const rz = randomIntFromInterval(0, 15)
			cloud.position.set(x, -30, z)
			cloud.rotation.x = 0
			cloud.rotation.y = -0.15
			cloud.rotation.z = rz
			cloud.material.opacity = 0.5
			cloudParticles.push(cloud)
			scene.add(cloud)
		}
		animate()
	})
	const flash = new THREE.PointLight(0xffffff, 30, 250, 2)
	flash.position.set(0, 0, -50)
	scene.add(flash)

	function animate() {
		cloudParticles.forEach((p) => {
			p.rotation.z -= 0.0055
		})

		if (Math.random() > 0.85) {
			if (flash.power < 100) {
				const x = randomIntFromInterval(-20, 20)
				const y = randomIntFromInterval(-30, 40)
				flash.position.set(x, y, -50)
			}
			flash.power = 50 + Math.random() * 500
		}
		requestAnimationFrame(animate)
	}
}

export default background
