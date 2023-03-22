import fragmentShader from './shaders/sparks.fragment.glsl'
import vertexShader from './shaders/sparks.vertex.glsl'

import {
	BufferGeometry,
	BufferAttribute,
	Points,
	ShaderMaterial,
	AdditiveBlending,
	Clock,
	Vector3,
} from 'three'

class Sparks {
	constructor(stage, layer) {
		this.renderer = stage.renderer
		this.camera = stage.camera
		this.scene = stage.scene
		this.count = 720
		this.layer = layer
		this.sparks = null
		this.init()
	}

	init() {
		const w = window.innerWidth;
		const h = window.innerHeight;
		const aspectRatio = w / h;

		const boxWidth = 8 * aspectRatio;
		const boxHeight = 4 * aspectRatio;
		const boxDepth = 4 * aspectRatio;


		const material = new ShaderMaterial({
			transparent: true,
			depthTest: true,
			depthWrite: false,
			blending: AdditiveBlending,
			uniforms: {
				u_hardness: { value: 0.9 },
				u_time: { value: 0 },
				u_opacity: { value: 1 },
				u_screenHeight: { value: h },
				u_pointSize: { value: 0.03 },
				u_tailLength: { value: 0.2 },
				u_windY: { value: 0.1 },
				u_amplitude: { value: 0.25 },
				u_falloff: { value: 0.7 },
				u_twist: { value: 0.5 },
				u_spatialFrequency: { value: boxHeight * 0.5 },
				u_temporalFrequency: { value: 0.15 },
				u_blink: { value: 3.0 },
				u_dof: { value: 0.5 },
				u_gradient: { value: 1 },
				u_boxHeight: { value: boxHeight },
			},
			vertexShader,
			fragmentShader,
		});


		this.biSize = 24
		const deep = this.count * this.biSize

		const geometry = new BufferGeometry();
		const data0Array = new Float32Array(deep * 4);
		const data1Array = new Float32Array(deep * 4);
		const positions = new Float32Array(deep * 3);


		let a = 0
		let o = 0
		for (let i = 0; i < this.count; i++) {

			const x = 2 * Math.random() - 1
			const y = 2 * Math.random() - 1
			const z = Math.random() * -1

			const xx = Math.random()
			const yy = Math.random()
			const zz = Math.random()
			const ww = Math.random()

			let posX = x * boxWidth;
			let posY = y * boxHeight * 50;
			let posZ = z * boxDepth * 4;

			for (let j = 0; j < this.biSize; j++) {

				let px = a++
				let py = a++
				let pz = a++

				positions[px] = posX
				positions[py] = posY
				positions[pz] = posZ

				data0Array[px] = posX
				data0Array[py] = posY
				data0Array[pz] = posZ

				data0Array[a++] = j / this.biSize;

				data1Array[o++] = xx;
				data1Array[o++] = yy;
				data1Array[o++] = zz;
				data1Array[o++] = ww;
			}

		}

		geometry.setAttribute('aData0', new BufferAttribute(data0Array, 4));
		geometry.setAttribute('aData1', new BufferAttribute(data1Array, 4));
		geometry.setAttribute('position', new BufferAttribute(positions, 3));

		this.sparks = new Points(geometry, material);
		this.scene.add(this.sparks)
		this.clock = new Clock()

		this.draw(1)
		setInterval(this.draw.bind(this), 500)
	}

	draw() {
		const deltaTime = this.clock.getDelta();
		this.sparks.material.uniforms.u_opacity.value = .75 * deltaTime;
	}


	update(time) {
		this.sparks.material.uniforms.u_time.value = time * 0.001;
	}
}

export default Sparks

