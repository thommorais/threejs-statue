async function createCube() {
    const { MeshStandardMaterial, PlaneGeometry, Mesh } = await import('three')
    const boxGeometry = new PlaneGeometry(4, 4, 1)

    const planeMat = new MeshStandardMaterial({
        roughness: 0.7,
        color: 0xffffff,
        bumpScale: 0.002,
        metalness: 0.2,
    })

    const plane = new Mesh(boxGeometry, planeMat)

    return plane
}

async function scene() {
    const { default: webglStuff } = await import('./webgl')
    const { scene, camera } = await webglStuff()

    const { default: handleModel } = await import('./model')
    const model = await handleModel()
    scene.add(model)

    // camera.position.z = 150
    // camera.lookAt(plane.position)

    if (process.env.NODE_ENV === 'development') {
        const { default: stats } = await import('./stats')
        await stats()
        const { default: theater } = await import('./theater')

        const { CameraHelper } = await import('three')
        const cameraHelper = new CameraHelper(camera)
        scene.add(cameraHelper)

        await theater({ camera, cameraHelper })
    }

    const { Clock, AxesHelper } = await import('three')
    const clock = new Clock()

    scene.add(new AxesHelper(200))

    function animate() {
        const delta = clock.getDelta()
        requestAnimationFrame(animate)

    }

    animate()
}

export default scene