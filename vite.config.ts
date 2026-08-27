import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';

// Сайт раздаётся с собственного домена visualkapital.comtext.space (см. static/CNAME),
// поэтому base остаётся пустым — путь /<repo>/ нужен только при деплое на
// github.io/<repo>/ без своего домена. BASE_PATH можно задать в окружении сборки,
// если понадобится вернуться к такому варианту; значение обязано начинаться с "/".
const base = (process.env.BASE_PATH || '') as '' | `/${string}`;

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			paths: { base },
			prerender: { entries: ['*'] }
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
