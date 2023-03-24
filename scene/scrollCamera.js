import { getProject, types } from '@theatre/core';
import { Vector3 } from 'three';
import { NORMAL } from './utils';

class CameraOnScroll {
  constructor(camera, store) {
    this.camera = camera;
    this.store = store;

    const { cameraState } = this.store.getState();
    this.project = getProject('FAS', { state: cameraState });
    this.sheet = this.project.sheet('camera');
    this.setListeners();
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

    this.store.subscribe(() => this.onBodyScroll(), 'to');
  }

  onBodyScroll() {
    const { direction, from, to } = this.store.getState();
    const range = direction === NORMAL ? [from, to] : [to, from];
    this.sheet.sequence.play({ direction, range }).then(() => {
      this.store.setState({ from: range[0] });
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.log(error);
    });
  }
}

export default CameraOnScroll;
