import fragmentShader from './shaders/sparks.fragment.glsl';
import vertexShader from './shaders/sparks.vertex.glsl';

import {
	BufferGeometry,
	Float32BufferAttribute,
	BufferAttribute,
	Vector2,
	Points,
	Clock,
	ShaderMaterial,
	Vector3,
} from 'three';

class Sparks {
	constructor(renderer, camera, count) {
		this.renderer = renderer;
		this.camera = camera;
		this.count = count;
		this.clock = new Clock();

		const pixelRatio = this.renderer.getPixelRatio();

		const w = window.innerWidth / 2;
		const h = window.innerHeight;

		const material = new ShaderMaterial({
			transparent: true,
			depthTest: true,
			depthWrite: false,
			uniforms: {
				_Hardness: { value: 0.9 },
				_Time: { value: 0 },
				_Opacity: { value: 0.75 },
				_ScreenHeight: { value: h },
				_PointSize: { value: 0.075 },
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

		const data0Array = [];
		const data1Array = [];
		const positions = new Float32Array(this.count * 3);

		for (let i = 0; i < this.count; i++) {
			const i3 = i * 3;

			positions[i3] = (Math.random() - 0.5) * 7.5;
			positions[i3 + 1] = (Math.random() - 0.5) * 3;
			positions[i3 + 2] = (Math.random() - 0.5) * 5;

			const x = Math.random() * 2 - 1;
			const y = Math.random() * 2 - 1;
			const z = Math.random() * 2 - 1;
			const delay = (Math.random() - 0.5) * 7.5;

			data0Array.push(x, y, z, delay);

			const random0 = Math.random();
			const random1 = (Math.random() - 0.15) * 0.33;
			const random2 = Math.random();
			const random3 = Math.random();

			data1Array.push(random0, random1, random2, random3);
		}

		geometry.setAttribute('aData0', new Float32BufferAttribute(data0Array, 4));
		geometry.setAttribute('aData1', new Float32BufferAttribute(data1Array, 4));
		geometry.setAttribute('position', new BufferAttribute(positions, 3));

		this.sparks = new Points(geometry, material);

	}

	getSparks() {
		return this.sparks;
	}

	animate() {
		const elapsedTime = this.clock.getElapsedTime();
		const material = this.sparks.material;
		material.uniforms._Time.value = elapsedTime * 0.75;
	}
}


export default Sparks;