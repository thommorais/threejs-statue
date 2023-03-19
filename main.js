import './style.css'

import Scene from './scene'

const myScene = new Scene(false);
const deltaEl = document.querySelector('.delta')

myScene.init({
	characterPath: '/angel/scene-1.glb',
	cameraStatePath: '/angel/camera.json',
	sectionSelectors: '.chapter',
	scrollSelector: '.container-3d',
	onModelLoading: (progress) => {
		deltaEl.innerHTML = `progress: ${progress}`
	}
});

