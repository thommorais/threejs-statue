async function cameraOnScroll(camera) {
	const [{ Vector3 }, { getProject, types }] = await Promise.all([import('three'), import('@theatre/core')])
	const { default: store } = await import('../store')

	const { cameraState } = store.getState()

	const project = getProject('lights', { state: cameraState })
	const sheet = project.sheet('lights')

	const cameraObj = sheet.object('Camera', {
		position: types.compound({
			...camera.position,
		}),
		lookAt: types.compound({
			x: 0,
			y: 0,
			z: 0,
		}),
	})

	cameraObj.onValuesChange((values) => {
		camera.position.set(values.position.x, values.position.y, values.position.z)
		const { x, y, z } = values.lookAt
		camera.lookAt(new Vector3(x, y, z))
		camera.updateProjectionMatrix()
	})

	function onBodyScroll() {
		const scrollState = store.getState()
		const direction = scrollState.direction
		const normal = direction === 'normal'
		const from = normal ? scrollState.current - 1 : scrollState.current
		const to = normal ? scrollState.current : scrollState.current + 1
		sheet.sequence.play({ range: [from, to], direction })
	}

	store.subscribe(onBodyScroll, 'current')

	return onBodyScroll
}

export default cameraOnScroll
