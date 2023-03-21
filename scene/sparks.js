import fragmentShader from './shaders/sparks.fragment.glsl'
import vertexShader from './shaders/sparks.vertex.glsl'

import {
	BufferGeometry,
	BufferAttribute,
	Points,
	ShaderMaterial,
	AdditiveBlending,
} from 'three'

class Sparks {
	constructor(renderer, camera, layer) {
		this.renderer = renderer
		this.camera = camera
		this.count = 10000
		this.layer = layer
		this.init()
	}

	init() {
		const w = window.innerWidth;
		const h = window.innerHeight;
		const aspectRatio = w / h;
		// Adjust the dimensions based on the aspect ratio
		const boxWidth = 8 * aspectRatio;
		const boxHeight = 4 * aspectRatio;
		const boxDepth = 4 * aspectRatio;


		const material = new ShaderMaterial({
			transparent: true,
			depthTest: true,
			depthWrite: false,
			blending: AdditiveBlending,
			uniforms: {
				_Hardness: { value: 0.01 },
				_Time: { value: 0 },
				_Opacity: { value: 1.0 },
				_ScreenHeight: { value: h * 0.23 },
				_PointSize: { value: 0.15 },
				_TailLength: { value: 25.0 }, // Increase tail length
				_WindY: { value: 0.25 }, // Increase upward motion
				_Amplitude: { value: 0.3 },
				_Falloff: { value: 0.75 },
				_Twist: { value: 0.55 },
				_SpatialFrequency: { value: 10 },
				_TemporalFrequency: { value: 0.1 },
				_BlinkFrequency: { value: 0.2 },
				_DOF: { value: 0.45 },
				_Gradient: { value: 1 },
				_BoxHeight: { value: boxHeight },

			},
			vertexShader,
			fragmentShader,
		});

		const geometry = new BufferGeometry();
		const data0Array = new Float32Array(this.count * 4);
		const data1Array = new Float32Array(this.count * 4);
		const positions = new Float32Array(this.count * 3);
		const velocities = new Float32Array(this.count * 3);


		for (let i = 0; i < this.count; i++) {
			const i3 = i * 3;

			positions[i3] = (Math.random() - 0.5) * boxWidth;
			positions[i3 + 1] = (Math.random() - 0.5) * boxHeight * 50;
			positions[i3 + 2] = (Math.random() - 0.5) * boxDepth;

			data0Array[i3] = Math.random() * 2 - 1;
			data0Array[i3 + 1] = Math.random() * 2 - 1;
			data0Array[i3 + 2] = Math.random() * 2 * 5
			data0Array[i3 + 3] = (Math.random() - 0.5) * 2;

			data1Array[i3] = Math.random();
			data1Array[i3 + 1] = (Math.random() - 0.15) * 0.33;
			data1Array[i3 + 2] = Math.random();
			data1Array[i3 + 3] = Math.random();

			velocities[i3] = (Math.random() - 0.5) * 2;
			velocities[i3 + 1] = (Math.random() - 0.5) * 2;
			velocities[i3 + 2] = (Math.random() - 0.5) * 2;

		}

		geometry.setAttribute('aData0', new BufferAttribute(data0Array, 4));
		geometry.setAttribute('aData1', new BufferAttribute(data1Array, 4));
		geometry.setAttribute('position', new BufferAttribute(positions, 3));

		this.sparks = new Points(geometry, material);
		// this.sparks.layers.set(this.layer);
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

