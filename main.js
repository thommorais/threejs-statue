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
// const isMobile = () => {


// 	const { userAgent, platform, maxTouchPoints } = window.navigator;

// 	const isIOS = /(iphone|ipod|ipad)/i.test(userAgent);

// 	// Workaround for ipadOS, force detection as tablet
// 	// SEE: https://github.com/lancedikson/bowser/issues/329
// 	// SEE: https://stackoverflow.com/questions/58019463/how-to-detect-device-name-in-safari-on-ios-13-while-it-doesnt-show-the-correct
// 	const isIpad =
// 		platform === 'iPad' ||
// 		// @ts-expect-error window.MSStream is non standard
// 		(platform === 'MacIntel' && maxTouchPoints > 0 && !window.MSStream);

// 	const isAndroid = /android/i.test(userAgent);

// 	return isAndroid || isIOS || isIpad
// }


const params = getQueryParams(document.location.search)

let { class: characterClass } = params

if (['barbarian', 'fallenAngel', 'mage'].includes(characterClass)) {
	characterClass = characterClass
} else {
	characterClass = 'barbarian'
}



try {

	const myScene = new Scene()
	const btns = [...document.querySelectorAll('.character-selector')]

	btns.forEach((btn) => {

		if (btn.dataset.character === characterClass) {
			btn.classList.add('active')
		}

		btn.addEventListener('click', () => {
			const { character } = btn.dataset
			if (character) {
				myScene.clearMemory().then(() => {
					window.location.href = `?class=${character}`
				})
			}
		})
	})

	myScene.init({
		characterClass,
		characterPath: `oo/oo-${characterClass}.glb`,
		optimizedCharacterPath: `oo/oo-${characterClass}-opt.glb`,
		cameraPositionsPath: `${characterClass}/camera.json`,
		sectionSelectors: '.chapter',
		scrollSelector: '.container-3d',
	})

	myScene.store.setState({
		bgTexturePath: 'smoke-o.webp',
	})

	myScene.subscribe(
		({ modelLoadingProgress, modelAdded }) => {
			if (modelLoadingProgress === 100 && modelAdded) {
				setTimeout(() => {
					myScene.setCameraPose({ from: 0, to: 1 });
				}, 250);
			}
		},
		['modelLoadingProgress', 'modelAdded'],
	)


	myScene.subscribe(({
		sections, sectionCurrent, cameraTransitionComplete,
	}) => {

		if (sections) {

			sections.forEach((section) => {
				section.style.setProperty('--opacity', '0');
				section.classList.remove('active');
			});

			const currentSection = sections[sectionCurrent]
			if (cameraTransitionComplete && currentSection) {
				sections[sectionCurrent].style.setProperty('--opacity', '1');
				sections[sectionCurrent].classList.add('active');
			}

		}
	}, ['sections', 'sectionCurrent', 'cameraTransitionComplete']);


} catch (e) {
	console.log(e)
}
