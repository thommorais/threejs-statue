import './style.css'

import main from './scene'
;(async () => {
	const api = await main({
		character: 'angel',
		sectionSelectors: '.chapter',
		scrollSelector: '.container-3d',
		onModelLoading: console.log,
	})
})()
