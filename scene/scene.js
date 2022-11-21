async function scene() {
	const [{ default: webglStuff }, { default: handleModel }, { default: theater }] = await Promise.all([
		import('./webgl'),
		import('./model'),
		import('./theater'),
	])

	const { scene, camera } = await webglStuff()
	const theaterAPI = await theater({ camera })

	const model = await handleModel()
	scene.add(model)

	if (process.env.NODE_ENV === 'development' && true) {
		const { default: dev } = await import('./dev')
		dev(scene, camera)
	}

	return theaterAPI
}

export default scene
