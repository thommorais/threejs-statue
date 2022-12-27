async function theatre(lights, model, camera, points) {
	const { getProject, types } = await import('@theatre/core')
	const { default: studio } = await import('@theatre/studio')
	const { Vector3 } = await import('three')

	const { default: store } = await import('./store')

	const { cameraState } = store.getState()

	studio.initialize()

	// Create a sheet
	const sheet = getProject('lights').sheet('lights')

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
			x: types.number(camera.position.x, { range: [-100, 100] }),
			y: types.number(camera.position.y, { range: [-100, 100] }),
			z: types.number(camera.position.z, { range: [-100, 100] }),
		}),
		lookAt: types.compound({
			x: types.number(camera.position.x, { range: [-100, 100] }),
			y: types.number(camera.position.y, { range: [-100, 100] }),
			z: types.number(camera.position.z, { range: [-100, 100] }),
		}),
	})

	cameraObj.onValuesChange((values) => {
		camera.position.set(values.position.x, values.position.y, values.position.z)
		const { x, y, z } = values.lookAt
		camera.lookAt(new Vector3(x, y, z))
		console.log(x, y, z)
		camera.updateProjectionMatrix()
	})

	// points.forEach((valu) => {
	// 	const [name, obj] = Object.entries(valu)[0]
	// 	const leftObj = sheet.object(`Points ${name}`, {
	// 		position: types.compound({
	// 			x: types.number(obj.position.x, { range: [-150, 150] }),
	// 			y: types.number(obj.position.y, { range: [-150, 150] }),
	// 			z: types.number(obj.position.z, { range: [-150, 100] }),
	// 		}),

	// 		rotation: types.compound({
	// 			x: types.number(obj.rotation.x, { range: [-2, 2] }),
	// 			y: types.number(obj.rotation.y, { range: [-2, 2] }),
	// 			z: types.number(obj.rotation.z, { range: [-2, 2] }),
	// 		}),
	// 	})

	// 	leftObj.onValuesChange((values) => {
	// 		const { x, y, z } = values.position
	// 		obj.position.set(x, y, z)
	// 		const rotation = values.rotation
	// 		obj.rotation.set(rotation.x * Math.PI, rotation.y * Math.PI, rotation.z * Math.PI)
	// 	})
	// })
}

async function createPoints(scene, pos) {
	const { PlaneGeometry, MeshPhongMaterial, Mesh, FlatShading } = await import('three')

	const geometry = new PlaneGeometry(1, 1)

	const material = new MeshPhongMaterial({
		color: 0xffffff,
		shading: FlatShading,
	})

	const mesh = new Mesh(geometry, material)
	mesh.position.x = pos.x
	mesh.position.y = pos.y
	mesh.position.z = pos.z
	// scene.add(mesh)

	return mesh
}

async function dev(scene, camera, lights, model) {
	if (process.env.NODE_ENV === 'development' && true) {
		// camera.position.set(0, 20, 90)

		const chest = await createPoints(scene, { x: 2.5, y: 17, z: 3.5 })

		const face = await createPoints(scene, { x: -0.75, y: 31, z: 4.1 })
		const aside = await createPoints(scene, { x: 10, y: 28, z: 5 })
		aside.material.color.setHex(0xff0000)

		const half_face = await createPoints(scene, { x: 6.25, y: 32, z: -3 })
		const hand = await createPoints(scene, { x: 15, y: 16, z: 8 })
		const belt = await createPoints(scene, { x: -0.75, y: 11, z: 5 })
		const footer = await createPoints(scene, { x: -17.25, y: -27.5, z: 4.75 })

		await theatre(lights, model, camera, [
			{ face },
			{ aside },
			{ half_face },
			{ hand },
			{ belt },
			{ footer },
			{ chest },
		])

		const { default: stats } = await import('./stats')
		await stats()

		const { SpotLightHelper } = await import('three')

		lights.forEach((light) => {
			const spotLightHelper = new SpotLightHelper(light)
			scene.add(spotLightHelper)
			// const s = () =>
			// 	requestAnimationFrame(() => {
			// 		spotLightHelper.update()
			// 		s()
			// 	})
			// s()
		})
	}
}

export default dev
