export default async function loadModel(modelOption) {
	const { MeshStandardMaterial } = await import('three')
	const { DRACOLoader } = await import('three/addons/loaders/DRACOLoader.js')
	const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js')
	const { modelStore } = await import('../store')

	const dracoLoader = new DRACOLoader()
	dracoLoader.setDecoderPath('/draco/')
	dracoLoader.preload()

	const loader = new GLTFLoader()
	loader.setDRACOLoader(dracoLoader)

	return new Promise((resolve, reject) => {
		loader.load(
			modelOption.path,
			(gltf) => {
				const boxMaterial = new MeshStandardMaterial({
					roughness: 0.5,
					metalness: 0.65,
					color: 0xffffff,
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
