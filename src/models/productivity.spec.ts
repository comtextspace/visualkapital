import { describe, expect, it } from 'vitest';
import {
	clampProductivityInput,
	computeProductivity,
	MAX_CONSTANT_CAPITAL_PER_UNIT,
	MAX_QUANTITY,
	MIN_QUANTITY
} from './productivity';
import { DAILY_LIVING_LABOUR_VALUE } from './composition';

describe('computeProductivity', () => {
	it('новая стоимость за весь день не зависит от количества штук N', () => {
		const a = computeProductivity({ quantity: 1, constantCapitalPerUnit: 10 });
		const b = computeProductivity({ quantity: 24, constantCapitalPerUnit: 10 });

		expect(a.totalLabourValue).toBe(DAILY_LIVING_LABOUR_VALUE);
		expect(b.totalLabourValue).toBe(DAILY_LIVING_LABOUR_VALUE);
	});

	it('рост производительности (N) снижает новую стоимость одной штуки обратно пропорционально', () => {
		const slow = computeProductivity({ quantity: 12, constantCapitalPerUnit: 0 });
		const fast = computeProductivity({ quantity: 24, constantCapitalPerUnit: 0 });

		expect(slow.labourValuePerUnit).toBeCloseTo(100, 5);
		expect(fast.labourValuePerUnit).toBeCloseTo(50, 5);
		expect(fast.labourValuePerUnit).toBeCloseTo(slow.labourValuePerUnit / 2, 5);
	});

	it('перенесённая стоимость постоянного капитала на штуку не зависит от N', () => {
		const slow = computeProductivity({ quantity: 4, constantCapitalPerUnit: 15 });
		const fast = computeProductivity({ quantity: 40, constantCapitalPerUnit: 15 });

		expect(slow.constantCapitalPerUnit).toBe(15);
		expect(fast.constantCapitalPerUnit).toBe(15);
	});

	it('стоимость всего дневного продукта растёт вместе с N за счёт постоянного капитала', () => {
		const result = computeProductivity({ quantity: 10, constantCapitalPerUnit: 20 });
		expect(result.totalConstantCapital).toBe(200);
		expect(result.totalValue).toBe(200 + DAILY_LIVING_LABOUR_VALUE);
	});

	it('не даёт N уйти ниже 1 или выше верхней границы', () => {
		const tooLow = computeProductivity({ quantity: 0, constantCapitalPerUnit: 0 });
		expect(tooLow.quantity).toBe(MIN_QUANTITY);

		const tooHigh = computeProductivity({ quantity: 1000, constantCapitalPerUnit: 0 });
		expect(tooHigh.quantity).toBe(MAX_QUANTITY);
	});

	it('clampProductivityInput округляет N и отрезает постоянный капитал по границам', () => {
		const clamped = clampProductivityInput({ quantity: 5.6, constantCapitalPerUnit: -10 });
		expect(clamped.quantity).toBe(6);
		expect(clamped.constantCapitalPerUnit).toBe(0);

		const clampedHigh = clampProductivityInput({ quantity: 1, constantCapitalPerUnit: 99999 });
		expect(clampedHigh.constantCapitalPerUnit).toBe(MAX_CONSTANT_CAPITAL_PER_UNIT);
	});
});
