/* eslint-disable no-mixed-spaces-and-tabs */
import { store } from './store';

import * as Comlink from 'comlink';

const classDefaults = {
	update() { },
	addContent() { },
	updateContent() { },
}

window.mobileDebug = classDefaults;

import fragmentShader from './shaders/sparks.fragment.glsl'
import vertexShader from './shaders/sparks.vertex.glsl'


class Scene {
	constructor() {

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

		}


	}


	init(options) {
		this.store.setState({ gpuData: { tier: 2 } });
		this.validateInit({ characterClass: 'demon', ...options });
		this.testOffScreen()
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

			this.options = { sectionSelectors, scrollSelector, characterPath, cameraPositionsPath, modelLoading, characterClass };
			this.scrollOptions = { sectionSelectors, scrollSelector, cameraPositionsPath, characterPath };
			this.store.setState({ characterClass: this.options.characterClass })
		} catch (error) {
			throw new Error(error);
		}
	}

}

export default Scene;
