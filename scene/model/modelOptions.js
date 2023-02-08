async function getModelOptions(option) {
	const { default: store } = await import('../store')

	const defaultModel = 'human-mage/hellboy.glb'

	if (option === 'angel') {
		const modelPath = import.meta.env.PROD ? defaultModel : 'angel/princess/scene.gltf'

		const { default: angelCameraStates } = await import('./angel.json')
		store.setState({
			modelPath,
			cameraState: angelCameraStates,
		})
		return null
	}

	if (option === 'elf') {
		const modelPath = import.meta.env.PROD ? defaultModel : 'dark-elf/scene.glb'

		const { default: angelCameraStates } = await import('./angel.json')
		store.setState({
			modelPath,
			cameraState: angelCameraStates,
		})
		return null
	}

	if (option === 'human-mage') {
		const modelPath = import.meta.env.PROD ? defaultModel : 'human-mage/human-mage.glb'

		const { default: humanMageCameraStates } = await import('./human-mage.json')
		store.setState({
			modelPath,
			cameraState: humanMageCameraStates,
		})
		return null
	}

	return null
}

export default getModelOptions
