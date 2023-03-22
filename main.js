import './style.css'

import Scene from './scene'

import './scene/polyfill'

const myScene = new Scene(true);

myScene.init({
	characterPath: 'human-mage/scene.glb',
	cameraStatePath: 'human-mage/camera.json',
	sectionSelectors: '.chapter',
	scrollSelector: '.container-3d',
});

