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

	return null
}

export default getModelOptions
