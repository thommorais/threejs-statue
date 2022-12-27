async function scene({ sectionSelectors, scrollSelector, character, onModelLoading }) {
	const [
		{ default: stage },
		{ default: handleModel },
		{ default: scroll },
		{ default: createLights },
		{ default: getModelOption },
		{ default: store },
		{ default: sparks },
	] = await Promise.all([
		import('./stage'),
		import('./model/model'),
		import('./scroll'),
		import('./lights'),
		import('./model/modelOptions'),
		import('./store'),
		import('./sparks'),
	])

	store.subscribe(onModelLoading, 'modelLoadingProgress')

	await getModelOption(character)

	const { scene, camera, renderer } = await stage()

	const model = await handleModel(character)
	scene.add(model)

	const lights = await createLights(scene, model)

	if (true) {
		const { default: dev } = await import('./dev')
		await dev(scene, camera, lights, model)
	} else {
		await scroll(camera, { sectionSelectors, scrollSelector })
	}

	// await sparks(scene, renderer)

	return {
		lockScroll: () => store.lockScroll(true),
		unlockScrol: () => store.lockScroll(false),
		subscribe: store.subscribe,
	}
}

export default scene
