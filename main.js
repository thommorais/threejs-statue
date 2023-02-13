import './style.css'

import main from './scene/index'
	; (async () => {
		const api = await main({
			character: 'barbarian',
			sectionSelectors: '.chapter',
			scrollSelector: '.container-3d',
			onModelLoading: (percentage) => console.log(percentage),
		})
	})()
