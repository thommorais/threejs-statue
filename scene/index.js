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

	const { scene, camera, renderer } = await stage()

	const model = await handleModel(character)
	scene.add(model)
	const lights = await createLights(scene, model)

	if (false) {
		const { default: dev } = await import('./dev')
		await dev(scene, camera, lights, model)
	} else {
		await scroll(camera, { sectionSelectors, scrollSelector })
	}

	const pixelRatio = renderer.getPixelRatio()

	if (pixelRatio === 1) {
		await background(scene)
	}

	await sparks(scene, renderer, 2000 / pixelRatio)

	return {
		lockScroll: () => store.lockScroll(true),
		unlockScrol: () => store.lockScroll(false),
		subscribe: store.subscribe,
	}
}

export default scene
