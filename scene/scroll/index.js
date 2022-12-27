async function handleScroll(camera, options) {
	const sections = [...(document.querySelectorAll(options.sectionSelectors) || [])]

	const [{ default: smoothScroll }, { default: cameraOnScroll }, { default: store }, { default: onResize }] =
		await Promise.all([import('./smoothScroll'), import('./cameraOnScroll'), import('../store'), import('./onResize')])

	const config = {
		threshold: { desktop: 14, mobile: 30 },
		afterEventTimeout: 200,
		...options,
	}

	store.setState({ sections })

	await smoothScroll(options.scrollSelector, config)
	await cameraOnScroll(camera)
	await onResize()

	document.addEventListener('resize', () => onResize(sections), { passive: false })

	return null
}

export default handleScroll
