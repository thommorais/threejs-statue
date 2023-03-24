/* eslint-disable no-mixed-spaces-and-tabs */
import Stage from './stage';
import Scroll from './scroll';
import CreateLights from './lights';
import getModel from './model';
import Store from './store';
import Background from './background';
import Sparks from './sparks';
import Dev from './dev';

class Scene {
	constructor(devMode = false) {
		this.store = new Store();
		window.fsStore = this.store;
		this.stage = new Stage();
		this.devMode = devMode;
	}

	init({
		sectionSelectors, scrollSelector, characterPath, cameraStatePath, characterClass, modelLoading,
	}) {
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

			if (this.devMode) {
				this.dev = new Dev(this.store, this.stage, characterPath, cameraStatePath);
				this.store.setState({ characterClass });
			} else {
				// eslint-disable-next-line max-len, no-new
				new Scroll(this.store, this.stage.camera, { sectionSelectors, scrollSelector, cameraStatePath });

				getModel(characterPath, this.store)
					.then((model) => {
						try {
							this.lights = new CreateLights(this.store);
							for (const light of this.lights) {
								light.target = model;
								this.stage.scene.add(light);
							}
						} catch (error) {
							// eslint-disable-next-line no-console
							console.error('Error adding lights:', error);
						} finally {
							this.store.setState({ characterClass });
							this.stage.scene.add(model);
						}
					})
					.catch((error) => {
						// eslint-disable-next-line no-console
						console.error('Error getting the model:', error);
					});

			}


			this.background = new Background(this.stage.scene, this.store);
			this.sparks = new Sparks(this.stage, this.store);

			this.animation();
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error('Error initializing the scene:', error);
		}
	}

	animation() {
		this.stage.renderer.setAnimationLoop((time) => {
			if (this.sparks) {
				this.sparks.update(time);
			}

			if (this.background) {
				this.background.animate();
			}

			this.stage.camera.updateProjectionMatrix();
			this.stage.camera.updateMatrixWorld(true);

			this.stage.renderer.render(this.stage.scene, this.stage.camera);
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
