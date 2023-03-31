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

let { class: characterClass, dev, fps } = params

if (['barbarian', 'demon', 'mage'].includes(characterClass)) {
	characterClass = characterClass
} else {
	characterClass = 'barbarian'
}

const characterPath = `${characterClass}/scene.glb`

try {
	const myScene = new Scene();

	myScene.init({
		characterClass,
		characterPath,
		cameraPositionsPath: `${characterClass}/camera.json`,
		sectionSelectors: '.chapter',
		scrollSelector: '.container-3d'
	});

	myScene.store.setState({
		bgTexturePath: 'smoke-o.webp',
	});

	myScene.subscribe(({ modelLoadingProgress, modelAdded }) => {
		if (modelLoadingProgress === 100 && modelAdded) {
			myScene.unLockScroll()

			myScene.setCameraPose({ from: 0, to: 1 }).then(() => {
				myScene.unLockScroll()
			})



			// myScene.setSectionScroll({ from: 4, to: 2, duration: 500 }).then(({ cameraCurrentPose, sectionCurrent }) => {
			// 	console.log(cameraCurrentPose, sectionCurrent)
			// })

		}
	}, ['modelLoadingProgress', 'modelAdded'])

} catch (e) {
	alert(e)
}