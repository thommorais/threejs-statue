/* eslint-disable no-mixed-spaces-and-tabs */
import Stage from './stage';
import Scroll from './scroll';
import CreateLights from './lights';
import getModel from './model';
import Store from './store';
import Background from './background';
import Sparks from './sparks';
import Stats from './stats'

import Dev from './dev';

import { rIC } from './utils';

const classDefaults = {
	update() {}
}

class Scene extends Stage {
	constructor(devMode = false, showFPS = false) {
		super();
		this.devMode = devMode;
		this.showFPS = showFPS;
		this.store = new Store();
		this.background = { ...classDefaults }
		this.sparks = { ...classDefaults }
		this.options = {
			characterPath: '',
			characterClass: '',
			cameraStatePath: '',
			sectionSelectors: '',
			scrollSelector: ''
		}
		this.scrollOptions = {}
		this.initialized = false;

	}
	init(options) {
		this.validateInit(options);
		this.animation();

		if (this.devMode) {
			this.dev = new Dev(this.store, {camera: this.camera, scene: this.scene}, options);
			return null
		}

		rIC(() => {
			this.initialize();
		}, { timeout: 540 });
	}

	initialize() {
		// eslint-disable-next-line max-len, no-new
		const { characterClass, characterPath } = this.options;

		this.scroll = new Scroll(this.store, this.camera, this.scrollOptions);

		this.background = new Background(this.scene, this.store, this.options, this.pixelRatio);
		this.sparks = new Sparks(this.scene, this.clock, this.store, this.pixelRatio, characterClass);

		this.handleModel(characterPath).then(() => {
			this.turnOnTheLights();
			rIC(() => { this.store.setState({ characterClass }) }, { timeout: 240 })
		});

		if (this.showFPS) {
			this.stats = new Stats();
		}

		this.initialized = true;
	}

	turnOnTheLights() {
		this.lights = new CreateLights(this.store);
		const sceneModel = this.scene.getObjectByName('character-model');
		for (const light of this.lights.lights) {
			light.target = sceneModel;
			this.scene.add(light);
		}
	}

	handleModel(characterPath) {
		return new Promise((resolve) => {
			getModel(characterPath, this.store)
				.then((model) => {
					rIC(() => {
						this.scene.add(model);
						resolve(model);
					}, { timeout: 240 })
				})
				.catch((error) => {
					throw new Error('Error loading model:', error);
				});
		 })
	}

	validateInit({ sectionSelectors, scrollSelector, characterPath, cameraStatePath, modelLoading, characterClass }) {
		try {
			if (!sectionSelectors) {
				throw new Error('sectionSelectors is required');
			}

			if (!scrollSelector) {
				throw new Error('scrollSelector is required');
			}

			if (!characterPath) {
				throw new Error('characterPath is required');
			}

			if (!cameraStatePath) {
				throw new Error('cameraStatePath is required');
			}

			this.modelLoading(modelLoading);
			this.options = { sectionSelectors, scrollSelector, characterPath, cameraStatePath, modelLoading, characterClass };
			this.scrollOptions = { sectionSelectors, scrollSelector, cameraStatePath, characterPath };
		}catch (error) {
			throw new Error(error);
		}
	}

	animation() {
		this.renderer.setAnimationLoop((time) => {
			this.sparks.update(time);
			this.background.update(time);
			this.camera.updateProjectionMatrix();
			this.camera.updateMatrixWorld(true);
			this.renderer.render(this.scene, this.camera);

			if (this.initialized && this.showFPS) {
				this.stats.update();
			}
		});
	}

	modelLoading(callback) {
		if (typeof callback === 'function') {
			this.store.subscribe(({ modelLoadingProgress }) => callback(modelLoadingProgress), 'modelLoadingProgress');
		}
	}

	lockScroll() {
		this.store.lockScroll();
	}

	unlockScroll() {
		this.store.unlockScroll();
	}

	scrollTo({ to, from, duration }) {
		this.store.scrollTo({ to, from, duration });
	}

	subscribe(callback, key) {
		if (typeof callback === 'function') {
			this.store.subscribe(callback, key);
		}
	}
}

export default Scene;
