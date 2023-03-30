/* eslint-disable no-mixed-spaces-and-tabs */
import Stage from './stage';
import Scroll from './scroll';
import CreateLights from './lights';
import getModel from './model';
import Store from './store';
import Background from './background';
import Sparks from './sparks';

import MobileDebugOverlay from './mobileDebug';

import IdleQueue from './idleQueue';

import { getGPUTier } from 'detect-gpu';

import Stats from './stats'
import Dev from './dev';

import { rIC } from './utils';

const classDefaults = {
	update() { },
	addContent() { },
	updateContent() { },
}

window.mobileDebug = classDefaults;

class Scene extends Stage {
	constructor() {
		super();

		this.store = new Store();

		this.options = {
			characterPath: '',
			characterClass: '',
			cameraPositionsPath: '',
			sectionSelectors: '',
			scrollSelector: ''
		}

		this.tasks = new IdleQueue({
			ensureTasksRun: true,
		})

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
		return new Promise((resolve) => {
			getGPUTier({ glContext: this.renderer.getContext() }).then((data) => {
				this.store.setState({ gpuData: data });
				resolve(data);
			});
		});
	}


	init(options) {
		this.validateInit({ characterClass: 'demon', ...options });

		if (this.devMode) {
			this.dev = new Dev(this.store, { camera: this.camera, scene: this.scene }, options);
			return null
		}

		this.getGPUdata().then((gpuData) => {
			this.tasks.pushTask(() => {
				this.initialize(gpuData);
				this.animation();
			});
		});

	}


	addDebug(gpuData) {
		if (this.debug) {
			this.mobileDebug = new MobileDebugOverlay(this.store);
			this.mobileDebug.addContent(`<div>fps: ${gpuData.fps} - tier: ${gpuData.tier}</div>`);

			window.mobileDebug = this.mobileDebug;

			this.subscribe(({ modelError }) => {
				if (modelError) {
					this.mobileDebug.addContent(`<div>Model Error: ${modelError}</div>`);
				}
			}, 'modelError')

		}
	}

	initialize(gpuData) {
		this.addDebug(gpuData);

		// this.scroll = new Scroll(this.store, this.camera, this.scrollOptions, gpuData);

		if (gpuData.tier > 1) {
			this.background = new Background(this.scene, this.store, this.options, this.pixelRatio);
		}

		this.tasks.pushTask(() => {
			this.sparks = new Sparks(this.scene, this.clock, this.store, this.pixelRatio, this.options.characterClass);
		})

		this.tasks.pushTask(() => {
			getModel(this.options.characterPath, this.store).then((model) => {
				this.scene.add(model);
				this.tasks.pushTask(() => {
					this.turnOnTheLights(this.options.characterClass);
					this.store.setState({ modelAdded: true });
					this.camera.updateProjectionMatrix();
				})

			}).catch((error) => {
				this.mobileDebug.addContent(`<div>Error loading model, ${error}<div>`);
				throw new Error(error);
			});
		})

		if (this.showFPS) {
			this.stats = new Stats();
		}

		this.initialized = true;

		if (this.debug) {
			const renderInfo = this.mobileDebug.addContent(`<div>render: ${JSON.stringify(this.renderer.info.render, null, 2)}</div>`);
			const memoryInfo = this.mobileDebug.addContent(`<div>memory: ${JSON.stringify(this.renderer.info.memory, null, 2)}</div>`);
			setInterval(() => {
				this.mobileDebug.updateContent(renderInfo, `<div>render: ${JSON.stringify(this.renderer.info.render, null, 2)}</div>`);
				this.mobileDebug.updateContent(memoryInfo, `<div>render: ${JSON.stringify(this.renderer.info.memory, null, 2)}</div>`);
			}, 1000);
		}

	}

	turnOnTheLights(characterClass) {
		try {
			this.lights = new CreateLights(this.store, characterClass);
			for (const light of this.lights.lights) {
				this.scene.add(light);
			}
		} catch (error) {
			this.mobileDebug.addContent(`<div>turnOnTheLights, ${error}<div>`);
		}
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

	animation() {

		this.renderer.setAnimationLoop((time) => {
			this.renderer.render(this.scene, this.camera);
			this.sparks.update(time);
			this.background.update(time);
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

	unLockScroll() {
		this.store.unLockScroll();
	}

	setScenePose({ to, from, duration, keepScrollLocked }) {
		this.lockScroll()
		this.store.scrollTo({ to, from, duration, keepScrollLocked });
		return new Promise((resolve) => {
			this.subscribe(({ sectionTransitionComplete, cameraTransitionComplete }) => {
				if (cameraTransitionComplete && sectionTransitionComplete) {
					const state = this.store.getState();

					if (!keepScrollLocked) {
						this.unLockScroll();
					}

					resolve(state);
				}
			}, ['sectionTransitionComplete', 'cameraTransitionComplete'])
		})
	}

	setCameraPose({ to, from, duration, rate, keepScrollLocked }) {
		this.lockScroll()
		this.store.cameraPose({ to, from, duration, rate, keepScrollLocked });
		return new Promise((resolve) => {
			this.subscribe(({ cameraTransitionComplete }) => {
				if (cameraTransitionComplete) {
					const state = this.store.getState();
					if (!keepScrollLocked) {
						this.unLockScroll();
					}
					resolve(state);
				}
			}, 'cameraTransitionComplete')
		})
	}

	setSectionScroll({ to, from, duration, keepScrollLocked }) {
		this.lockScroll()
		this.store.sectionScroll({ to, from, duration, keepScrollLocked });
		return new Promise((resolve) => {
			this.subscribe(({ sectionTransitionComplete, }) => {
				if (sectionTransitionComplete) {
					const state = this.store.getState();
					if (!keepScrollLocked) {
						this.unLockScroll();
					}
					resolve(state);
				}
			}, ['sectionTransitionComplete'])
		})
	}

	subscribe(callback, key) {
		if (typeof callback === 'function') {
			this.store.subscribe(callback, key);
		}
	}
}

export default Scene;
