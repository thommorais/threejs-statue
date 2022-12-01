async function onResize() {
	const { default: store } = await import('../store')

	const { sections } = store.getState()

	const scenes = sections.map((t, e) => {
		return 0 === e ? 0 : t.getBoundingClientRect().top + t.getBoundingClientRect().height / 2 - window.innerHeight / 2
	})

	store.setState({ scenes })
}

export default onResize
