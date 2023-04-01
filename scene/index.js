/* eslint-disable no-mixed-spaces-and-tabs */
import Stage from './stage';
import Scroll from './scroll';
import CreateLights from './lights';
import getModel from './model';
import { store } from './store';
import Background from './background';
import Sparks from './sparks';

import MobileDebugOverlay from './mobileDebug';

import tasks from './globalTaskQueue';

import { getGPUTier } from 'detect-gpu';

import Stats from './stats'
import Dev from './dev';


import * as Comlink from 'comlink';

const classDefaults = {
	update() { },
	addContent() { },
	updateContent() { },
}

window.mobileDebug = classDefaults;

import fragmentShader from './shaders/sparks.fragment.glsl'
import vertexShader from './shaders/sparks.vertex.glsl'


class Scene extends Stage {
	constructor() {
		super();

		this.store = store;


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


	async testOffScreen() {

		const instance = new ComlinkWorker(new URL('./offscreen.js', import.meta.url))


		const width = window.innerWidth;
		const height = window.innerHeight;
		const pixelRatio = Math.min(window.devicePixelRatio, 2);
		const canvas2 = document.querySelector('.webgl2')

		canvas2.height = height
		canvas2.width = width

		const state = this.store.getState()

		if ('transferControlToOffscreen' in canvas2) {
			const offscreen = canvas2.transferControlToOffscreen();

			const transfer = {
				offscreen,
				width,
				height,
				state,
				pixelRatio,
				options: this.options,
				sparksShaders: {
					fragmentShader,
					vertexShader
				}
			}

			instance.offScreen(Comlink.transfer(transfer, [offscreen])).then(res => {
				console.log(res)
			}).catch(err => {
				console.log(err)
			})


			const path = import.meta.env.DEV ? import.meta.resolve('./offscreen/worker.js') : './worker.js'

			function callback(value) {
				console.log(`Result: ${value}`);
			}

			async function init() {
				const remoteFunction = Comlink.wrap(new Worker(path));
				await remoteFunction(Comlink.proxy(callback));
			}

			init();

		}


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
		this.validateInit({ characterClass: 'demon', ...options });

		this.initStage(this.store)

		tasks.pushTask(() => { this.addTools(); });

		this.getGPUdata().finally(() => {

			// tasks.pushTask(() => { this.setupBackground(); });
			if (!this.devMode) {
				// tasks.pushTask(() => { this.setTupScroll(); });
				// tasks.pushTask(() => { this.turnOnTheLights(); });
				// tasks.pushTask(() => { this.addModel(); });
			}
			// tasks.pushTask(() => { this.setAnimation(); });

			this.initialized = true;

			this.testOffScreen()

		})

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

	subscribe(callback, key) {
		if (typeof callback === 'function') {
			this.store.subscribe(callback, key);
		}
	}
}

export default Scene;
