/**
 * Зависимость стоимости отдельного товара от производительности труда.
 * Капитал, том I, глава I «Товар», § 1.
 *
 * Маркс: «величина стоимости товара изменяется прямо пропорционально количеству
 * и обратно пропорционально производительности труда, находящего в нём своё
 * воплощение». Рабочий день не меняется, значит не меняется и общая масса
 * живого труда за день — вся новая стоимость, которую он создаёт
 * (DAILY_LIVING_LABOUR_VALUE = 1200 рублей, см. composition.ts), остаётся той же.
 * Но при росте производительности за тот же день получается больше штук
 * товара N, и эта фиксированная сумма делится уже на большее количество
 * изделий — новая стоимость каждой отдельной штуки падает.
 *
 * Постоянный капитал — перенесённая стоимость сырья, материалов и снашиваемого
 * при этом оборудования — наоборот, в этой модели пропорционален количеству
 * штук: на каждое изделие уходит одна и та же порция (constantCapitalPerUnit),
 * поэтому его доля в стоимости одной штуки не зависит от производительности.
 *
 * Независимые величины (их двигает пользователь):
 *  - quantity               — N, сколько штук производится за рабочий день;
 *  - constantCapitalPerUnit — c на одну штуку товара (материалы + перенесённая
 *                             стоимость оборудования).
 *
 * Производные: новая стоимость на штуку (v+m)/N, стоимость одной штуки w,
 * перенесённая и новая стоимость за весь день, стоимость всего дневного продукта.
 */

import { DAILY_LIVING_LABOUR_VALUE } from './composition';

/** Один рабочий день — нижняя граница, товар должен быть хотя бы штучным. */
export const MIN_QUANTITY = 1;

/** Верхняя граница слайдера количества — удобно для сетки-визуализации штук. */
export const MAX_QUANTITY = 48;

export const MIN_CONSTANT_CAPITAL_PER_UNIT = 0;
export const MAX_CONSTANT_CAPITAL_PER_UNIT = 100;

export interface ProductivityInput {
	/** N — количество штук товара, произведённых за один рабочий день. */
	quantity: number;
	/** c на одну штуку — перенесённая стоимость материалов и оборудования. */
	constantCapitalPerUnit: number;
}

export interface ProductivityResult {
	quantity: number;
	constantCapitalPerUnit: number;
	/** Новая стоимость, приходящаяся на одну штуку: (v + m) / N. */
	labourValuePerUnit: number;
	/** Стоимость одной штуки товара: w = c + (v + m) / N. */
	unitValue: number;
	/** Перенесённая стоимость постоянного капитала за весь день: N × c. */
	totalConstantCapital: number;
	/** Новая стоимость за весь день — не зависит от N, всегда 1200. */
	totalLabourValue: number;
	/** Стоимость всего дневного продукта: W = N × c + 1200. */
	totalValue: number;
}

export function clampProductivityInput(input: ProductivityInput): ProductivityInput {
	return {
		quantity: Math.min(Math.max(MIN_QUANTITY, Math.round(input.quantity)), MAX_QUANTITY),
		constantCapitalPerUnit: Math.min(
			Math.max(MIN_CONSTANT_CAPITAL_PER_UNIT, input.constantCapitalPerUnit),
			MAX_CONSTANT_CAPITAL_PER_UNIT
		)
	};
}

export function computeProductivity(input: ProductivityInput): ProductivityResult {
	const { quantity, constantCapitalPerUnit } = clampProductivityInput(input);

	const labourValuePerUnit = DAILY_LIVING_LABOUR_VALUE / quantity;
	const unitValue = constantCapitalPerUnit + labourValuePerUnit;
	const totalConstantCapital = quantity * constantCapitalPerUnit;
	const totalLabourValue = DAILY_LIVING_LABOUR_VALUE;
	const totalValue = totalConstantCapital + totalLabourValue;

	return {
		quantity,
		constantCapitalPerUnit,
		labourValuePerUnit,
		unitValue,
		totalConstantCapital,
		totalLabourValue,
		totalValue
	};
}
