
import FasScene from './offscreen/scene'

export function offScreen({ width, height, pixelRatio, offscreen, state, options}) {
	new FasScene(width, height, pixelRatio, offscreen, state, options)
	return 'working'
}