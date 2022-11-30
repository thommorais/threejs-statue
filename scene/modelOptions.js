async function getModelOptions(option) {
	if (option === 'angel') {
		const { default: angelCameraStates } = await import('./angel.json')
		return {
			path: 'angel/scene.glb',
			cameraState: angelCameraStates,
		}
	}

	return null
}

export default getModelOptions
