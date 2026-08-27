/** Форматирование чисел в общем стиле сайта: русская локаль, без лишних нулей. */
export function formatNumber(value: number, fractionDigits = 0): string {
	return value.toLocaleString('ru-RU', {
		minimumFractionDigits: 0,
		maximumFractionDigits: fractionDigits
	});
}

export function formatPercent(value: number, fractionDigits = 0): string {
	return `${formatNumber(value, fractionDigits)}%`;
}
