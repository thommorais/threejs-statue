async function getModelOptions(option) {
	const { default: store } = await import('../store')

	if (!['human-mage', 'angel', 'barbarian'].includes(option)) {
		return null
	}

	// const modelPath = import.meta.env.PROD ? 'hellboy.glb' : `${option}/scene-1.glb`
	const modelPath = `${option}/scene-1.glb`

	const { default: cameraStates } = await import(`./${option}/camera.json`)

	store.setState({
		modelPath,
		cameraState: cameraStates,
	})


	return null
}

export default getModelOptions
