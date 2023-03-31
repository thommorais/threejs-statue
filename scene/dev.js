import { Vector3, SpotLightHelper, Quaternion } from 'three'


import { getProject, types } from '@theatre/core'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import getModel from './model'
import CreateLights from './lights'


async function theatre(lights, model, camera, store) {

	const { default: studio } = await import('@theatre/studio')

	const { cameraPositions, characterClass } = store.getState()

	studio.initialize()
	// studio.ui.hide(false)

	// Create a sheet
	const sheet = getProject('FAS', { state: cameraPositions }).sheet('camera')

	const [leftLight, topLight, rightLight, one] = lights

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
		{
			name: 'one',
			light: one,
		},
	]

	function rgbToHex(rgb) {
		return (
			'#' +
			('0' + Math.round(rgb[0] * 255).toString(16)).slice(-2) +
			('0' + Math.round(rgb[1] * 255).toString(16)).slice(-2) +
			('0' + Math.round(rgb[2] * 255).toString(16)).slice(-2)
		)
	}

	// lightSheets.forEach(({ name, light }) => {
	// 	const leftObj = sheet.object(name, {
	// 		position: types.compound({
	// 			x: types.number(light.position.x, { range: [-500, 500] }),
	// 			y: types.number(light.position.y, { range: [-500, 500] }),
	// 			z: types.number(light.position.z, { range: [-500, 500] }),
	// 		}),
	// 		intensity: types.number(light.intensity, { range: [0, 5000] }),
	// 		penumbra: types.number(light.penumbra, { range: [0, 1] }),
	// 		angle: types.number(light.angle, { range: [Math.PI / 3, Math.PI / 2] }),
	// 		power: types.number(light.power, { range: [0, 1200] }),
	// 		color: types.rgba({ r: light.color.r, g: light.color.g, b: light.color.b, a: 1 }),
	// 	})

	// 	leftObj.onValuesChange((values) => {
	// 		const { x, y, z } = values.position
	// 		light.position.set(x, y, z)
	// 		light.intensity = values.intensity
	// 		light.angle = values.angle
	// 		light.penumbra = values.penumbra
	// 		light.color.set(rgbToHex([values.color.r, values.color.g, values.color.b]))
	// 	})
	// })

	// const modelObj = sheet.object('model', {
	// 	metalness: types.number(model.children[0].material.metalness, { range: [0, 1] }),
	// 	roughness: types.number(model.children[0].material.roughness, { range: [0, 1] }),
	// })

	// modelObj.onValuesChange((values) => {
	// 	model.children[0].material.metalness = values.metalness
	// 	model.children[0].material.roughness = values.roughness
	// })

	const cameraObj = sheet.object('Camera', {
		position: types.compound({ ...camera.position }),
		lookAt: types.compound({ x: 0, y: 0, z: 0 }),
		rotateZ: types.number(-0, { range: [-10, 10] }),
	})

	cameraObj.onValuesChange((values) => {
		camera.position.set(values.position.x, values.position.y, values.position.z)

		console.log(sheet.sequence.position)

		const { x, y, z } = values.lookAt
		camera.lookAt(new Vector3(x, y, z))

		if (values.rotateZ !== -0.000) {
			camera.rotation.z = values.rotateZ;
		  }

	})

}


export default class DevMode {

	constructor(store, { camera, scene }, { characterPath, cameraPositionsPath, characterClass }) {

		store.setState({ characterClass });

		getModel(characterPath, store).then(async (model) => {
			fetch(cameraPositionsPath)
				.then((response) => response.json())
				.then(async (cameraPositions) => {
					store.setState({ cameraPositions })
					const lights = new CreateLights(store, scene, characterClass);
					await theatre(lights.lights, model, camera, store)

					// lights.forEach((light) => {
					// 	const spotLightHelper = new SpotLightHelper(light)
					// 	scene.add(spotLightHelper)
					// 	const s = () =>
					// 		requestAnimationFrame(() => {
					// 			spotLightHelper.update()
					// 			s()
					// 		})
					// 	s()
					// })

					scene.add(model)

					for (const light of lights.lights) {
						scene.add(light)
					}
					scene.add(model)
				})

		})

		console.log('dev mode')
		// return this.createOrbitControl(stage.camera, stage.renderer)
	}

	createOrbitControl(camera, renderer) {
		const orbitControls = new OrbitControls(camera, renderer.domElement);
		orbitControls.enableDamping = true;
		orbitControls.enablePan = true;
		return orbitControls;
	}

}

