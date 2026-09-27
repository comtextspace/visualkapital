#!/usr/bin/env node
/**
 * Проверяет, что каждая страница (+page.svelte) действительно попала в
 * статическую сборку — то есть что prerender-кроулер её нашёл (значит, на
 * неё есть достижимая ссылка, начиная с "/"), и что рендер не упал с ошибкой.
 *
 * Без этой проверки забытая ссылка на новую страницу в оглавлении означала
 * бы, что страница просто не попадает ни в билд, ни в этот тест — незаметно
 * для `npm test`.
 */

import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const routesDir = join(projectRoot, 'src', 'routes');
const buildDir = join(projectRoot, 'build');

/** Рекурсивно находит все директории, содержащие +page.svelte. */
function findPageDirs(dir) {
	const result = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const entryPath = join(dir, entry.name);
		if (entry.isDirectory()) {
			result.push(...findPageDirs(entryPath));
		} else if (entry.name === '+page.svelte') {
			result.push(dir);
		}
	}
	return result;
}

if (!existsSync(buildDir)) {
	console.error('✗ build/ не найден — сначала выполните `vite build` (см. npm run build).');
	process.exit(1);
}

const pageDirs = findPageDirs(routesDir);

if (pageDirs.length === 0) {
	console.error('✗ Не найдено ни одной страницы (+page.svelte) — проверьте src/routes.');
	process.exit(1);
}

const missing = [];

for (const dir of pageDirs) {
	const routeRel = relative(routesDir, dir).split(sep).join('/');
	const expectedHtml =
		routeRel === '' ? join(buildDir, 'index.html') : join(buildDir, routeRel, 'index.html');

	const ok = existsSync(expectedHtml) && statSync(expectedHtml).size > 0;
	if (!ok) {
		missing.push(routeRel === '' ? '/' : `/${routeRel}`);
	}
}

if (missing.length > 0) {
	console.error(
		`\n✗ ${missing.length} из ${pageDirs.length} страниц не попали в собранный сайт` +
			' (нет непустого index.html в build/ — скорее всего, забыта ссылка из оглавления,' +
			' либо страница падает при рендере):\n' +
			missing.map((route) => `  - ${route}`).join('\n') +
			'\n'
	);
	process.exit(1);
}

console.log(
	`✓ Все ${pageDirs.length} страниц найдены в build/ — prerender прошёл по каждой без ошибок.`
);
