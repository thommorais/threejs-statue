import './style.css'

import webglStuff from './webglStuff'

import { RectAreaLight, Vector3, Clock, CameraHelper, Box3 } from 'three'
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js'

import { Pane } from 'tweakpane'
import anime from 'animejs/lib/anime.es.js'

import loadModel from './model'

async function main() {
    const { scene, camera, directionalLight } = webglStuff()

    const model = await loadModel()
    const box = new Box3().setFromObject(model)
    const modelCenter = box.getCenter(new Vector3())
    const modelSize = box.getSize(new Vector3())

    model.position.set(
        -modelCenter.x,
        (modelSize.y / 10) * -1,
        modelCenter.z * -1,
    )
    scene.add(model)

    const rectAreaLight = new RectAreaLight(0xf78104, 50, 50, 70)
    rectAreaLight.position.set(-50, 50, 10)
    scene.add(rectAreaLight)

    const rectAreaLight2 = new RectAreaLight(0x008083, 50, 50, 70)
    scene.add(rectAreaLight2)

    scene.add(new RectAreaLightHelper(rectAreaLight));
    scene.add(new RectAreaLightHelper(rectAreaLight2));

    const lookAtMe = new Vector3()

    const cameraHelper = new CameraHelper(camera)
    scene.add(cameraHelper)
    camera.lookAt(lookAtMe)

    cameraHelper.visible = false

    const clock = new Clock()

    let pause = true

    camera.position.x = 0
    camera.position.y = 0
    camera.position.z = 100

    const pane = new Pane()

    function cameraGoTo({ x, y, z, lookAt = false }) {
        const targets = { ...camera.position }
        anime({
            targets,
            x,
            y,
            z,
            easing: 'linear',
            round: 100,
            update: () => {
                camera.position.x = targets.x
                camera.position.y = targets.y
                camera.position.z = targets.z
                if (lookAt) {
                    camera.lookAt(lookAtMe)
                } else {
                    camera.lookAt(camera.position)
                }
            },
            changeComplete: () => {
                camera.lookAt(camera.position)
            }
        })
    }

    for (const pos of ['x', 'y', 'z']) {
        const panels = pane.addBlade({
            view: 'slider',
            label: `Camera P ${pos}`,
            min: -500,
            max: 500,
            value: camera.position[pos],
        })
        panels.on('change', (ev) => {
            directionalLight.position[pos] = ev.value
            // camera.lookAt(lookAtMe)
        })
    }

    const pauseButton = pane.addButton({ title: 'Play/Pause' })
    pauseButton.on('click', () => {
        pause = !pause
    })


    const goToFace = pane.addButton({ title: 'Face' })
    goToFace.on('click', () => {
        cameraGoTo({ x: 0, y: 21, z: 32, lookAt: true })
    })

    const goToShield = pane.addButton({ title: 'Shield' })
    goToShield.on('click', () => {
        cameraGoTo({ x: 265, y: -24, z: -38, lookAt: true })
    })

    const resetCamera = pane.addButton({ title: 'Reset' })
    const reset = camera.clone()
    resetCamera.on('click', () => {
        cameraGoTo({ ...reset.position, lookAt: true })
    })

    function loop() {
        const time = clock.getElapsedTime()
        const angle = time * 0.5
        const distance = 50

        rectAreaLight2.position.y = Math.cos(angle) * distance * -1
        rectAreaLight2.position.x = Math.cos(angle) * distance * -1
        rectAreaLight2.position.z = Math.sin(angle) * distance * -1

        rectAreaLight.position.y = Math.cos(angle) * distance
        rectAreaLight.position.x = Math.cos(angle) * distance
        rectAreaLight.position.z = Math.sin(angle) * distance

        if (pause === false) {
            camera.position.x = Math.cos(angle) * 5.5
            camera.position.z = Math.sin(angle) * 5
            camera.lookAt(lookAtMe)
        }

        rectAreaLight.lookAt(lookAtMe)
        rectAreaLight2.lookAt(lookAtMe)

        cameraHelper.update()

        requestAnimationFrame(loop)
    }
    loop()
}

export default main
