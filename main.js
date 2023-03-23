import './style.css'

import Scene from './scene'

import './scene/polyfill'

const myScene = new Scene(false);

myScene.init({
	characterPath: 'barbarian/scene.glb',
	cameraStatePath: 'barbarian/camera.json',
	sectionSelectors: '.chapter',
	scrollSelector: '.container-3d',
});

