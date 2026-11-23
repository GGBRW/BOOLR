import { test, expect } from '@playwright/test';
import config from '../vercel.json' with { type: 'json' };

test('production app boots and edits under the configured Vercel CSP', async ({ page }) => {
  test.skip(
    !process.env.PLAYWRIGHT_BASE_URL && process.env.PLAYWRIGHT_PRODUCTION !== '1',
    'Requires a production preview, not the Vite HMR server.',
  );
  const policy = config.headers
    .flatMap((rule) => rule.headers)
    .find((item) => item.key === 'Content-Security-Policy');
  if (!policy) throw new Error('Missing Vercel CSP');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (event) => {
      document.documentElement.dataset.cspViolation = event.violatedDirective;
    });
  });
  // Vite preview does not serve vercel.json headers. Apply the exact policy to
  // the document response to exercise browser enforcement without deploying.
  await page.route('**/*', async (route) => {
    if (route.request().resourceType() !== 'document') return route.continue();
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: { ...response.headers(), 'content-security-policy': policy.value },
    });
  });
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-reeo-ready', 'true');
  await page.locator('.main-menu > button').first().click();
  await page.getByPlaceholder('Board name').fill('Vercel security check');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await page.locator('#dialog .close').click();
  await page.getByRole('button', { name: 'NOT gate', exact: true }).click();
  await page.mouse.click(300, 300);
  expect(await page.evaluate('components.length')).toBe(1);
  expect(await page.locator('html').getAttribute('data-csp-violation')).toBeNull();
  expect(errors).toEqual([]);

  const procedural = await page.evaluate(`(() => {
    const part = new Procedural('CSP expression', {x: 4, y: 0});
    part.properties.expression = 'A ^ B';
    part.compile();
    part.input[0].value = 1;
    part.input[1].value = 0;
    components.push(part);
    part.update();
    return {error: part.compileError, value: part.output[0].value};
  })()`);
  expect(procedural).toEqual({ error: false, value: 1 });
  expect(errors).toEqual([]);
});
