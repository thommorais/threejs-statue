async function getModelOptions(option) {
	const { default: store } = await import('../store')

	if (!['human-mage', 'angel', 'barbarian'].includes(option)) {
		return null
	}

	const modelPath = import.meta.env.PROD ? 'hellboy.glb' : `${option}/scene.glb`

	const { default: humanMageCameraStates } = await import(`./${option}/camera.json`)
	store.setState({
		modelPath,
		cameraState: humanMageCameraStates,
	})


	return null
}

export default getModelOptions
