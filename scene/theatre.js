export default async function theatre(lights, model, camera) {
	const { getProject, types } = await import('@theatre/core')
	const { default: studio } = await import('@theatre/studio')
	const { Vector3 } = await import('three')

	studio.initialize()

	const project = getProject('lights')
	// Create a sheet
	const sheet = project.sheet('lights')

	const [leftLight, topLight, rightLight] = lights

	const lightSheets = [
		{
			name: 'left',
			light: leftLight,
		},
		{
			name: 'top',
			light: topLight,
		},
		{
			name: 'right',
			light: rightLight,
		},
	]

	lightSheets.forEach(({ name, light }) => {
		const leftObj = sheet.object(name, {
			position: types.compound({
				x: types.number(light.position.x, { range: [-150, 150] }),
				y: types.number(light.position.y, { range: [-150, 150] }),
				z: types.number(light.position.z, { range: [-150, 100] }),
			}),
			intensity: types.number(light.intensity, { range: [0, 50] }),
			penumbra: types.number(light.penumbra, { range: [0, 1] }),
			angle: types.number(light.angle, { range: [Math.PI / 3, Math.PI / 2] }),
			power: types.number(light.power, { range: [0, 120] }),
		})

		leftObj.onValuesChange((values) => {
			const { x, y, z } = values.position
			light.position.set(x, y, z)
			light.intensity = values.intensity
			light.angle = values.angle
			light.penumbra = values.penumbra
		})
	})

	const modelObj = sheet.object('model', {
		metalness: types.number(model.children[0].material.metalness, { range: [0, 1] }),
		roughness: types.number(model.children[0].material.roughness, { range: [0, 1] }),
	})

	modelObj.onValuesChange((values) => {
		model.children[0].material.metalness = values.metalness
		model.children[0].material.roughness = values.roughness
	})

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
}
