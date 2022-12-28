export default async function createLights(scene, model) {
	const { HemisphereLight, SpotLight } = await import('three')

	const hemiLight = new HemisphereLight(0xffffff, 0x444444, 0.85)
	// scene.add(hemiLight)

	const leftSpotLight = new SpotLight(0xc9bbff, 1)
	leftSpotLight.distance = 150
	leftSpotLight.position.set(-56, 87, 47)
	leftSpotLight.intensity = 3500
	leftSpotLight.penumbra = 1

	const topSpotLight = new SpotLight(0xff3d0c, 1)
	topSpotLight.distance = 150
	topSpotLight.position.set(6, 80, 0)
	topSpotLight.intensity = 1800
	topSpotLight.penumbra = 0.75

	const rightSpotLight = new SpotLight(0xff0633, 1)
	rightSpotLight.distance = 150
	rightSpotLight.position.set(46, 70, -20)
	rightSpotLight.intensity = 1016.4556962025315
	rightSpotLight.penumbra = 1

	const extraSpotLight = new SpotLight(0xc9bbff, 1)
	rightSpotLight.distance = 400
	rightSpotLight.position.set(-13.898734177215196, -22.29367088607595, 30.417721518987335)
	rightSpotLight.intensity = 190
	rightSpotLight.penumbra = 1

	const lights = [leftSpotLight, topSpotLight, rightSpotLight, extraSpotLight]

	lights.forEach((spotLight) => {
		spotLight.castShadow = true
		spotLight.castShadow = true
		spotLight.shadow.mapSize.width = 1024
		spotLight.shadow.mapSize.height = 1024
		spotLight.shadow.camera.near = 10
		spotLight.shadow.camera.far = 200
		spotLight.shadow.focus = 1
		spotLight.target = model
		// spotLight.power = 3000
		spotLight.angle = 1.570796

		scene.add(spotLight)
	})

	return lights
}
