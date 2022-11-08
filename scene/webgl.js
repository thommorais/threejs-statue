
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
    renderer.toneMappingExposure = 1.0
    renderer.logarithmicDepthBuffer = true
    renderer.setSize(width, height)
    renderer.setPixelRatio(pixelRatio)
    renderer.setClearColor(0x181b1f, 1)

    return renderer
}

export async function createOrbitControls(camera, canvas) {
    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')

    const orbitControls = new OrbitControls(camera, canvas)
    orbitControls.enableDamping = true
    orbitControls.enableZoom = false
    orbitControls.enablePan = false
    orbitControls.maxPolarAngle = Math.PI / 1.9
    orbitControls.minPolarAngle = Math.PI / 3
    return orbitControls
}

export async function createScene() {
    const { Scene } = await import('three')
    const scene = new Scene()
    return scene
}

export async function creatPerspectiveCamera() {
    const { PerspectiveCamera } = await import('three')
    const { getDefaultSizes } = await import('./utils')

    const { width, height } = getDefaultSizes()
    const camera = new PerspectiveCamera(45, width / height, 0.01, 450)
    camera.focus = 0

    camera.position.set(0, 0, 120)
    return camera
}

export async function createAmbientLight() {
    const { AmbientLight } = await import('three')

    const ambientLight = new AmbientLight(0xffffff)
    ambientLight.intensity = 1

    return ambientLight
}

export async function createDirectionalLight() {
    const { DirectionalLight } = await import('three')

    const dirLight = new DirectionalLight(0xaaaaaa, 7.5)
    dirLight.position.set(0, 0, 12)
    // Set up shadow properties for the light
    dirLight.castShadow = true
    dirLight.shadow.camera.top = 10
    dirLight.shadow.camera.bottom = -10
    dirLight.shadow.camera.left = -10
    dirLight.shadow.camera.right = 10
    dirLight.shadow.camera.near = 10
    dirLight.shadow.camera.far = 40
    dirLight.shadow.radius = 4
    dirLight.shadow.bias = -0.0005
    dirLight.shadow.normalBias = 0.75
    dirLight.shadow.mapSize.setScalar(720)

    return dirLight
}

export async function createHemisphereLight() {
    const { HemisphereLight } = await import('three')
    const hemisphereLight = new HemisphereLight(0xffffff, 0x262626, 1)
    return hemisphereLight
}

export async function createSpotLight() {
    const { SpotLight } = await import('three')

    const spotLight = new SpotLight(0x0000ff, 3)
    // spotLight.position.set(0, 0, 4)
    spotLight.shadow.bias = -0.001

    spotLight.position.set(2.5, -2, -5)
    spotLight.angle = Math.PI / 6
    spotLight.penumbra = 1
    spotLight.decay = 2
    spotLight.distance = 10
    spotLight.castShadow = true

    return spotLight
}

export async function createPlane() {
    const { PlaneGeometry, ShadowMaterial, Mesh } = await import('three')

    const geometry = new PlaneGeometry(80, 80)
    geometry.rotateX(-Math.PI * 0.5)

    const material = new ShadowMaterial({ opacity: 0.1, depthWrite: false, transparent: true })
    const plane = new Mesh(geometry, material)

    plane.position.y = -8.48
    // plane.renderOrder = 0
    plane.receiveShadow = true
    return plane
}


async function lights() {
    // const { DirectionalLightHelper } = await import('three')
    const ambientLight = await createAmbientLight()
    const directionalLight = await createDirectionalLight()
    const hemisphereLight = await createHemisphereLight()
    // const spotLight = await createSpotLight()

    return { ambientLight, directionalLight, hemisphereLight }
}

export default async function webglStuff() {
    const { getDefaultSizes } = await import('./utils')

    const renderer = await createRenderer()
    const scene = await createScene()
    const camera = await creatPerspectiveCamera()
    // const orbitControls = await createOrbitControls(camera, renderer.domElement)


    const { ambientLight, directionalLight, hemisphereLight } = await lights()

    scene.add(ambientLight)
    scene.add(directionalLight)
    scene.add(hemisphereLight)

    const renderFunc = () => renderer.render(scene, camera)

    renderer.setAnimationLoop(() => {
        // orbitControls.update()
        renderFunc()
    })

    window.addEventListener('resize', () => {
        const { width, height } = getDefaultSizes()
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
    })

    return { renderer, renderFunc, scene, camera, ambientLight, directionalLight }
}
