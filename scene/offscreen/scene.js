import {
	BoxGeometry,
	MeshStandardMaterial,
	Mesh,
} from 'three';

import getModel from './model';


import Sparks from './sparks';
import Storm from './storm';
import Stage from './stage';
import Lights from './lights';


class FasScene extends Stage {
	constructor(width, height, pixelRatio, offscreen, state, options, sparksShaders) {
		super(width, height, pixelRatio, offscreen);

		this.width = width;
		this.height = height;
		this.pixelRatio = pixelRatio;
		this.canvas = offscreen;
		this.state = state
		this.options = options


		this.sparksVertex = sparksShaders.vertexShader
		this.sparksFragment = sparksShaders.fragmentShader

		this.init()
		this.setAnimation()

	}

	init() {
		this.background = new Storm(this.scene, this.state, this.options, this.pixelRatio)

		// scene, clock, state, pixelRatio, characterClass
		this.sparks = new Sparks(this.scene, this.clock, this.state, this.pixelRatio, this.options.characterClass, {
			width: this.width,
			height: this.height,
			pixelRatio: this.pixelRatio,
		}, {
			fragmentShader: this.sparksFragment,
			vertexShader: this.sparksVertex,
		})


		const path = import.meta.env.DEV ? import.meta.resolve(`../../${this.options.characterClass}/scene.glb`) : `../${this.options.characterClass}/scene.glb`

		console.log({path})

		getModel(path).then((model) => {
			this.scene.add(model);
			new Lights(this.state, this.scene)
		}).catch((error) => {
			throw new Error(error);
		})

	}

	setAnimation() {
		this.renderer.setAnimationLoop((time) => {
			this.renderer.render(this.scene, this.camera);
			this.background.update(time)
			this.sparks.update(time);
		});

	}

}


export default FasScene