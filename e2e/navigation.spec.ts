import { expect, test } from '@playwright/test';

/**
 * Смоук-тест: главная страница должна дать ссылки на все схемы, и каждая
 * схема должна открываться без ошибок в консоли и без необработанных
 * page-error (то есть без исключений при гидратации Svelte-компонентов).
 *
 * Список страниц собирается динамически со страницы "/", а не хардкодится —
 * так тест не отстаёт от реального оглавления.
 */

test('главная страница даёт ссылки на все схемы, и каждая открывается без ошибок', async ({
	page
}) => {
	const consoleErrors: string[] = [];
	const pageErrors: string[] = [];
	page.on('console', (msg) => {
		if (msg.type() === 'error') consoleErrors.push(msg.text());
	});
	page.on('pageerror', (err) => pageErrors.push(err.message));

	await page.goto('/');
	await expect(page.locator('h1')).toBeVisible();

	const hrefs = await page
		.locator('a[href^="/tom-"]')
		.evaluateAll((links) => links.map((a) => a.getAttribute('href')));

	expect(hrefs.length).toBeGreaterThan(0);

	for (const href of hrefs) {
		await page.goto(href!);
		await expect(page.locator('h1')).toBeVisible();
	}

	expect(consoleErrors, `консольные ошибки: ${consoleErrors.join('\n')}`).toEqual([]);
	expect(pageErrors, `необработанные ошибки страницы: ${pageErrors.join('\n')}`).toEqual([]);
});

test('оглавление содержит оба тома', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('Том I. Процесс производства капитала')).toBeVisible();
	await expect(page.getByText('Том II. Процесс обращения капитала')).toBeVisible();
});
