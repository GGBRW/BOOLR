import { describe, expect, test } from 'bun:test';
import { evaluateLogicExpression, validateLogicExpression } from './logic-expression';

describe('procedural logic expressions', () => {
  test('evaluates A/B operators with precedence', () => {
    expect(evaluateLogicExpression('A ^ B', true, true).value).toBe(false);
    expect(evaluateLogicExpression('A ^ B', true, false).value).toBe(true);
    expect(evaluateLogicExpression('A && !B', true, false).value).toBe(true);
    expect(evaluateLogicExpression('A || B && B', false, true).value).toBe(true);
    expect(evaluateLogicExpression('!(A && B)', true, false).value).toBe(true);
  });

  test('accepts aliases, literals and parentheses', () => {
    expect(evaluateLogicExpression('A and not B', true, false).value).toBe(true);
    expect(evaluateLogicExpression('1', false, false).value).toBe(true);
    expect(evaluateLogicExpression('(A == B) || 0', true, true).value).toBe(true);
    expect(validateLogicExpression('A != B').valid).toBe(true);
  });

  test('rejects unsafe or incomplete input without executing it', () => {
    expect(validateLogicExpression('alert(1)').valid).toBe(false);
    expect(validateLogicExpression('A; B').valid).toBe(false);
    expect(validateLogicExpression('A &&').valid).toBe(false);
    expect(validateLogicExpression('(A || B').valid).toBe(false);
    expect(validateLogicExpression('').valid).toBe(false);
  });
});
