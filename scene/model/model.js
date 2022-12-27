export default async function loadModel() {
	const [{ MeshStandardMaterial }, { DRACOLoader }, { GLTFLoader }, { modelStore }] = await Promise.all([
		import('three'),
		import('three/addons/loaders/DRACOLoader.js'),
		import('three/addons/loaders/GLTFLoader.js'),
		import('../store'),
	])

	const dracoLoader = new DRACOLoader()
	dracoLoader.setDecoderPath('/draco/')
	dracoLoader.preload()

	const loader = new GLTFLoader()
	loader.setDRACOLoader(dracoLoader)

	const { modelPath } = modelStore.getState()

	return new Promise((resolve, reject) => {
		loader.load(
			modelPath,
			(gltf) => {
				const boxMaterial = new MeshStandardMaterial({
					roughness: 0.5759493670886077,
					metalness: 0.8797468354430373,
				})
				const box = gltf.scene

				box.traverse((child) => {
					if (child.isMesh) {
						child.material = boxMaterial
					}

					child.castShadow = true
					child.receiveShadow = true
				})

				resolve(box)
			},
			// called while loading is progressing
			function (xhr) {
				const modelLoadingProgress = Math.round((xhr.loaded / xhr.total) * 100)
				modelStore.setState({ modelLoadingProgress })
			},
			(e) => reject(e),
		)
	})
}
