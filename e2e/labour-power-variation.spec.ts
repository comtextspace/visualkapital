import { expect, test } from '@playwright/test';

/**
 * Схема "Изменение стоимости рабочей силы и прибавочной стоимости"
 * (Том I, глава XV): переключение вкладок-законов должно блокировать два
 * слайдера из трёх и менять заголовок/подсказку; активный слайдер должен
 * реально пересчитывать таблицу показателей.
 */

test.beforeEach(async ({ page }) => {
	await page.goto('/tom-1/izmenenie-stoimosti-rabochey-sily');
});

test('по умолчанию активен закон I, остальные слайдеры отключены', async ({ page }) => {
	await expect(page.getByRole('tab', { name: 'Закон I · производительность' })).toHaveAttribute(
		'aria-selected',
		'true'
	);
	await expect(page.locator('#slider-productivity')).toBeEnabled();
	await expect(page.locator('#slider-intensity')).toBeDisabled();
	await expect(page.locator('#slider-workday')).toBeDisabled();
});

test('переключение на закон II меняет заголовок и активный слайдер', async ({ page }) => {
	await page.getByRole('tab', { name: 'Закон II · интенсивность' }).click();

	await expect(page.getByRole('tab', { name: 'Закон II · интенсивность' })).toHaveAttribute(
		'aria-selected',
		'true'
	);
	await expect(page.getByText('Закон II: интенсивность труда переменна')).toBeVisible();
	await expect(page.locator('#slider-intensity')).toBeEnabled();
	await expect(page.locator('#slider-productivity')).toBeDisabled();
	await expect(page.locator('#slider-workday')).toBeDisabled();
});

test('движение слайдера интенсивности увеличивает m, но не трогает v', async ({ page }) => {
	await page.getByRole('tab', { name: 'Закон II · интенсивность' }).click();

	const vCell = page.locator('tr', { hasText: 'стоимость рабочей силы' }).locator('td.font-mono');
	const mCell = page.locator('tr', { hasText: 'прибавочная стоимость' }).locator('td.font-mono');

	await expect(vCell).toHaveText('600');
	await expect(mCell).toHaveText('600');

	await page.locator('#slider-intensity').fill('1.5');

	await expect(vCell).toHaveText('600');
	await expect(mCell).toHaveText(/1\s?200/);
});

test('движение слайдера длины дня в законе III не меняет необходимое время', async ({ page }) => {
	await page.getByRole('tab', { name: 'Закон III · длина дня' }).click();

	const necessaryCell = page
		.locator('tr', { hasText: 'необходимое время' })
		.locator('td.font-mono');

	await expect(necessaryCell).toHaveText('6');

	await page.locator('#slider-workday').fill('10');

	await expect(necessaryCell).toHaveText('6');
});
