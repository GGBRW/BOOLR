import { instructionNames } from './circuit-dsl';

interface Token {
  text: string;
  kind:
    | 'space'
    | 'comment'
    | 'string'
    | 'number'
    | 'word'
    | 'op'
    | 'value'
    | 'keyword'
    | 'type'
    | 'name'
    | 'reference'
    | 'property'
    | 'invalid';
}

const INSTRUCTIONS = new Set(instructionNames());

function lex(line: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  while (index < line.length) {
    const char = line[index] ?? '';
    if (/\s/.test(char)) {
      let text = '';
      while (index < line.length && /\s/.test(line[index] ?? '')) text += line[index++];
      tokens.push({ text, kind: 'space' });
      continue;
    }
    if (char === '/' && line[index + 1] === '/') {
      tokens.push({ text: line.slice(index), kind: 'comment' });
      break;
    }
    if (char === '#' && line.slice(0, index).trim() === '') {
      tokens.push({ text: line.slice(index), kind: 'comment' });
      break;
    }
    if (char === '"' || char === "'") {
      const quote = char;
      let text = char;
      ++index;
      while (index < line.length) {
        const next = line[index++] ?? '';
        text += next;
        if (next === '\\' && index < line.length) {
          text += line[index++] ?? '';
        } else if (next === quote) {
          break;
        }
      }
      tokens.push({ text, kind: 'string' });
      continue;
    }
    if (char === '-' && line[index + 1] === '>') {
      tokens.push({ text: '->', kind: 'op' });
      index += 2;
      continue;
    }
    if (char === '=' || char === ',' || char === '(' || char === ')') {
      tokens.push({ text: char, kind: 'op' });
      ++index;
      continue;
    }
    if (char === '#') {
      let text = '#';
      ++index;
      while (index < line.length && /[0-9a-f]/i.test(line[index] ?? '')) text += line[index++];
      tokens.push({ text, kind: 'value' });
      continue;
    }
    if (/[0-9]/.test(char) || (char === '-' && /[0-9]/.test(line[index + 1] ?? ''))) {
      let text = char;
      ++index;
      while (index < line.length && /[0-9.]/.test(line[index] ?? '')) text += line[index++];
      tokens.push({ text, kind: 'number' });
      continue;
    }
    if (/[A-Za-z_]/.test(char)) {
      let text = '';
      while (index < line.length) {
        const next = line[index] ?? '';
        if (!/[\w.-]/.test(next) && next !== '[' && next !== ']') break;
        text += next;
        ++index;
      }
      tokens.push({ text, kind: 'word' });
      continue;
    }
    tokens.push({ text: char, kind: 'op' });
    ++index;
  }
  return tokens;
}

function classify(tokens: Token[]): void {
  let command = '';
  let hasName = false;
  let expectValue = false;
  let afterAt = false;
  for (let index = 0; index < tokens.length; ++index) {
    const token = tokens[index]!;
    if (token.kind === 'space' || token.kind === 'comment') continue;

    if (token.kind === 'op') {
      if (token.text === '=') expectValue = true;
      continue;
    }
    if (token.kind === 'string' || token.kind === 'value' || token.kind === 'number') {
      expectValue = false;
      if (token.kind === 'number' && afterAt) token.kind = 'number';
      continue;
    }
    if (token.kind !== 'word') continue;

    const word = token.text.toLowerCase();
    if (!command) {
      command = word;
      if (word === 'wire' || word === 'connect') token.kind = 'keyword';
      else if (INSTRUCTIONS.has(word)) token.kind = 'type';
      else token.kind = 'invalid';
      continue;
    }
    if (command === 'wire' || command === 'connect') {
      token.kind = word === 'at' ? 'keyword' : 'reference';
      continue;
    }
    if (!hasName) {
      hasName = true;
      token.kind = 'name';
      continue;
    }
    if (word === 'at') {
      token.kind = 'keyword';
      afterAt = true;
      expectValue = false;
      continue;
    }
    if (expectValue) {
      token.kind = 'value';
      expectValue = false;
      continue;
    }

    let next = index + 1;
    while (next < tokens.length && tokens[next]?.kind === 'space') ++next;
    if (tokens[next]?.text === '=') {
      token.kind = 'property';
      continue;
    }
    token.kind = 'reference';
  }
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderToken(token: Token): string {
  if (token.kind === 'space') return escapeHtml(token.text);
  return `<span class="reeo-code-token tok-${token.kind}">${escapeHtml(token.text)}</span>`;
}

/** Safe HTML for the highlighting layer behind the editor textarea. */
export function highlightProgram(source: string, errorLines: Set<number> = new Set()): string {
  return source
    .split(/\r?\n/)
    .map((line, index) => {
      const tokens = lex(line);
      if (tokens.length === 0) {
        return `<div class="reeo-code-line${errorLines.has(index + 1) ? ' is-error' : ''}" data-line="${index + 1}"> </div>`;
      }
      classify(tokens);
      return (
        `<div class="reeo-code-line${errorLines.has(index + 1) ? ' is-error' : ''}" data-line="${index + 1}">` +
        tokens.map(renderToken).join('') +
        '</div>'
      );
    })
    .join('');
}
