async function getModelOptions(option) {
	const { default: store } = await import('../store')

	if (option === 'angel') {
		const { default: angelCameraStates } = await import('./angel.json')
		store.setState({
			modelPath: 'angel/scene.glb',
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
		const { default: angelCameraStates } = await import('./human-mage.json')
		store.setState({
			modelPath: 'human-mage/scene.glb',
			cameraState: angelCameraStates,
		})
		return null
	}

	return null
}

export default getModelOptions
