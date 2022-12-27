export default async function createLights(scene, model) {
	const { HemisphereLight, SpotLight } = await import('three')

	const hemiLight = new HemisphereLight(0xffffff, 0x444444, 0.85)
	// scene.add(hemiLight)

	const leftSpotLight = new SpotLight(0xc9bbff, 1)
	leftSpotLight.position.set(-101.2658227848101, 8.354430379746859, 26.012658227848178)
	leftSpotLight.intensity = 3892.4050632911462
	leftSpotLight.angle = 1.369
	leftSpotLight.penumbra = 1
	leftSpotLight.distance = 150

	const topSpotLight = new SpotLight(0xff3d0c, 1)
	topSpotLight.distance = 200
	topSpotLight.position.set(21.392405063291143, 71.50632911392405, 5.25)
	topSpotLight.intensity = 1991.1392405063295
	topSpotLight.angle = 1.3686474324183395
	topSpotLight.penumbra = 0.76
	topSpotLight.distance = 150

	const rightSpotLight = new SpotLight(0xff0633, 1)
	rightSpotLight.distance = 400
	rightSpotLight.position.set(63.20253164556962, 17.613924050632917, 14.556962025316466)
	rightSpotLight.intensity = 1016.4556962025315
	rightSpotLight.angle = 1.575
	rightSpotLight.penumbra = 1
	rightSpotLight.distance = 150

	const extraSpotLight = new SpotLight(0xc9bbff, 1)
	rightSpotLight.distance = 400
	rightSpotLight.position.set(0, 0, 45)
	rightSpotLight.intensity = 317.4556962025316
	rightSpotLight.angle = 1.047
	rightSpotLight.penumbra = 1
	rightSpotLight.distance = 150

	// const extraLights = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']

	// const extras = extraLights.map(() => new SpotLight(0xffffff, 1))

	const lights = [leftSpotLight, topSpotLight, rightSpotLight, extraSpotLight]

	const allLights = [...lights]

	allLights.forEach((spotLight) => {
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

	return [...lights]
}
