async function scene({ sectionSelectors, scrollSelector, character, onModelLoading }) {
	const [
		{ default: stage },
		{ default: handleModel },
		{ default: scroll },
		{ default: createLights },
		{ default: getModelOption },
		{ default: store },
	] = await Promise.all([
		import('./stage'),
		import('./model/model'),
		import('./scroll'),
		import('./lights'),
		import('./model/modelOptions'),
		import('./store'),
	])

	store.subscribe(onModelLoading, 'modelLoadingProgress')
	console.log('modelLoadingProgress')
	await getModelOption(character)

	const { scene, camera } = await stage()
	const model = await handleModel(character)
	scene.add(model)

	await scroll(camera, { sectionSelectors, scrollSelector })

	const lights = await createLights(scene, model)

	if (process.env.NODE_ENV === 'development' && true) {
		const { default: dev } = await import('./dev')
		await dev(scene, camera, lights, model)
	}

	return {
		lockScroll: () => store.lockScroll(true),
		unlockScrol: () => store.lockScroll(false),
		subscribe: store.subscribe,
	}
}

export default scene
