/* eslint-disable no-mixed-spaces-and-tabs */
import Stage from './stage'
import Scroll from './scroll'
import CreateLights from './lights'
import getModel from './model'
import Store from './store'
import Sparks from './sparks'
import Background from './background'

import DevMode from './dev'

const initialState = {
	loadingProgress: 0,
	current: 0,
	duration: 750,
	viewportHeight: window.innerHeight,
	syntaticScroll: { scroll: 0, duration: 200 },
	thresholdScroll: { desktop: 120, mobile: 30 },
	currentScrollThreshold: 0,
	afterEventTimeout: 200,
	locked: false,
	direction: "normal",
	timeout: null,
	cameraState: {},
	scrollProgress: 0,
	sections: [],
	currentSection: null,
	scenesRect: [],
	mouseWheel: false,
	scrollerSection: null,
	scrollStatus: {
		"offset": {
			"x": 0,
			"y": 0
		},
		"limit": {
			"x": 0,
			"y": 0
		}
	}
}

class Scene {
	constructor(dev = false) {
		this.dev = dev;
		this.store = new Store({ ...initialState });
		this.stage = new Stage();
		this.lights = new CreateLights();
		this.sparks = new Sparks(this.stage.renderer, this.stage.camera, 1450);
		this.stage.scene.add(this.sparks.getSparks());
		this.background = new Background(this.stage.scene, this.stage.renderer);
		this.animation();
	}

	init({ sectionSelectors, scrollSelector, characterPath, cameraStatePath, onModelLoading }) {
		try {
			if (!sectionSelectors) {
				throw new Error('sectionSelectors is required')
			}

			if (!scrollSelector) {
				throw new Error('scrollSelector is required')
			}

			if (!characterPath) {
				throw new Error('characterPath is required')
			}

			if (!cameraStatePath) {
				throw new Error('cameraStatePath is required')
			}
			if (this.dev) {
				document.querySelector(scrollSelector).style.pointerEvents = 'none'
				this.orbitControls = new DevMode(this.store, this.stage, this.lights, characterPath, cameraStatePath)
			} else {
				new Scroll(this.store, this.stage.camera, { sectionSelectors, scrollSelector, cameraStatePath })

				getModel(characterPath, this.store)
					.then((model) => {
						this.stage.scene.add(model)
					})
					.catch((error) => {
						// eslint-disable-next-line no-console
						console.error('Error getting the model:', error)
					})
			}

			for (const light of this.lights) {
				this.stage.scene.add(light)
			}

			if (typeof onModelLoading === 'function') {
				this.subscribe(({ loadingProgress }) => onModelLoading(loadingProgress), 'loadingProgress')
			}
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error('Error initializing the scene:', error)
		}
	}

	animation() {
		this.stage.renderer.setAnimationLoop((time) => {
			this.stage.camera.updateProjectionMatrix()
			this.stage.camera.updateMatrixWorld(true)

			this.background.animate()
			this.sparks.animate(time)
			if (this.dev) {
				this.orbitControls.update()
			}
			this.stage.renderer.render(this.stage.scene, this.stage.camera)
		})
	}

	modelLoading(callback) {
		this.store.subscribe(({ loadingProgress }) => callback(loadingProgress), 'loadingProgress')
	}

	lockScroll() {
		this.store.lockScroll(true)
	}

	unlockScroll() {
		this.store.lockScroll(false)
	}

	scrollTo(y) {
		this.store.scrollTo(y)
	}

	subscribe(callback, key) {
		this.store.subscribe(callback, key)
	}
}

export default Scene
