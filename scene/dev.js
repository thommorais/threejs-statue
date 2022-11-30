async function dev(scene, camera, lights, model) {
	if (process.env.NODE_ENV === 'development' && true) {
		const { default: theatre } = await import('./theatre')
		await theatre(lights, model, camera)

		const { default: stats } = await import('./stats')
		await stats()

		const { SpotLightHelper } = await import('three')

		lights.forEach((light) => {
			const spotLightHelper = new SpotLightHelper(light)
			scene.add(spotLightHelper)
			const s = () =>
				requestAnimationFrame(() => {
					spotLightHelper.update()
					s()
				})
			s()
		})
	}
}

export default dev
