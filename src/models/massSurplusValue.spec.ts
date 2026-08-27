import { describe, expect, it } from 'vitest';
import {
	clampMassSurplusValueInput,
	computeMassSurplusValue,
	MAX_WORKERS,
	MIN_WORKERS
} from './massSurplusValue';
import { DAILY_LIVING_LABOUR_VALUE, MIN_SURPLUS_VALUE, MIN_VARIABLE_CAPITAL } from './composition';

describe('computeMassSurplusValue', () => {
	it('норма прибавочной стоимости не зависит от числа рабочих', () => {
		const few = computeMassSurplusValue({ workers: 1, v: 600, c: 0 });
		const many = computeMassSurplusValue({ workers: 30, v: 600, c: 0 });

		expect(few.mRate).toBeCloseTo(many.mRate, 5);
	});

	it('масса прибавочной стоимости растёт прямо пропорционально числу рабочих', () => {
		const ten = computeMassSurplusValue({ workers: 10, v: 800, c: 0 });
		const twenty = computeMassSurplusValue({ workers: 20, v: 800, c: 0 });

		expect(ten.m).toBe(400);
		expect(ten.totalM).toBe(4000);
		expect(twenty.totalM).toBe(ten.totalM * 2);
	});

	it('totalW = totalC + totalV + totalM', () => {
		const result = computeMassSurplusValue({ workers: 5, v: 700, c: 100 });
		expect(result.totalC).toBe(500);
		expect(result.totalV).toBe(3500);
		expect(result.totalM).toBe(2500);
		expect(result.totalW).toBe(result.totalC + result.totalV + result.totalM);
	});

	it('не даёт числу рабочих выйти за границы 1..60', () => {
		const tooFew = computeMassSurplusValue({ workers: 0, v: 600, c: 0 });
		expect(tooFew.workers).toBe(MIN_WORKERS);

		const tooMany = computeMassSurplusValue({ workers: 1000, v: 600, c: 0 });
		expect(tooMany.workers).toBe(MAX_WORKERS);
	});

	it('не даёт v или m на одного рабочего уйти в ноль', () => {
		const result = computeMassSurplusValue({
			workers: 3,
			v: DAILY_LIVING_LABOUR_VALUE,
			c: 0
		});
		expect(result.m).toBe(MIN_SURPLUS_VALUE);

		const negative = computeMassSurplusValue({ workers: 3, v: -50, c: 0 });
		expect(negative.v).toBe(MIN_VARIABLE_CAPITAL);
	});

	it('clampMassSurplusValueInput округляет число рабочих и отрезает по границам', () => {
		const clamped = clampMassSurplusValueInput({ workers: 4.7, v: 600, c: -10 });
		expect(clamped.workers).toBe(5);
		expect(clamped.c).toBe(0);
	});
});
