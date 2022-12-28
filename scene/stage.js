export async function createRenderer() {
	const { getDefaultSizes } = await import('./utils')
	const { width, height, pixelRatio } = getDefaultSizes()
	const { WebGLRenderer, PCFSoftShadowMap, sRGBEncoding, ACESFilmicToneMapping } = await import('three')

	const canvas = document.querySelector('.webgl')

	const renderer = new WebGLRenderer({
		powerPreference: 'high-performance',
		antialias: true,
		stencil: true,
		canvas,
		depth: true,
	})

	renderer.shadowMap.enabled = true
	renderer.shadowMap.type = PCFSoftShadowMap
	renderer.physicallyCorrectLights = true
	renderer.outputEncoding = sRGBEncoding
	renderer.toneMapping = ACESFilmicToneMapping
	renderer.toneMappingExposure = 1.25
	// renderer.logarithmicDepthBuffer = true
	renderer.setSize(width, height)
	renderer.setPixelRatio(pixelRatio)

	return renderer
}

export async function createOrbitControl(camera, renderer) {
	const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls')

	const orbitControls = new OrbitControls(camera, renderer.domElement)
	orbitControls.enableDamping = true
	orbitControls.enablePan = true
	return orbitControls
}

export async function createScene() {
	const { Scene, Color } = await import('three')
	const scene = new Scene()
	scene.background = new Color('#100C0D')
	return scene
}

export async function creatPerspectiveCamera() {
	const { PerspectiveCamera } = await import('three')
	const { getDefaultSizes } = await import('./utils')

	const { width, height } = getDefaultSizes()
	const camera = new PerspectiveCamera(45, width / height, 0.01, 1000)
	camera.focus = 0
	return camera
}

export default async function webglStuff() {
	const { getDefaultSizes } = await import('./utils')

	const renderer = await createRenderer()
	const scene = await createScene()
	const camera = await creatPerspectiveCamera()

	const renderFunc = () => renderer.render(scene, camera)
	// const controls = await createOrbitControl(camera, renderer)

	renderer.setAnimationLoop(() => {
		renderFunc()
		// controls.update()
		camera.updateProjectionMatrix()
	})

	window.addEventListener('resize', () => {
		const { width, height } = getDefaultSizes()
		camera.aspect = width / height
		camera.updateProjectionMatrix()
		renderer.setSize(width, height)
	})

	return { renderer, renderFunc, scene, camera }
}
