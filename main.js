import './style.css'

import webglStuff from './webglStuff'

import { RectAreaLight, Vector3, Clock, CameraHelper, Box3 } from 'three'

import { Pane } from 'tweakpane'
import anime from 'animejs/lib/anime.es.js'

import loadModel from './model'

async function main() {
  const { scene, camera } = webglStuff()

  const model = await loadModel()
  const box = new Box3().setFromObject(model)
  const modelCenter = box.getCenter(new Vector3())
  const modelSize = box.getSize(new Vector3())

  model.position.set(
    -modelCenter.x,
    (modelSize.y / 1.5) * -1,
    modelCenter.z * -1,
  )
  scene.add(model)

  const rectAreaLight = new RectAreaLight(0xf78104, 40, 40, 70)
  rectAreaLight.position.set(-20, 20, 10)
  scene.add(rectAreaLight)

  const rectAreaLight2 = new RectAreaLight(0x008083, 40, 40, 70)
  scene.add(rectAreaLight2)

  const lookAtMe = new Vector3()

  const cameraHelper = new CameraHelper(camera)
  scene.add(cameraHelper)
  camera.lookAt(lookAtMe)

  cameraHelper.visible = false

  const clock = new Clock()

  let pause = true

  camera.position.x = 0
  camera.position.y = 0
  camera.position.z = 300

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
    })
  }

  for (const pos of ['x', 'y', 'z']) {
    const panels = pane.addBlade({
      view: 'slider',
      label: `Camera P ${pos}`,
      min: -100,
      max: 100,
      value: camera.position[pos],
    })
    panels.on('change', (ev) => {
      camera.position[pos] = ev.value
      camera.lookAt(lookAtMe)
    })
  }

  const pauseButton = pane.addButton({ title: 'Play/Pause' })
  pauseButton.on('click', () => {
    pause = !pause
  })

  const goToFace = pane.addButton({ title: 'Face' })
  goToFace.on('click', () => {
    cameraGoTo({ x: 54.5, y: 41, z: 2.55, lookAt: true })
  })

  const goToMass = pane.addButton({ title: 'Mace' })
  goToMass.on('click', () => {
    cameraGoTo({ x: -294, y: 70, z: 60, lookAt: true })
  })

  const goToShield = pane.addButton({ title: 'Shield' })
  goToShield.on('click', () => {
    cameraGoTo({ x: 365, y: -24, z: -38, lookAt: true })
  })

  const resetCamera = pane.addButton({ title: 'Reset' })
  const reset = camera.clone()
  resetCamera.on('click', () => {
    cameraGoTo({ ...reset.position, lookAt: true })
  })

  function loop() {
    const time = clock.getElapsedTime()
    const angle = time * 0.5

    rectAreaLight2.position.y = Math.cos(angle) * 110 * -1
    rectAreaLight2.position.x = Math.cos(angle) * 110 * -1
    rectAreaLight2.position.z = Math.sin(angle) * 110 * -1

    rectAreaLight.position.y = Math.cos(angle) * 110
    rectAreaLight.position.x = Math.cos(angle) * 110
    rectAreaLight.position.z = Math.sin(angle) * 110

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

requestIdleCallback(main)
