/* eslint-disable no-mixed-spaces-and-tabs */
import Stage from './stage';
import Scroll from './scroll';
import CreateLights from './lights';
import getModel from './model';
import Store from './store';
import Background from './background';
import Sparks from './sparks';

import MobileDebugOverlay from './mobileDebug';

import clearThreeJSMemory from './clearThreeJSMemory';

import tasks from './globalTaskQueue';

import { getGPUTier } from 'detect-gpu';

import Stats from './stats'
import Dev from './dev';


import { Cache } from 'three';


const classDefaults = {
	update() { },
	addContent() { },
	updateContent() { },
}

window.mobileDebug = classDefaults;

class Scene extends Stage {
	constructor() {
		super();
		Cache.enabled = true;

		this.store = new Store();


		this.options = {
			characterPath: '',
			characterClass: '',
			cameraPositionsPath: '',
			sectionSelectors: '',
			scrollSelector: ''
		}


		this.scrollOptions = {}
		this.initialized = false;

		this.background = { ...classDefaults }
		this.sparks = { ...classDefaults }
		this.mobileDebug = { ...classDefaults }

		const getQueryParams = (qs) => {
			qs = qs.split('+').join(' ');
			var params = {},
				tokens,
				re = /[?&]?([^=]+)=([^&]*)/g;
			while (tokens = re.exec(qs)) {
				params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
			}
			return params;
		}

		const params = getQueryParams(document.location.search);

		let { dev, fps, debug } = params

		this.devMode = !!dev;
		this.showFPS = !!fps;
		this.debug = !!debug;

	}


	getGPUdata() {
		return new Promise((resolve, reject) => {
			const glContext = this.renderer.getContext();
			getGPUTier({ glContext }).then((gpuData) => {
				this.store.setState({ gpuData });
				this.renderer.resetState()
				resolve(gpuData)
			}).catch((err) => {
				reject(err)
				this.store.setState({ gpuData: { tier: 2 } });
			});

		})
	}


	init(options) {
		this.validateInit({ characterClass: 'fallenAngel', ...options });

		this.initStage(this.store)

		tasks.pushTask(() => { this.addTools(); });

		this.getGPUdata().finally(() => {

			if (!this.devMode) {
				this.setupBackground();
				this.setTupScroll();
				this.turnOnTheLights();
				this.addModel();
			}

			tasks.pushTask(() => { this.setAnimation(); });
			this.initialized = true;
		})

		// // on page leave clean up memory
		// window.addEventListener('beforeunload', () => {
		// 	this.clearMemory()
		// })

	}



	addTools() {

		if (this.devMode) {
			this.dev = new Dev(this.store, { camera: this.camera, scene: this.scene }, this.options);
			return null
		}

		if (this.showFPS) {
			this.stats = new Stats();
		}

		if (this.debug) {
			this.mobileDebug = new MobileDebugOverlay(this.store);

			this.store.subscribe(({ gpuData }) => {
				this.mobileDebug.addContent(`<div>fps: ${gpuData.fps} - tier: ${gpuData.tier}</div>`);
			}, ['gpuData'])

			window.mobileDebug = this.mobileDebug;

			this.subscribe(({ modelError }) => {
				if (modelError) {
					this.mobileDebug.addContent(`<div>Model Error: ${modelError}</div>`);
				}
			}, 'modelError')

		}
	}

	setTupScroll() {
		this.scroll = new Scroll(this.store, this.camera, this.scrollOptions);
	}

	setupBackground() {
		this.sparks = new Sparks(this.scene, this.clock, this.store, this.pixelRatio, this.options.characterClass);
		this.background = new Background(this.scene, this.store, this.options, this.pixelRatio);
	}

	addModel() {
		getModel(this.options.characterPath, this.store).then((model) => {
			this.scene.add(model);
			this.store.setState({ modelAdded: true });
		}).catch((error) => {
			throw new Error(error);
		})

	}

	turnOnTheLights() {
		new CreateLights(this.store, this.scene, this.options.characterClass);
	}

	validateInit({ sectionSelectors, scrollSelector, characterPath, cameraPositionsPath, modelLoading, characterClass }) {
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

			if (!cameraPositionsPath) {
				throw new Error('cameraPositionsPath is required');
			}

			this.modelLoading(modelLoading);
			this.options = { sectionSelectors, scrollSelector, characterPath, cameraPositionsPath, modelLoading, characterClass };
			this.scrollOptions = { sectionSelectors, scrollSelector, cameraPositionsPath, characterPath };
			this.store.setState({ characterClass: this.options.characterClass })
		} catch (error) {
			throw new Error(error);
		}
	}

	setAnimation() {

		this.renderer.setAnimationLoop((time) => {
			this.renderer.render(this.scene, this.camera);
			this.sparks.update(time);
			this.background.update(time);
			if (this.showFPS) {
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

	unLockScroll() {
		this.store.unLockScroll();
	}

	setScenePose(pose) {
		this.lockScroll()
		this.store.setScenePose(pose);
		return new Promise((resolve) => {
			this.subscribe(({ sectionTransitionComplete, cameraTransitionComplete }) => {
				if (cameraTransitionComplete && sectionTransitionComplete) {
					const state = this.store.getState();

					if (!pose.keepScrollLocked) {
						this.unLockScroll();
					}

					resolve(state);
				}
			}, ['sectionTransitionComplete', 'cameraTransitionComplete'])
		})
	}

	setCameraPose(pose) {
		this.lockScroll()
		this.store.cameraPose(pose);
		return new Promise((resolve) => {
			this.subscribe(({ cameraTransitionComplete }) => {
				if (cameraTransitionComplete) {
					const state = this.store.getState();
					if (!pose.keepScrollLocked) {
						this.unLockScroll();
					}
					resolve(state);
				}
			}, 'cameraTransitionComplete')
		})
	}

	setSectionScroll(pose) {
		this.lockScroll()
		this.store.sectionScroll(pose);
		return new Promise((resolve) => {
			this.subscribe(({ sectionTransitionComplete }) => {
				if (sectionTransitionComplete) {
					const state = this.store.getState();
					if (!pose.keepScrollLocked) {
						this.unLockScroll();
					}
					resolve(state);
				}
			}, ['sectionTransitionComplete'])
		})
	}

	clearMemory() {
		clearThreeJSMemory(this.scene)
		this.renderer.renderLists.dispose();
		this.renderer.dispose();
		Cache.clear()
		return new Promise((resolve) => {
			resolve(this.renderer.info)
		})
	}

	subscribe(callback, key) {
		if (typeof callback === 'function') {
			this.store.subscribe(callback, key);
		}
	}
}

export default Scene;
