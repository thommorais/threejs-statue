import './style.css'

import main from './scene/index'
	; (async () => {
		const api = await main({
			character: 'human-mage',
			sectionSelectors: '.chapter',
			scrollSelector: '.container-3d',
			onModelLoading: (percentage) => percentage,
		})
	})()
