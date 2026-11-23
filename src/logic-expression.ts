export interface LogicResult {
  valid: boolean;
  value: boolean;
  error?: string;
}

/**
 * Boolean expression parser for procedural components. Deliberately avoids
 * eval/new Function so it also works under the app's strict CSP.
 */
export function evaluateLogicExpression(source: string, a = false, b = false): LogicResult {
  if (source.length > 200) return { valid: false, value: false, error: 'Expression is too long' };
  if (!source.trim()) return { valid: false, value: false, error: 'Expression is empty' };
  const raw = source.match(/[A-Za-z_][A-Za-z0-9_]*|&&|\|\||==|!=|\^|!|\(|\)|[01]/g) ?? [];
  if (raw.join('') !== source.replace(/\s+/g, ''))
    return { valid: false, value: false, error: 'Unsupported character or operator' };
  const tokens = raw.map((token) => {
    const word = token.toLowerCase();
    if (word === 'and') return '&&';
    if (word === 'or') return '||';
    if (word === 'not') return '!';
    return token;
  });
  let index = 0;
  const peek = () => tokens[index];
  const take = () => tokens[index++];

  function primary(): boolean {
    const token = take();
    if (token === '(') {
      const value = parseOr();
      if (take() !== ')') throw new Error('Missing closing parenthesis');
      return value;
    }
    if (token === 'A' || token === 'a') return a;
    if (token === 'B' || token === 'b') return b;
    if (token === '1' || token === 'true') return true;
    if (token === '0' || token === 'false') return false;
    throw new Error(token ? `Unknown value "${token}"` : 'Expected a value');
  }

  function unary(): boolean {
    if (peek() === '!') {
      take();
      return !unary();
    }
    return primary();
  }

  function equality(): boolean {
    let value = unary();
    while (peek() === '==' || peek() === '!=') {
      const op = take();
      const right = unary();
      value = op === '==' ? value === right : value !== right;
    }
    return value;
  }

  function parseAnd(): boolean {
    let value = equality();
    while (peek() === '&&') {
      take();
      const right = equality();
      value = value && right;
    }
    return value;
  }

  function parseXor(): boolean {
    let value = parseAnd();
    while (peek() === '^') {
      take();
      const right = parseAnd();
      value = value !== right;
    }
    return value;
  }

  function parseOr(): boolean {
    let value = parseXor();
    while (peek() === '||') {
      take();
      const right = parseXor();
      value = value || right;
    }
    return value;
  }

  try {
    const value = parseOr();
    if (index !== tokens.length) throw new Error(`Unexpected "${peek()}"`);
    return { valid: true, value };
  } catch (error) {
    return { valid: false, value: false, error: (error as Error).message };
  }
}

export function validateLogicExpression(source: string): { valid: boolean; error?: string } {
  const result = evaluateLogicExpression(source);
  return result.valid
    ? { valid: true }
    : { valid: false, ...(result.error ? { error: result.error } : {}) };
}
