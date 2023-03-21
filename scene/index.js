/* eslint-disable no-mixed-spaces-and-tabs */
import Stage from './stage'
import Scroll from './scroll'
import CreateLights from './lights'
import getModel from './model'
import Store from './store'
import Sparks from './sparks'
import Background from './background'





const SPARKS_LAYER = 1;

class Scene {
	constructor() {
		this.store = new Store()
		this.stage = new Stage()


		this.animation()
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
			new Scroll(this.store, this.stage.camera, { sectionSelectors, scrollSelector, cameraStatePath })

			getModel(characterPath, this.store)
				.then((model) => {
					this.lights = new CreateLights()

					for (const light of this.lights) {
						light.target = model
						this.stage.scene.add(light)
					}

					this.stage.scene.add(model)
				})
				.catch((error) => {
					console.error('Error getting the model:', error)
				})
			this.stage.camera.layers.enable(SPARKS_LAYER);


			this.background = new Background(this.stage.scene, this.stage.renderer)

			this.sparks = new Sparks(this.stage.renderer, this.stage.camera)
			this.stage.scene.add(this.sparks.getSparks())


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


			if (this.background) {
				this.background.animate()
			}

			if (this.sparks) {
				this.sparks.animate(time)
			}

			this.stage.renderer.render(this.stage.scene, this.stage.camera)
		})
	}

	modelLoading(callback) {
		if (typeof callback !== 'function') {
			this.store.subscribe(({ loadingProgress }) => callback(loadingProgress), 'loadingProgress')
		}
	}

	lockScroll() {
		this.store.lockScroll()
	}

	unlockScroll() {
		this.store.unlockScroll()
	}

	scrollTo(y) {
		this.store.scrollTo(y)
	}

	subscribe(callback, key) {
		this.store.subscribe(callback, key)
	}
}

export default Scene
