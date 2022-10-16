async function addTheModel() {
    const {
        default: loadModel,
        resizeModel,
        getModelCenterAndSize,
    } = await import('./model')
    const model = await loadModel()
    const { center, size } = await getModelCenterAndSize(model)
    const newScale = resizeModel(size)
    model.scale.set(newScale.x, newScale.y, newScale.z)

    model.position.set(-center.x / 10, newScale.y * -1, center.z / 4)

    return model
}

async function scene() {
    const { RectAreaLight, Vector3, Clock, CameraHelper } = await import('three')
    const { RectAreaLightHelper } = await import(
        'three/examples/jsm/helpers/RectAreaLightHelper.js'
    )


    const lookAtMe = new Vector3()

    const { default: webglStuff } = await import('./webglStuff')

    const { scene, camera } = await webglStuff()

    const model = await addTheModel()
    scene.add(model)

    const tealLight = new RectAreaLight(0x008Ba0, 30, 30, 20)
    tealLight.position.set(15, 15, 30)
    scene.add(tealLight)

    const orangeLight = new RectAreaLight(0xFF3300, 30, 30, 20)
    orangeLight.position.set(-45, -15, 30)

    scene.add(orangeLight)

    scene.add(new RectAreaLightHelper(tealLight))
    scene.add(new RectAreaLightHelper(orangeLight))


    const cameraHelper = new CameraHelper(camera)
    camera.position.set(0, -1.25, 2.5)
    scene.add(cameraHelper)

    cameraHelper.visible = true

    const clock = new Clock()

    let pause = true

    function loop() {
        const time = clock.getElapsedTime()
        const angle = time * 0.5
        const distance = 30

        // orangeLight.position.y = Math.cos(angle) * distance * -1
        // orangeLight.position.x = Math.cos(angle) * distance * -1
        // orangeLight.position.z = Math.sin(angle) * distance * -1

        // tealLight.position.y = Math.cos(angle) * distance
        // tealLight.position.x = Math.cos(angle) * distance
        // tealLight.position.z = Math.sin(angle) * distance

        // console.log(tealLight.position)

        if (pause === false) {
            camera.position.x = Math.cos(angle) * 5.5
            camera.position.z = Math.sin(angle) * 5
            camera.lookAt(reset.position)
        }

        tealLight.lookAt(lookAtMe)
        orangeLight.lookAt(lookAtMe)

        cameraHelper.update()

        requestAnimationFrame(loop)
    }
    loop()

    const { getProject, types } = await import('@theatre/core')
    const { default: studio } = await import('@theatre/studio')

    studio.initialize()

    const project = getProject('fas')
    const sheet = project.sheet('objectos')

    const modelObj = sheet.object('model', {
        rotation: types.compound({
            x: types.number(model.rotation.x, { range: [-2, 2] }),
            y: types.number(model.rotation.y, { range: [-2, 2] }),
            z: types.number(model.rotation.z, { range: [-2, 2] }),
        }),
    })

    modelObj.onValuesChange((values) => {
        const { x, y, z } = values.rotation
        model.rotation.set(x * Math.PI, y * Math.PI, z * Math.PI)
    })

    const cameraObj = sheet.object('camera', {
        position: types.compound({
            x: types.number(camera.position.x, { range: [-20, 20] }),
            y: types.number(camera.position.y, { range: [-20, 20] }),
            z: types.number(camera.position.z, { range: [-20, 20] }),
        }),
        rotation: types.compound({
            x: types.number(camera.rotation.x, { range: [-20, 20] }),
            y: types.number(camera.rotation.y, { range: [-20, 20] }),
            z: types.number(camera.rotation.z, { range: [-20, 20] }),
        }),
        fov: types.number(camera.fov, { range: [10, 100] }),
        near: types.number(camera.near, { range: [0.1, 10] }),
        far: camera.far,
        zoom: types.number(camera.zoom, { range: [0.1, 10] }),
    })

    cameraObj.onValuesChange((values) => {
        const { x, y, z } = values.position
        camera.position.set(x, y, z)
        camera.rotation.set(values.rotation.x, values.rotation.y, values.rotation.z)
        camera.fov = values.fov
        camera.near = values.near
        camera.far = values.far
        camera.zoom = values.zoom
        console.log(values)
        camera.updateProjectionMatrix()
    })


    const tealLightObj = sheet.object('tealLight', {
        position: types.compound({
            x: types.number(tealLight.position.x, { range: [-50, 50] }),
            y: types.number(tealLight.position.y, { range: [-50, 50] }),
            z: types.number(tealLight.position.z, { range: [-50, 50] }),
        })
    })

    tealLightObj.onValuesChange((values) => {
        const { x, y, z } = values.position
        tealLight.position.x = x
        tealLight.position.y = y
        tealLight.position.z = z
        console.log(tealLight.position)
    })

    const orangeLightObj = sheet.object('orangeLight', {
        position: types.compound({
            x: types.number(orangeLight.position.x, { range: [-50, 50] }),
            y: types.number(orangeLight.position.y, { range: [-50, 50] }),
            z: types.number(orangeLight.position.z, { range: [-50, 50] }),
        })
    })

    orangeLightObj.onValuesChange((values) => {
        const { x, y, z } = values.position
        orangeLight.position.x = x
        orangeLight.position.y = y
        orangeLight.position.z = z
        console.log(orangeLight.position)
    })

}

export default scene
