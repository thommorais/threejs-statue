
async function scene({ sectionSelectors, scrollSelector, character, onModelLoading }) {
	const [
		{ default: stage },
		{ default: handleModel },
		{ default: scroll },
		{ default: createLights },
		{ default: getModelOption },
		{ default: store },
		{ default: sparks },
		{ default: background },
	] = await Promise.all([
		import('./stage'),
		import('./model/model'),
		import('./scroll'),
		import('./lights'),
		import('./model/modelOptions'),
		import('./store'),
		import('./sparks'),
		import('./background'),
	])

	store.subscribe(onModelLoading, 'modelLoadingProgress')

	await getModelOption(character)

	const { scene, camera, renderer, renderFunc } = await stage()



	const model = await handleModel(character)
	const lights = await createLights(scene, model)

	if (true) {
		const { default: dev } = await import('./dev')
		await dev(scene, camera, lights, model)
	} else {
		await scroll(camera, { sectionSelectors, scrollSelector })
	}


	const backgroundLoop = await background(scene, renderer)
	const sparksLoop = await sparks(scene, renderer, 125)
	scene.add(model)

	const { default: stats } = await import('./stats')
	const updateStats = await stats()


	renderer.setAnimationLoop(() => {
		camera.updateProjectionMatrix()
		renderFunc()
		sparksLoop()
		backgroundLoop()
		updateStats()
		// controls.update()
	})




	console.log(renderer.info)

	return {
		lockScroll: () => store.lockScroll(true),
		unlockScrol: () => store.lockScroll(false),
		subscribe: store.subscribe,
	}
}

export default scene
