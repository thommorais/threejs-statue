import glsl from 'vite-plugin-glsl'
import { defineConfig } from 'vite'
import { comlink } from 'vite-plugin-comlink'

export default defineConfig({
	plugins: [glsl(), comlink()
	],
	worker: {
		plugins: [
		  comlink()
		]
	  },
	build: {
		target: 'esnext',
		polyfillModulePreload: false,
	},
})


