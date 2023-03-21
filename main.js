import './style.css'

import Scene from './scene'

import './scene/polyfill'

const myScene = new Scene();

myScene.init({
	characterPath: 'fallen-angel/scene-2.glb',
	cameraStatePath: 'fallen-angel/camera.json',
	sectionSelectors: '.chapter',
	scrollSelector: '.container-3d',
});

