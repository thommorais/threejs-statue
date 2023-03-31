import './style.css'

import Scene from './scene'

import './scene/polyfill'

const getQueryParams = (qs) => {
	qs = qs.split('+').join(' ')
	var params = {},
		tokens,
		re = /[?&]?([^=]+)=([^&]*)/g
	while ((tokens = re.exec(qs))) {
		params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2])
	}
	return params
}

const params = getQueryParams(document.location.search)

let { class: characterClass, dev, fps } = params

if (['barbarian', 'demon', 'mage'].includes(characterClass)) {
	characterClass = characterClass
} else {
	characterClass = 'barbarian'
}

const characterPath = `${characterClass}/scene.glb`

const scrollToTop = document.querySelector('.scrollToTop')

try {
	const myScene = new Scene()

	myScene.init({
		characterClass,
		characterPath,
		cameraPositionsPath: `${characterClass}/camera.json`,
		sectionSelectors: '.chapter',
		scrollSelector: '.container-3d',
	})

	myScene.store.setState({
		bgTexturePath: 'smoke-o.webp',
	})

	myScene.subscribe(
		({ modelLoadingProgress }) => {
			if (modelLoadingProgress === 100) {

				myScene
				.setCameraPose({ from: 0, to: 1 })
				.then(myScene.unLockScroll.bind(myScene))

				scrollToTop.addEventListener('click', () => {
					myScene
					.setScenePose({ from: 4, to: 0, duration: 500, camera: { from: 5, to: 1 }, ignoreCameraCurrentState: true })
					.then(myScene.unLockScroll.bind(myScene))
				})

			}
		},
		['modelLoadingProgress'],
	)


    myScene.subscribe(({
		sections, sectionCurrent, cameraTransitionComplete, scrollingStarted,
	}) => {

		console.log({cameraTransitionComplete, scrollingStarted})


		if (sections) {

		  if (scrollingStarted) {
			sections.forEach((section) => {
			  section.style.setProperty('--opacity', '0');
			  section.classList.remove('active');
			});
		  }

		  if (cameraTransitionComplete) {
			sections[sectionCurrent].style.setProperty('--opacity', '1');
			sections[sectionCurrent].classList.add('active');
		  }

		}
	  }, ['sections', 'sectionCurrent', 'cameraTransitionComplete', 'scrollingStarted']);

} catch (e) {
	alert(e)
}
