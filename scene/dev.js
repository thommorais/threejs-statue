async function dev(scene, camera) {
	if (process.env.NODE_ENV === 'development' && true) {
		const { default: stats } = await import('./stats')
		await stats()

		const { CameraHelper } = await import('three')
		const cameraHelper = new CameraHelper(camera)

		scene.add(cameraHelper)

		const { AxesHelper } = await import('three')
		scene.add(new AxesHelper(200))
	}
}

export default dev
