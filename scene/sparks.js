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
	constructor(stage, store) {
		this.renderer = stage.renderer;
		this.camera = stage.camera;
		this.scene = stage.scene;
		this.store = store;
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
				u_characterClass: { value:  0.0 },
			},
			vertexShader,
			fragmentShader,
		});

		const geometry = new BufferGeometry();

		const populateAttributes = (bitLength, count) => {
			const deep = count * bitLength;

			const data0Array = new Float32Array(deep * 4);
			const data1Array = new Float32Array(deep * 4);
			const positions = new Float32Array(deep * 3);

			const random = () => Math.random();

			const yHeight = boxHeight * 4

			let index1 = 0;
			let index2 = 0;

			for (let i = 0; i < count; i++) {

				const xx = random();
				const yy = random();
				const zz = random();
				const ww = random();

				const posX = (2 * random() - 1) * (boxWidth / 2);
				const posY = (2 * random() - 1) * yHeight;
				const posZ = randomIntFromInterval(boxDepth * -1, boxDepth);

				for (let j = 0; j < bitLength; j++) {

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
					data0Array[pw] = j / bitLength;

					data1Array[index2++] = xx;
					data1Array[index2++] = yy;
					data1Array[index2++] = zz;
					data1Array[index2++] = ww;
				}
			}

			geometry.setAttribute('aData0', new BufferAttribute(data0Array, 4));
			geometry.setAttribute('aData1', new BufferAttribute(data1Array, 4));
			geometry.setAttribute('position', new BufferAttribute(positions, 3));

		}

		this.store.subscribe(({ characterClass, characterClassUniform }) => {
			const value = characterClassUniform[characterClass] || 0.0;
			material.uniforms.u_characterClass.value = value;

			if (characterClass === 'mage') {
				material.uniforms.u_twist.value = 1.0;
				material.uniforms.u_falloff.value = 0.5;
				material.uniforms.u_windY.value = 0.75;
				populateAttributes(56, this.count * 0.75)
			}

			else if(characterClass === 'demon') {
				// invert the direction of the wind
				material.uniforms.u_windY.value = -0.75;
				// make the particles slower
				material.uniforms.u_temporalFrequency.value = 0.0005;
				// reduce the twist
				material.uniforms.u_twist.value = 0.02;
				// reduce the tail length
				material.uniforms.u_tailLength.value = 0.025;
				// reduce the amplitude
				material.uniforms.u_amplitude.value = 0.1;
				// make the particles more dense
				populateAttributes(32, this.count * 0.5)
			} else {
				populateAttributes(32, this.count)
			}


			this.sparks = new Points(geometry, material);
			this.scene.add(this.sparks);

			geometry.attributes.position.needsUpdate = true;
			geometry.attributes.aData0.needsUpdate = true;
			geometry.attributes.aData1.needsUpdate = true;

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

		}, ['characterClassUniform', 'characterClass'])

	}

	draw() {
		const deltaTime = this.clock.getDelta();
		this.sparks.material.uniforms.u_opacity.value = 2 * deltaTime;
	}

	update(time) {
		if (this.sparks) {
			this.sparks.material.uniforms.u_time.value = time * 0.002;
		}
	}
}

export default Sparks;
