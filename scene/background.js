import * as THREE from 'three'

async function background(scene) {
	const ambient = new THREE.AmbientLight(0x555555, 0.001)
	scene.add(ambient)
	scene.fog = new THREE.FogExp2(0x11111f, 0.0001)

	let loader = new THREE.TextureLoader()

	let cloudParticles = []
	loader.load('smoke.png', function (texture) {
		const cloudGeo = new THREE.PlaneGeometry(500, 500)

		const cloudMaterial = new THREE.MeshLambertMaterial({
			map: texture,
			transparent: true,
		})

		for (let p = 0; p < 12; p++) {
			const cloud = new THREE.Mesh(cloudGeo, cloudMaterial)
			const z = -150 + Math.random() * 500 - 450
			console.log(z)
			cloud.position.set(Math.random() * 800 - 400, 0, z)
			cloud.rotation.x = 1.16
			cloud.rotation.y = -0.15
			cloud.rotation.z = Math.random() * 90
			cloud.material.opacity = 0.25
			cloudParticles.push(cloud)
			scene.add(cloud)
		}
		animate()
	})

	const flash = new THREE.PointLight(0xffffff, 30, 500, 1.7)
	flash.position.set(0, 0, -150)
	scene.add(flash)

	function animate() {
		cloudParticles.forEach((p) => {
			p.rotation.z -= 0.0075 * Math.random()
		})

		if (Math.random() > 0.5 || true) {
			if (flash.power < 100) {
				flash.position.set(Math.random() * 100, Math.random() * 100, -150)
			}
			flash.power = 50 + Math.random() * 500
		}
		requestAnimationFrame(animate)
	}
}

export default background
