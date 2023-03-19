import fragmentShader from './shaders/sparks.fragment.glsl'
import vertexShader from './shaders/sparks.vertex.glsl'


import {
	BufferGeometry,
	BufferAttribute,
	Vector2,
	Points,
	ShaderMaterial,
	Vector3,
	AdditiveBlending,
} from 'three'

import * as THREE from 'three'

class Sparks {
	constructor(renderer, camera, count) {
		this.renderer = renderer
		this.camera = camera
		this.count = count

		const w = window.innerWidth / 2
		const h = window.innerHeight

		const material = new ShaderMaterial({
			transparent: true,
			depthTest: true,
			depthWrite: true,
			blending: AdditiveBlending,
			uniforms: {
				_Hardness: { value: 0.9 },
				_Time: { value: 0 },
				_Opacity: { value: 0.75 },
				_ScreenHeight: { value: h },
				_PointSize: { value: 0.05 },
				_TailLength: { value: 0.75 },
				_WindY: { value: 0.05 },
				_Amplitude: { value: 1 },
				_Falloff: { value: 0.65 },
				_Twist: { value: 0.35 },
				_SpatialFrequency: { value: 10 },
				_TemporalFrequency: { value: 0.1 },
				_BlinkFrequency: { value: 0.2 },
				_DOF: { value: 0 },
				_Gradient: { value: 1 },
				_CameraPos: {
					value: new Vector3(),
				},
				_WorldSize: { value: new Vector3(80, 75, 4) },
				_Resolution: {
					value: new Vector2(w, h),
				},
			},
			vertexShader,
			fragmentShader,
		});

		const geometry = new BufferGeometry();
		const data0Array =  new Float32Array(this.count * 4);
		const data1Array =  new Float32Array(this.count * 4);
		const positions = new Float32Array(this.count * 3);

		for (let i = 0; i < this.count; i++) {
			const i3 = i * 3;

			positions[i3] = (Math.random() - 0.5) * 7.5;
			positions[i3 + 1] = (Math.random() - 0.5) * 3;
			positions[i3 + 2] = (Math.random() - 0.5) * 5;

			data0Array[i3] = Math.random() * 2 - 1;
			data0Array[i3 + 1] = Math.random() * 2 - 1;
			data0Array[i3 + 2] = Math.random() * 2 - 1;
			data0Array[i3 + 3] = (Math.random() - 0.5) * 7.5;

			data1Array[i3] = Math.random();
			data1Array[i3 + 1] = (Math.random() - 0.15) * 0.33;
			data1Array[i3 + 2] = Math.random();
			data1Array[i3 + 3] = Math.random();
		}

		geometry.setAttribute('aData0', new BufferAttribute(data0Array, 4));
		geometry.setAttribute('aData1', new BufferAttribute(data1Array, 4));
		geometry.setAttribute('position', new BufferAttribute(positions, 3));

		this.sparks = new Points(geometry, material);
		this.sparks.frustumCulled = false;
		this.sparks.matrixAutoUpdate = false;
		this.sparks.updateMatrix();
		this.sparks.position.y = -10;

	}

	getSparks() {
		return this.sparks
	}

	animate(time) {
		this.sparks.material.uniforms._Time.value = time * 0.0005;
		// this.anim(time)
	}
}

export default Sparks

