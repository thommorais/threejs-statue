import { getProject, types, onChange } from '@theatre/core';

import { Vector3 } from 'three';
import { NORMAL, REVERSE } from './utils';

class CameraOnScroll {
  constructor(store, camera, options) {
    this.store = store;
    this.camera = camera;
    this.options = options;
  }

  loadProject(cameraPositions) {
    return new Promise(() => {
      this.project = getProject('FAS', { state: cameraPositions });
      this.project.ready.then(() => {
        this.sheet = this.project.sheet('camera');
        this.setListeners();
      })
    })
  }

  setListeners() {
    this.cameraObj = this.sheet.object('Camera', {
      position: types.compound({ ...this.camera.position }),
      lookAt: types.compound({ x: 0, y: 0, z: 0 }),
      rotateZ: types.number(-0.000, { range: [-10, 10] }),
    });

    this.cameraObj.onValuesChange(({ position, lookAt, rotateZ }) => {
      this.camera.position.set(position.x, position.y, position.z);
      const { x, y, z } = lookAt;
      this.camera.lookAt(new Vector3(x, y, z));
      if (rotateZ !== -0.000) {
        this.camera.rotation.z = rotateZ;
      }
    });

    onChange(this.sheet.sequence.pointer.position, (position) => {
      this.store.setState({ cameraTransitionProgress: position });
    })


    this.store.subscribe(
      ({ cameraPose }) => {
        if (cameraPose.enabled) {
          this.onCameraChangePose(cameraPose)
          this.store.setState({ cameraPose: { enabled: false } });
        }
      },
      ['cameraPose'],
    )

    this.store.subscribe(
      ({ cameraCurrentPose }) => {
        this.sheet.sequence.position = cameraCurrentPose;
      },
      ['cameraCurrentPose'],
    )

    this.store.subscribe(({ doCameraScroll }) => {

      if (doCameraScroll) {
        this.onBodyScroll();
        this.store.setState({ doCameraScroll: false })
      }

    }, 'doCameraScroll');
  }

  onBodyScroll() {
    const { cameraPose, sceneChange, cameraTransitionDuration } = this.store.getState();

    const { from, to } = cameraPose;

    let direction = NORMAL;

    if (to < from) {
      direction = REVERSE
    }

    let rate = cameraTransitionDuration;

    if (sceneChange.enabled) {
      rate = sceneChange.duration / 100;
    }

    this.changeCameraPose({ direction, from, to, rate });
  }

  onCameraChangePose({ direction, from, to, rate, keepScrollLocked }) {
    this.sheet.sequence.position = from
    this.changeCameraPose({ direction, from, to, rate, keepScrollLocked });
  }

  changeCameraPose({ direction, from, to, rate = 0.33, keepScrollLocked = false }) {

    this.store.setState({ cameraTransitionComplete: false });

    const range = direction === NORMAL ? [from, to] : [to, from];

    if (Math.abs(range[0] - range[1]) === 0) {
      console.log(range)
      return null
    }

    this.sheet.sequence.play({ direction, range, rate }).then((done) => {
      if (done) {
        const cameraCurrentPose = this.sheet.sequence.position;
        this.store.setState({ cameraCurrentPose, cameraTransitionComplete: done });
        if (!keepScrollLocked) {
          this.store.unLockScroll();
        }
      } else {
        console.log('opsi')
      }
    }).catch((e) => {
      this.store.unLockScroll();
      throw new Error(e);
    });

  }

}

export default CameraOnScroll;
