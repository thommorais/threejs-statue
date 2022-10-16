import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export async function createRenderer() {
    const { getDefaultSizes } = await import('./utils')
    const { width, height, pixelRatio } = getDefaultSizes()
    const {
        WebGLRenderer,
        PCFSoftShadowMap,
        sRGBEncoding,
        ACESFilmicToneMapping,
    } = await import('three')

    const renderer = new WebGLRenderer({
        powerPreference: 'high-performance',
        antialias: true,
        stencil: true,
        precision: true,
        // depth: true,
        canvas: document.querySelector('canvas.webgl'),
    })

    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = PCFSoftShadowMap
    renderer.physicallyCorrectLights = true
    renderer.outputEncoding = sRGBEncoding
    renderer.toneMapping = ACESFilmicToneMapping
    renderer.setSize(width, height)
    renderer.setPixelRatio(pixelRatio)
    renderer.setClearColor(0x181b1f, 1)

    return renderer
}

export async function createOrbitControls(camera, canvas) {
    const orbitControls = new OrbitControls(camera, canvas)
    orbitControls.enableDamping = true
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

    const { aspect } = getDefaultSizes()
    const camera = new PerspectiveCamera(45, aspect, 0.1, 30)
    // camera.position.x = 0
    // camera.position.y = 18
    // camera.position.z = 65

    camera.position.set(0, -1.25, 2.5)

    return camera
}

export async function createAmbientLight() {
    const { AmbientLight } = await import('three')

    const ambientLight = new AmbientLight(0xffffff)
    ambientLight.intensity = 0.5
    return ambientLight
}

export async function createDirectionalLight() {
    const { DirectionalLight } = await import('three')

    const directionalLight = new DirectionalLight(0xffffff, 0.25)
    directionalLight.position.set(-100, 0, 230)
    //Set up shadow properties for the light
    directionalLight.shadow.mapSize.width = 746 // default
    directionalLight.shadow.mapSize.height = 746 // default
    directionalLight.shadow.camera.near = 0.01 // default
    directionalLight.shadow.camera.far = 500 // default
    return directionalLight
}

export async function createHemisphereLight() {
    const { HemisphereLight } = await import('three')
    const hemisphereLight = new HemisphereLight(0xff0000, 0x0000ff, 1)
    return hemisphereLight
}

export async function createSpotLight() {
    const { SpotLight } = await import('three')

    const spotLight = new SpotLight(0xffff00, 2, 2, Math.PI * 0.1, 1, 1)
    spotLight.position.set(90, 4, 150)
    spotLight.shadow.bias = -0.001

    return spotLight
}

export async function createFireSparks() {
    const { BufferGeometry, ShaderMaterial, Points, BufferAttribute, Vector2, AdditiveBlending } =
        await import('three')

    const { default: vertexShader } = await import('./shaders/sparks_vertex.glsl')
    const { default: fragmentShader } = await import('./shaders/sparks_fragment.glsl')

    const geometry = new BufferGeometry()

    const N = 9999
    const vertices = new Float32Array(N)

    for (let count = 0; count < N; count += 3) {
        const theta = Math.random() * 2 * Math.PI
        const phi = Math.acos(1.5 * Math.random() - 1)
        const r = Math.pow(Math.random(), 0.33)
        const y = r * Math.sin(phi) * Math.cos(theta)
        const x = r * Math.sin(phi) * Math.sin(theta) + 0.2
        const z = r * Math.cos(phi)
        vertices.set([x, y, z], count)
    }

    geometry.setAttribute('position', new BufferAttribute(vertices, 3))

    const shaderMaterial = new ShaderMaterial({
        uniforms: {
            uTime: { value: 1.0 },
            uResolution: { value: new Vector2() },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: AdditiveBlending
        //https://threejs.org/docs/#api/en/constants/CustomBlendingEquations
    })

    const points = new Points(geometry, shaderMaterial)

    points.scale.set(15, 15, 15)

    return points
}

export default async function webglStuff() {
    const { getDefaultSizes } = await import('./utils')
    const { Clock } = await import('three')

    const renderer = await createRenderer()
    const scene = await createScene()
    const camera = await creatPerspectiveCamera()
    // const orbitControls = await createOrbitControls(camera, renderer.domElement)
    const ambientLight = await createAmbientLight()
    const directionalLight = await createDirectionalLight()

    // const hemisphereLight = await createHemisphereLight()
    // const spotLight = await createSpotLight()

    scene.add(ambientLight)
    scene.add(directionalLight)
    // scene.add(hemisphereLight)
    // scene.add(spotLight)

    const fireSparks = await createFireSparks()
    scene.add(fireSparks)


    renderer.render(scene, camera)
    const clock = new Clock()

    renderer.setAnimationLoop(() => {
        const time = clock.getElapsedTime()
        fireSparks.material.uniforms.uTime.value = time
        // orbitControls.update()
        renderer.render(scene, camera)
    })

    fireSparks.material.uniforms.uResolution.value.x = renderer.domElement.width
    fireSparks.material.uniforms.uResolution.value.y = renderer.domElement.height

    window.addEventListener('resize', () => {
        const { width, height } = getDefaultSizes()
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
        fireSparks.material.uniforms.uResolution.value.x = renderer.domElement.width
        fireSparks.material.uniforms.uResolution.value.y = renderer.domElement.height
    })

    return { renderer, scene, camera, directionalLight }
}
