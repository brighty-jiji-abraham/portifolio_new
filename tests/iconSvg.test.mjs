import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { iconSvg } from '../src/components/scene/iconSvg.js';

function canonical(svg) {
  return svg.replace(/<([\w-]+)([^>]*?)>/g, (_, tag, attrs) => {
    const pairs = [...attrs.matchAll(/([\w:-]+)="([^"]*)"/g)].map(match => `${match[1]}="${match[2]}"`).sort();
    return `<${tag} ${pairs.join(' ')}>`;
  });
}

test('every universe icon has the same SVG geometry and attributes as the React renderer', async () => {
  let count = 0;
  for (const file of ['../src/data/skills.jsx', '../src/components/scene/EarthWorld.jsx']) {
    const source = await readFile(new URL(file, import.meta.url), 'utf8');
    for (const match of source.matchAll(/import\s*{([^}]+)}\s*from\s*"(react-icons\/[^"/]+)"/g)) {
      const library = await import(match[2]);
      for (const name of match[1].split(',').map(value => value.trim()).filter(Boolean)) {
        const Icon = library[name];
        const expected = renderToStaticMarkup(createElement(Icon))
          .replaceAll('currentColor', '#77d5b3').replaceAll('="1em"', '="128"');
        assert.equal(canonical(iconSvg(Icon, '#77d5b3')), canonical(expected), name);
        count++;
      }
    }
  }
  assert.ok(count >= 60, 'include all skill categories and orbit icons');
});
