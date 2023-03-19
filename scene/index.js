/* eslint-disable no-mixed-spaces-and-tabs */
import Stage from './stage';
import Scroll from './scroll';
import CreateLights from './lights';
import getModel from './model';
import Store from './store';
import Sparks from './sparks';
import Background from './background';

class Scene {
	constructor() {
		this.store = new Store();
		this.stage = new Stage();
		this.background = new Background(this.stage.scene, this.stage.renderer);
		this.lights = new CreateLights();
		this.sparks = new Sparks(this.stage.renderer, this.stage.camera, 250);
		this.stage.scene.add(this.sparks.getSparks());
		this.animation();
	}

	init({
		sectionSelectors,
		scrollSelector,
		characterPath,
		cameraStatePath,
		onModelLoading,
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

			new Scroll(
				this.store,
				this.stage.camera,
				{ sectionSelectors, scrollSelector, cameraStatePath },
			);


			getModel(characterPath, this.store)
				.then((model) => {
					this.stage.scene.add(model);
				})
				.catch((error) => {
					// eslint-disable-next-line no-console
					console.error('Error getting the model:', error);
				});


			for (const light of this.lights) {
				this.stage.scene.add(light);
			}

			if (typeof onModelLoading === 'function') {
				this.subscribe(onModelLoading, 'modelLoadingProgress');
			}
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error('Error initializing the scene:', error);
		}
	}

	animation() {
		this.stage.renderer.setAnimationLoop(() => {
			this.stage.camera.updateProjectionMatrix();
			this.background.animate();
			this.sparks.animate();
			if (this.stage.controls) {
				this.stage.controls.update();
			}
			this.stage.renderer.render(this.stage.scene, this.stage.camera);
		});
	}

	modelLoading(callback) {
		this.store.subscribe(callback, 'modelLoadingProgress');
	}

	lockScroll() {
		this.store.lockScroll(true);
	}

	unlockScroll() {
		this.store.lockScroll(false);
	}

	scrollTo(y) {
		this.store.scrollTo(y);
	}

	subscribe(callback, key) {
		this.store.subscribe(callback, key);
	}
}

export default Scene;
