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

let { class: characterClass } = params

if (['barbarian', 'fallenAngel', 'mage'].includes(characterClass)) {
	characterClass = characterClass
} else {
	characterClass = 'barbarian'
}

const characterPath = `oo/${characterClass}.glb`


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


	const clearMemoryBTN = document.querySelector('.clearMemory')

	clearMemoryBTN.addEventListener('click', () => {
		myScene.clearMemory()
	})

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
				setTimeout(() => {
					myScene.setCameraPose({ from: 0, to: 1 });
				}, 250);
			}
		},
		['modelLoadingProgress'],
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
