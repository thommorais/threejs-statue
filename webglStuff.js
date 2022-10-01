import {
    WebGLRenderer,
    PCFSoftShadowMap,
    sRGBEncoding,
    ACESFilmicToneMapping,
    Scene,
    PerspectiveCamera,
    AmbientLight,
    DirectionalLight,
    HemisphereLight,
    SpotLight,
} from 'three'

import { getDefaultSizes } from './utils'


import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'


export function createRenderer() {
    const { width, height, pixelRatio } = getDefaultSizes()

    const renderer = new WebGLRenderer({
        powerPreference: 'high-performance',
        antialias: true,
        stencil: true,
        precision: true,
        // depth: false,
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

export function createOrbitControls(camera, canvas) {
    const orbitControls = new OrbitControls(camera, canvas)
    orbitControls.enableDamping = true
    return orbitControls
}

export function createScene() {
    const scene = new Scene()
    return scene
}

export function creatPerspectiveCamera() {
    const { aspect } = getDefaultSizes()
    const camera = new PerspectiveCamera(45, aspect, 0.01, 1000)
    return camera
}

export function createAmbientLight() {
    const ambientLight = new AmbientLight(0xffffff)
    ambientLight.intensity = 0.5
    return ambientLight
}

export function createDirectionalLight() {
    const directionalLight = new DirectionalLight(0xffffff, 1)
    directionalLight.position.set(-100, 0, 230)
    //Set up shadow properties for the light
    directionalLight.shadow.mapSize.width = 746 // default
    directionalLight.shadow.mapSize.height = 746 // default
    directionalLight.shadow.camera.near = 0.01 // default
    directionalLight.shadow.camera.far = 500 // default
    return directionalLight
}

export function createHemisphereLight() {
    const hemisphereLight = new HemisphereLight(0xff0000, 0x0000ff, 1)
    return hemisphereLight
}

export function createSpotLight() {
    const spotLight = new SpotLight(0xffff00, 2, 2, Math.PI * 0.1, 1, 1)
    spotLight.position.set(90, 4, 150)
    spotLight.shadow.bias = -0.001;

    return spotLight
}

export default function webglStuff() {
    const renderer = createRenderer()
    const scene = createScene()
    const camera = creatPerspectiveCamera()
    const orbitControls = createOrbitControls(camera, renderer.domElement)
    const ambientLight = createAmbientLight()
    const directionalLight = createDirectionalLight()

    // const hemisphereLight = createHemisphereLight()
    const spotLight = createSpotLight()

    scene.add(ambientLight)
    scene.add(directionalLight)
    // scene.add(hemisphereLight)
    // scene.add(spotLight)


    renderer.render(scene, camera)

    renderer.setAnimationLoop(() => {
        orbitControls.update()
        renderer.render(scene, camera)
    })

    window.addEventListener('resize', () => {
        const { width, height } = getDefaultSizes()
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
    })

    return { renderer, scene, camera, directionalLight }
}
