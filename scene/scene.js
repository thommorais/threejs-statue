async function scene({ character, selector }) {
	const [{ default: stage }, { default: handleModel }, { default: scroll }, { default: createLights }] =
		await Promise.all([import('./stage'), import('./model'), import('./scroll'), import('./lights')])

	const { scene, camera } = await stage()
	const model = await handleModel(character)
	scene.add(model)

	camera.position.z = 120

	// const theaterAPI = await scroll(camera, character.cameraState, { selector })

	const lights = await createLights(scene, model)

	if (process.env.NODE_ENV === 'development' && true) {
		const { default: dev } = await import('./dev')
		dev(scene, camera, lights, model)
	}

	return {}
}

export default scene
