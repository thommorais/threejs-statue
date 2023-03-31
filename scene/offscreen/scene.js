import {
	BoxGeometry,
	MeshStandardMaterial,
	Mesh,
} from 'three';


import Sparks from './sparks';
import Storm from './storm';
import Stage from './stage';



class FasScene extends Stage {
	constructor(width, height, pixelRatio, offscreen, state, options) {
		super(width, height, pixelRatio, offscreen);

		this.width = width;
		this.height = height;
		this.pixelRatio = pixelRatio;
		this.canvas = offscreen;
		this.state = state
		this.options = options

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
		})

		  // Create a cube
		  const geometry = new BoxGeometry(8, 30, 4);
		  const material = new MeshStandardMaterial({ color: '#0e0e0e' });
		  this.cube = new Mesh(geometry, material);

		  // Add the cube to the scene
		  this.scene.add(this.cube);
	}

	setAnimation() {
		this.renderer.setAnimationLoop((time) => {
			this.renderer.render(this.scene, this.camera);
			this.background.update(time)
			this.sparks.update(time);
			this.cube.rotation.y += 0.01;
		});

	}

}


export default FasScene