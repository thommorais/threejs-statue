import glsl from 'vite-plugin-glsl'
import { defineConfig } from 'vite'
import { comlink } from 'vite-plugin-comlink'

export default defineConfig({
	plugins: [
		glsl(),
		comlink(),
		{
			name: "isolation",
			configureServer(server) {
				server.middlewares.use((_req, res, next) => {
					res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
					res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
					next();
				});
			},
		},
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


