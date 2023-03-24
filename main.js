import './style.css'

import Scene from './scene'

import './scene/polyfill'


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

let { class: characterClass, dev, fps} = params

if (['barbarian', 'demon', 'mage'].includes(characterClass)) {
	characterClass = characterClass
} else {
	characterClass = 'barbarian'
}

const devMode = dev || false
const showFPS = fps || false

const myScene = new Scene(devMode, showFPS);

myScene.init({
	characterClass,
	characterPath: `${characterClass}/scene.glb`,
	cameraStatePath: `${characterClass}/camera.json`,
	sectionSelectors: '.chapter',
	scrollSelector: '.container-3d'
});

	myScene.store.setState({
		bgTexturePath: 'smoke-o.webp',
	});

myScene.subscribe(({ modelLoadingProgress }) => {

	if (modelLoadingProgress === 100) {
		// myScene.scrollTo({to: 1})
	}


}, 'modelLoadingProgress')
