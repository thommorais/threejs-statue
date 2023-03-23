/* eslint-disable no-plusplus */
import {
	BufferGeometry,
	BufferAttribute,
	Points,
	ShaderMaterial,
	AdditiveBlending,
	Clock,
} from 'three';

import fragmentShader from './shaders/sparks.fragment.glsl';
import vertexShader from './shaders/sparks.vertex.glsl';

import { randomIntFromInterval } from './utils';


class Sparks {
	constructor(stage) {
		this.renderer = stage.renderer;
		this.camera = stage.camera;
		this.scene = stage.scene;
		this.count = 720;
		this.sparks = null;
		this.init();
	}

	init() {
		const wWidth = window.innerWidth;
		const wHeight = window.innerHeight;
		const aspectRatio = wWidth / wHeight;

		const boxWidth = 4 * aspectRatio;
		const boxHeight = boxWidth;
		const boxDepth = boxWidth * 0.5;

		const material = new ShaderMaterial({
			transparent: true,
			depthTest: true,
			depthWrite: false,
			blending: AdditiveBlending,
			uniforms: {
				u_hardness: { value: 0.9 },
				u_time: { value: 0 },
				u_opacity: { value: 3 },
				u_screenHeight: { value: wHeight },
				u_pointSize: { value: 0.005 },
				u_tailLength: { value: .15 },
				u_windY: { value: .3 },
				u_amplitude: { value: 0.5 },
				u_falloff: { value: 0.9 },
				u_twist: { value: 0.35 },
				u_spatialFrequency: { value: boxHeight * 0.5 },
				u_temporalFrequency: { value: 0.15 },
				u_blink: { value: 1.0 },
				u_dof: { value: 1 },
				u_gradient: { value: 1 },
				u_boxHeight: { value: boxHeight },
			},
			vertexShader,
			fragmentShader,
		});

		this.bitSize = 32;
		const deep = this.count * this.bitSize;

		const geometry = new BufferGeometry();
		const data0Array = new Float32Array(deep * 4);
		const data1Array = new Float32Array(deep * 4);
		const positions = new Float32Array(deep * 3);

		const random = () => Math.random();

		let index1 = 0;
		let index2 = 0;

		const yHeight = boxHeight * 150

		for (let i = 0; i < this.count; i++) {

			const xx = random();
			const yy = random();
			const zz = random();
			const ww = random();

			const posX = (2 * random() - 1) * boxWidth / 2;
			const posY = (2 * random() - 1) * yHeight;
			const posZ = randomIntFromInterval(boxDepth * -1, boxDepth);

			for (let j = 0; j < this.bitSize; j++) {

				const px = index1++;
				const py = index1++;
				const pz = index1++;
				const pw = index1++;

				positions[px] = posX;
				positions[py] = posY;
				positions[pz] = posZ;

				data0Array[px] = posX;
				data0Array[py] = posY;
				data0Array[pz] = posZ;
				data0Array[pw] = j / this.bitSize;

				data1Array[index2++] = xx;
				data1Array[index2++] = yy;
				data1Array[index2++] = zz;
				data1Array[index2++] = ww;
			}
		}

		geometry.setAttribute('aData0', new BufferAttribute(data0Array, 4));
		geometry.setAttribute('aData1', new BufferAttribute(data1Array, 4));
		geometry.setAttribute('position', new BufferAttribute(positions, 3));

		this.sparks = new Points(geometry, material);
		this.scene.add(this.sparks);
		this.clock = new Clock();

		this.draw(1);
		let timeout = 480

		const runDraw = () => {
			setTimeout(
				() => {
					this.draw()
					timeout = randomIntFromInterval(480, 1240)
					requestAnimationFrame(runDraw)
			}, timeout);
		}

		runDraw()

	}

	draw() {
		const deltaTime = this.clock.getDelta();
		this.sparks.material.uniforms.u_opacity.value = 2 * deltaTime;
	}

	update(time) {
		this.sparks.material.uniforms.u_time.value = time * 0.002;
	}
}

export default Sparks;
