import './style.css'

async function main() {
	const { default: scene } = await import('./scene/scene')
	const theaterAPI = await scene()

	theaterAPI.init({
		selector: '.chapter',
		afterEventTimeout: 210,
	})
}

requestIdleCallback(main)
