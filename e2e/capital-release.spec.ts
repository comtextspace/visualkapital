import { expect, test } from '@playwright/test';

/**
 * Схема "Высвобождение оборотного капитала" (Том II, глава XV):
 * при изменении слайдеров рабочего периода `w` и периода обращения `z`
 * должен корректно переключаться разбираемый случай (w > z / w = z / w < z).
 */

test.beforeEach(async ({ page }) => {
	await page.goto('/tom-2/vysvobozhdenie-kapitala');
});

test('по умолчанию рабочий период больше периода обращения', async ({ page }) => {
	await expect(page.getByText('Рабочий период больше периода обращения:')).toBeVisible();
});

test('слайдеры позволяют получить случай равенства без высвобождения', async ({ page }) => {
	await page.locator('#slider-w').fill('5');
	await page.locator('#slider-z').fill('5');

	await expect(page.getByText('Рабочий период равен периоду обращения:')).toBeVisible();
	await expect(page.getByText('Доли капитала сменяют друг друга без остатка')).toBeVisible();
});

test('слайдеры позволяют получить случай, когда рабочий период меньше периода обращения', async ({
	page
}) => {
	await page.locator('#slider-w').fill('3');
	await page.locator('#slider-z').fill('7');

	await expect(page.getByText('Рабочий период меньше периода обращения:')).toBeVisible();
});
