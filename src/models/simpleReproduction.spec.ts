import { describe, expect, it } from 'vitest';
import {
	clampSimpleReproductionInput,
	computeSimpleReproduction,
	MAX_DEPT1_CONSTANT_CAPITAL,
	MAX_DEPT1_VARIABLE_CAPITAL,
	MAX_DEPT2_CONSTANT_CAPITAL,
	MAX_DEPT2_VARIABLE_CAPITAL,
	MAX_SURPLUS_VALUE_RATE,
	MIN_CAPITAL,
	MIN_SURPLUS_VALUE_RATE
} from './simpleReproduction';

describe('computeSimpleReproduction', () => {
	it('числовой пример Маркса (4000c+1000v+1000m / 2000c+500v+500m): обмен сбалансирован', () => {
		const result = computeSimpleReproduction({
			c1: 4000,
			v1: 1000,
			c2: 2000,
			v2: 500,
			surplusValueRate: 100
		});

		expect(result.m1).toBe(1000);
		expect(result.w1).toBe(6000);
		expect(result.m2).toBe(500);
		expect(result.w2).toBe(3000);
		expect(result.totalProduct).toBe(9000);

		expect(result.dept1Offer).toBe(2000);
		expect(result.dept2Demand).toBe(2000);
		expect(result.balance).toBeCloseTo(0, 6);
		expect(result.caseType).toBe('balanced');
		expect(result.isBalanced).toBe(true);
	});

	it('если c₂ больше v₁+m₁ — недостаток средств производства для отдела II', () => {
		const result = computeSimpleReproduction({
			c1: 4000,
			v1: 1000,
			c2: 2500,
			v2: 500,
			surplusValueRate: 100
		});

		expect(result.dept1Offer).toBe(2000);
		expect(result.dept2Demand).toBe(2500);
		expect(result.balance).toBeCloseTo(-500, 6);
		expect(result.caseType).toBe('deficit');
		expect(result.isBalanced).toBe(false);
	});

	it('если c₂ меньше v₁+m₁ — избыток средств производства сверх нужд отдела II', () => {
		const result = computeSimpleReproduction({
			c1: 4000,
			v1: 1000,
			c2: 1500,
			v2: 500,
			surplusValueRate: 100
		});

		expect(result.dept1Offer).toBe(2000);
		expect(result.dept2Demand).toBe(1500);
		expect(result.balance).toBeCloseTo(500, 6);
		expect(result.caseType).toBe('surplus');
		expect(result.isBalanced).toBe(false);
	});

	it('норма прибавочной стоимости одинаково действует на оба отдела', () => {
		const result = computeSimpleReproduction({
			c1: 4000,
			v1: 1000,
			c2: 2000,
			v2: 500,
			surplusValueRate: 50
		});

		expect(result.m1).toBe(500);
		expect(result.m2).toBe(250);
		expect(result.w1).toBe(5500);
		expect(result.w2).toBe(2750);
	});

	it('совокупный продукт всегда равен сумме продуктов обоих отделов', () => {
		const result = computeSimpleReproduction({
			c1: 3200,
			v1: 700,
			c2: 1800,
			v2: 900,
			surplusValueRate: 80
		});

		expect(result.totalProduct).toBeCloseTo(result.w1 + result.w2, 6);
		expect(result.w1).toBeCloseTo(result.c1 + result.v1 + result.m1, 6);
		expect(result.w2).toBeCloseTo(result.c2 + result.v2 + result.m2, 6);
	});

	it('clampSimpleReproductionInput отрезает по границам', () => {
		const clamped = clampSimpleReproductionInput({
			c1: MAX_DEPT1_CONSTANT_CAPITAL + 500,
			v1: -100,
			c2: MAX_DEPT2_CONSTANT_CAPITAL + 500,
			v2: -100,
			surplusValueRate: MAX_SURPLUS_VALUE_RATE + 500
		});

		expect(clamped.c1).toBe(MAX_DEPT1_CONSTANT_CAPITAL);
		expect(clamped.v1).toBe(MIN_CAPITAL);
		expect(clamped.c2).toBe(MAX_DEPT2_CONSTANT_CAPITAL);
		expect(clamped.v2).toBe(MIN_CAPITAL);
		expect(clamped.surplusValueRate).toBe(MAX_SURPLUS_VALUE_RATE);

		const tooLow = clampSimpleReproductionInput({
			c1: -500,
			v1: MAX_DEPT1_VARIABLE_CAPITAL + 500,
			c2: -500,
			v2: MAX_DEPT2_VARIABLE_CAPITAL + 500,
			surplusValueRate: MIN_SURPLUS_VALUE_RATE - 500
		});

		expect(tooLow.c1).toBe(MIN_CAPITAL);
		expect(tooLow.v1).toBe(MAX_DEPT1_VARIABLE_CAPITAL);
		expect(tooLow.c2).toBe(MIN_CAPITAL);
		expect(tooLow.v2).toBe(MAX_DEPT2_VARIABLE_CAPITAL);
		expect(tooLow.surplusValueRate).toBe(MIN_SURPLUS_VALUE_RATE);
	});
});
