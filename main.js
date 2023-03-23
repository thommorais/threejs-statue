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

let { class: characterClass } = params

if (['barbarian', 'demon', 'mage'].includes(characterClass)) {
	characterClass = characterClass
} else {
	characterClass = 'barbarian'
}

const myScene = new Scene(false);

myScene.init({
	characterPath: `${characterClass}/scene.glb`,
	cameraStatePath: `${characterClass}/camera.json`,
	sectionSelectors: '.chapter',
	scrollSelector: '.container-3d',
	characterClass,
});

setTimeout(() => {
	myScene.scrollTo({ to: 1, from: 0})
}, 3000)