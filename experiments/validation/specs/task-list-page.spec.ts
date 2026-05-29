import { test, expect } from '@playwright/test';

const SAMPLE_ITEMS = [
  { id: '1', name: 'Alpha Widget', category: 'hardware' },
  { id: '2', name: 'Beta Service', category: 'software' },
  { id: '3', name: 'Gamma Plan', category: 'software' },
];

function mockItemsRoute(page, handler) {
  return page.unroute('**/api/items**').then(() =>
    page.route('**/api/items**', async (route) => {
      const url = new URL(route.request().url());
      await handler(route, url);
    }),
  );
}

test.beforeEach(async ({ page }) => {
  await mockItemsRoute(page, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: SAMPLE_ITEMS }),
    });
  });
});

test('smoke-list-render: list route renders rows or explicit empty state', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByTestId('list-page')).toBeVisible();
  const rows = page.getByTestId('item-row');
  const empty = page.getByTestId('empty-state');
  await expect(rows.first().or(empty)).toBeVisible();
  await expect(rows).toHaveCount(3);
});

test('smoke-list-filter: filter control changes visible list or empty state', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByTestId('item-row')).toHaveCount(3);

  await page.getByTestId('search-input').fill('Beta');
  await expect(page.getByTestId('item-row')).toHaveCount(1);
  await expect(page.getByTestId('item-row')).toContainText('Beta Service');

  await page.getByTestId('category-filter').selectOption('hardware');
  await expect(page.getByTestId('empty-state')).toBeVisible();
});

test('stress-list-empty: empty API shows empty state without crash', async ({
  page,
}) => {
  await mockItemsRoute(page, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [] }),
    });
  });

  await page.goto('/');
  await expect(page.getByTestId('empty-state')).toBeVisible();
  await expect(page.getByTestId('items-table')).toHaveCount(0);
});

test('stress-list-slow-fail-retry: slow fail shows loading then error and retry', async ({
  page,
}) => {
  let calls = 0;
  await mockItemsRoute(page, async (route) => {
    calls += 1;
    await new Promise((r) => setTimeout(r, 400));
    if (calls === 1) {
      await route.fulfill({ status: 500, body: 'Server error' });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: SAMPLE_ITEMS }),
    });
  });

  await page.goto('/');
  await expect(page.getByTestId('loading-state')).toBeVisible();
  await expect(page.getByTestId('error-state')).toBeVisible({ timeout: 10_000 });
  await page.getByTestId('retry-button').click();
  await expect(page.getByTestId('item-row').first()).toBeVisible({ timeout: 10_000 });
});

test('stress-list-stale-filter: rapid filter changes avoid stale data flash', async ({
  page,
}) => {
  await mockItemsRoute(page, async (route, url) => {
    const q = url.searchParams.get('q') ?? '';
    await new Promise((r) => setTimeout(r, q === 'slow' ? 800 : 100));
    const items =
      q === 'slow'
        ? [{ id: '99', name: 'Stale Should Not Appear', category: 'software' }]
        : SAMPLE_ITEMS.filter((item) =>
            item.name.toLowerCase().includes(q.toLowerCase()),
          );
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: q ? items : SAMPLE_ITEMS }),
    });
  });

  await page.goto('/');
  const search = page.getByTestId('search-input');
  await search.fill('slow');
  await search.fill('Beta');

  await expect(page.getByTestId('item-row')).toHaveCount(1, { timeout: 10_000 });
  await expect(page.getByText('Stale Should Not Appear')).toHaveCount(0);
});

test('stress-list-large-page: large page renders within timeout', async ({
  page,
}) => {
  const large = Array.from({ length: 200 }, (_, i) => ({
    id: String(i + 1),
    name: `Item ${i + 1}`,
    category: i % 2 === 0 ? 'hardware' : 'software',
  }));

  await mockItemsRoute(page, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: large }),
    });
  });

  await page.goto('/');
  await expect(page.getByTestId('item-row').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('item-row')).toHaveCount(200);
});
