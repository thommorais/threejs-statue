async function getModelOptions(option) {
	const { default: store } = await import('../store')

	if (option === 'angel') {
		const { default: angelCameraStates } = await import('./angel.json')
		store.setState({
			modelPath: 'angel/angel.glb',
			cameraState: angelCameraStates,
		})
		return null
	}

	if (option === 'elf') {
		const { default: angelCameraStates } = await import('./angel.json')
		store.setState({
			modelPath: 'dark-elf/scene.glb',
			cameraState: angelCameraStates,
		})
		return null
	}

	if (option === 'human-mage') {
		const { default: humanMageCameraStates } = await import('./human-mage.json')
		store.setState({
			modelPath: 'human-mage/scene.glb',
			cameraState: humanMageCameraStates,
		})
		return null
	}

	return null
}

export default getModelOptions
