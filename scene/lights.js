export default async function createLights(scene, model) {
	const { HemisphereLight, SpotLight } = await import('three')

	const hemiLight = new HemisphereLight(0xffffff, 0x444444, 0.85)
	// scene.add(hemiLight)

	const leftSpotLight = new SpotLight(0xc9bbff, 1)
	leftSpotLight.position.set(-50, 90, 45)
	leftSpotLight.intensity = 1000
	leftSpotLight.angle = 1.25
	leftSpotLight.penumbra = 1
	leftSpotLight.distance = 150

	const topSpotLight = new SpotLight(0xff3d0c, 1)
	topSpotLight.distance = 200
	topSpotLight.position.set(10, 81, 5.25)
	topSpotLight.intensity = 1200
	topSpotLight.angle = 1.75
	topSpotLight.penumbra = 0.76
	topSpotLight.distance = 150

	const rightSpotLight = new SpotLight(0xff0633, 1)
	rightSpotLight.distance = 400
	rightSpotLight.position.set(67, 38.5, 25)
	rightSpotLight.intensity = 700
	rightSpotLight.angle = 1.575
	rightSpotLight.penumbra = 1
	rightSpotLight.distance = 150

	const lights = [leftSpotLight, topSpotLight, rightSpotLight]

	lights.forEach((spotLight) => {
		spotLight.castShadow = true
		spotLight.castShadow = true
		spotLight.shadow.mapSize.width = 1024
		spotLight.shadow.mapSize.height = 1024
		spotLight.shadow.camera.near = 10
		spotLight.shadow.camera.far = 200
		spotLight.shadow.focus = 1
		spotLight.target = model

		scene.add(spotLight)
	})

	return lights
}
