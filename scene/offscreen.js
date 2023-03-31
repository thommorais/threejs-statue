
import FasScene from './offscreen/scene'

export function offScreen({ width, height, pixelRatio, offscreen, state, options, sparksShaders}) {
	new FasScene(width, height, pixelRatio, offscreen, state, options, sparksShaders)
	return 'working'
}