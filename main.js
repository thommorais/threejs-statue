import './style.css'

async function main({ selector, afterEventTimeout, character, onModelLoading }) {
	const { default: store } = await import('./store')
	const { default: scene } = await import('./scene/scene')
	const { default: getModelOption } = await import('./scene/modelOptions')

	store.subscribe(onModelLoading, 'modelLoadingProgress')
	store.setState({ character })

	const characterData = await getModelOption(character)

	const theaterAPI = await scene({
		character: characterData,
		selector,
		afterEventTimeout,
	})

	return {
		...theaterAPI,
		subscribe: store.subscribe,
	}
}

;(async () => {
	const api = await main({
		character: 'angel',
		selector: '.chapter',
		afterEventTimeout: 210,
		onModelLoading: console.log,
	})
})()
