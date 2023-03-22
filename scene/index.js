/* eslint-disable no-mixed-spaces-and-tabs */
import Stage from './stage'
import Scroll from './scroll'
import CreateLights from './lights'
import getModel from './model'
import Store from './store'
import Background from './background'
import Sparks from './sparks'

// import Dev from './dev'


class Scene {
	constructor() {
		this.store = new Store()
		this.stage = new Stage()
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

			this.background = new Background(this.stage.scene, this.stage.renderer)
			this.sparks = new Sparks(this.stage, 0)

			if (typeof onModelLoading === 'function') {
				this.subscribe(({ loadingProgress }) => onModelLoading(loadingProgress), 'loadingProgress')
			}

			this.animation()

		} catch (error) {
			console.error('Error initializing the scene:', error)
		}
	}

	animation() {

		this.stage.renderer.setAnimationLoop((time) => {

			this.sparks.update(time)

			if (this.background) {
				this.background.animate()
			}

			this.stage.camera.updateProjectionMatrix()
			this.stage.camera.updateMatrixWorld(true)

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
