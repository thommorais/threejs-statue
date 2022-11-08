
async function theater(camera) {
    const { default: studio } = await import('@theatre/studio')
    studio.initialize()

    const { getProject, types } = await import('@theatre/core')

    const project = getProject('Camera')
    const sheet = project.sheet('Scene')

    const { Vector3 } = await import('three')

    const cameraObj = sheet.object('Camera', {
        position: types.compound({
            x: types.number(camera.camera.position.x, { range: [0, 200] }),
            y: types.number(camera.camera.position.y, { range: [0, 200] }),
            z: types.number(camera.camera.position.z, {
                range: [-150
                    , 150]
            }),
        }),
        rotation: types.compound({
            x: types.number(camera.camera.rotation.x, { range: [-20, 20] }),
            y: types.number(camera.camera.rotation.y, { range: [-20, 20] }),
            z: types.number(camera.camera.rotation.z, { range: [-20, 20] }),
        }),
        fov: types.number(camera.camera.fov, { range: [10, 100] }),
        near: types.number(camera.camera.near, { range: [0.1, 10] }),
        far: camera.camera.far,
        zoom: types.number(camera.camera.zoom, { range: [0.1, 10] }),
    })


    cameraObj.onValuesChange((values) => {
        camera.camera.position.set(values.position.x, values.position.y, values.position.z)
        camera.camera.rotation.set(values.rotation.x, values.rotation.y, values.rotation.z)
        camera.camera.fov = values.fov
        camera.camera.near = values.near
        camera.camera.far = values.far
        camera.camera.zoom = values.zoom

        const { x, y, z } = values.position
        // camera.camera.lookAt(new Vector3(x, y, z))
        camera.camera.updateProjectionMatrix()
    })

    // Shown as a radio switch with a custom label
    const obj = sheet.object('Camera navigation', {
        close: types.stringLiteral('close', { zero: 'zero', one: 'one', two: 'two', three: 'three', four: 'four', five: 'five' }),
    })

    obj.onValuesChange((values) => {
        switch (values.close) {
            case 'zero': {
                camera.camera.position.set(0, 30, 66)
                camera.camera.rotation.set(0, 0, 0)
                break
            }
            case 'one': {
                camera.camera.position.set(0, 36, 30)
                camera.camera.rotation.set(0, 0, 0)
                break
            }

            case 'two': {
                camera.camera.position.set(30, 30, 11)
                camera.camera.rotation.set(0, -4.95, 0)
                break
            }
            case 'three': {
                camera.camera.position.set(5.25, 32.5, 12)
                camera.camera.rotation.set(0, -0.15, 0)

                break
            }
            case 'four': {
                camera.camera.position.set(0, 90, 150)
                camera.camera.rotation.set(0, 0, 0)
                break
            }
            case 'five': {
                camera.camera.position.set(0, 90, 150)
                camera.camera.rotation.set(0, 0, 0)
                break
            }

        }

        camera.cameraHelper.update()
        camera.camera.updateProjectionMatrix()
    })

}

export default theater
