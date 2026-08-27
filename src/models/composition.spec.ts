import { describe, expect, it } from 'vitest';
import {
	clampValueCompositionInput,
	computeValueComposition,
	DAILY_LIVING_LABOUR_VALUE,
	MAX_CONSTANT_CAPITAL,
	MIN_SURPLUS_VALUE,
	MIN_VARIABLE_CAPITAL
} from './composition';

describe('computeValueComposition', () => {
	it('v + m всегда равно дневной стоимости живого труда (12ч × 100р = 1200)', () => {
		const a = computeValueComposition({ c: 0, v: 300 });
		const b = computeValueComposition({ c: 500, v: 900 });

		expect(a.v + a.m).toBe(DAILY_LIVING_LABOUR_VALUE);
		expect(b.v + b.m).toBe(DAILY_LIVING_LABOUR_VALUE);
	});

	it('рост v уменьшает m на ту же величину', () => {
		const result = computeValueComposition({ c: 0, v: 700 });
		expect(result.m).toBe(DAILY_LIVING_LABOUR_VALUE - 700);
	});

	it("норма прибавочной стоимости m' = m / v · 100", () => {
		const result = computeValueComposition({ c: 0, v: 600 });
		expect(result.m).toBe(600);
		expect(result.mRate).toBeCloseTo(100, 5);
	});

	it('W = c + v + m = c + 1200 — постоянный капитал не входит в v + m', () => {
		const result = computeValueComposition({ c: 800, v: 600 });
		expect(result.w).toBe(800 + DAILY_LIVING_LABOUR_VALUE);
	});

	it('не даёт v уйти в ноль или в минус, а c — за границы 0..2000', () => {
		const negative = computeValueComposition({ c: -100, v: -5 });
		expect(negative.c).toBe(0);
		expect(negative.v).toBe(MIN_VARIABLE_CAPITAL);

		const tooHigh = computeValueComposition({ c: 5000, v: 5000 });
		expect(tooHigh.c).toBe(MAX_CONSTANT_CAPITAL);
		expect(tooHigh.v).toBe(DAILY_LIVING_LABOUR_VALUE - MIN_SURPLUS_VALUE);
		expect(tooHigh.m).toBe(MIN_SURPLUS_VALUE);
	});

	it('не даёт и m уйти в ноль — v зажимается раньше верхней границы', () => {
		const result = computeValueComposition({ c: 0, v: DAILY_LIVING_LABOUR_VALUE });
		expect(result.m).toBeGreaterThan(0);
		expect(result.m).toBe(MIN_SURPLUS_VALUE);
	});

	it('clampValueCompositionInput отрезает значения по границам', () => {
		const clamped = clampValueCompositionInput({ c: -10, v: -10 });
		expect(clamped.c).toBe(0);
		expect(clamped.v).toBe(MIN_VARIABLE_CAPITAL);
	});
});
