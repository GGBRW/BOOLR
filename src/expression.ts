/** Small arithmetic parser: no eval, JavaScript access, calls, or property traversal. */
export function evaluateExpression(
  source: string,
  variables: Readonly<Record<string, number | string>> = {},
): number {
  if (source.length > 500) throw new Error('Expression is too long');
  const tokens =
    source.match(/(?:\d+(?:\.\d*)?|\.\d+)|[a-zA-Z_'`´][a-zA-Z_'`´]*|[()+*/%^-]/g) ?? [];
  if (tokens.join('') !== source.replace(/\s/g, '')) throw new Error('Invalid expression');
  let index = 0;
  const peek = () => tokens[index];
  const take = () => tokens[index++];
  function primary(): number {
    const token = take();
    if (token === '(') {
      const value = sum();
      if (take() !== ')') throw new Error('Missing closing parenthesis');
      return value;
    }
    if (token === '+' || token === '-') return (token === '-' ? -1 : 1) * primary();
    if (!token) throw new Error('Expected a number');
    const value = /^[\d.]/.test(token)
      ? Number(token)
      : Object.hasOwn(variables, token)
        ? Number(variables[token])
        : NaN;
    if (!Number.isFinite(value)) throw new Error('Unknown variable or invalid number');
    return value;
  }
  function product(): number {
    let value = primary();
    while (['*', '/', '%'].includes(peek() ?? '')) {
      const op = take();
      const right = primary();
      value = op === '*' ? value * right : op === '/' ? value / right : value % right;
    }
    return value;
  }
  function sum(): number {
    let value = product();
    while (peek() === '+' || peek() === '-') {
      const op = take();
      const right = product();
      value = op === '+' ? value + right : value - right;
    }
    return value;
  }
  const value = sum();
  if (index !== tokens.length || !Number.isFinite(value))
    throw new Error('Invalid arithmetic expression');
  return value;
}
