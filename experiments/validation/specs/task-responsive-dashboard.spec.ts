import { test, expect } from '@playwright/test';

const DEFAULT_KPIS = [
  { id: 'users', label: 'Active Users', value: '1,284' },
  { id: 'revenue', label: 'Revenue', value: '$42.1k' },
  { id: 'orders', label: 'Orders', value: '318' },
  { id: 'uptime', label: 'Uptime', value: '99.9%' },
];

async function mockDashboardApis(
  page,
  options: { kpiErrorId?: string; longLabels?: boolean } = {},
) {
  await page.unroute('**/api/kpis**');
  await page.unroute('**/api/cards**');

  await page.route('**/api/kpis**', async (route) => {
    const kpis = DEFAULT_KPIS.map((kpi) => {
      const withError =
        kpi.id === options.kpiErrorId
          ? { ...kpi, error: true, value: null }
          : kpi;
      if (options.longLabels) {
        return {
          ...withError,
          label: `${withError.label}-VERY-LONG-IDENTIFIER-THAT-SHOULD-WRAP-OR-TRUNCATE-${withError.id}`,
        };
      }
      return withError;
    });
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ kpis }),
    });
  });

  await page.route('**/api/cards**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ cards: [{ id: '1', title: 'Recent activity' }] }),
    });
  });
}

test.beforeEach(async ({ page }) => {
  await mockDashboardApis(page);
});

test('smoke-dash-render: dashboard shell and KPI region render', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByTestId('dashboard-shell')).toBeVisible();
  await expect(page.getByTestId('kpi-grid')).toBeVisible();
  await expect(page.getByTestId('kpi-card-users')).toBeVisible();
  await expect(page.getByTestId('management-actions')).toBeVisible();
});

test('smoke-dash-resize: viewport resize reflows without horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await expect(page.getByTestId('dashboard-shell')).toBeVisible();

  await page.setViewportSize({ width: 768, height: 800 });
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth + 2;
  });
  expect(overflow).toBe(false);
  await expect(page.getByTestId('kpi-card-users')).toBeVisible();
});

test('stress-dash-narrow: narrow viewport keeps nav and KPI usable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  const nav = page.getByTestId('dashboard-nav');
  await expect(nav).toBeVisible();
  const navBox = await nav.boundingBox();
  expect(navBox?.width ?? 0).toBeGreaterThan(0);

  const kpi = page.getByTestId('kpi-card-users');
  await expect(kpi).toBeVisible();
  const kpiBox = await kpi.boundingBox();
  expect(kpiBox?.width ?? 0).toBeGreaterThan(60);
});

test('stress-dash-long-text: long labels wrap or truncate without layout break', async ({
  page,
}) => {
  await mockDashboardApis(page, { longLabels: true });
  await page.goto('/');
  await expect(page.getByTestId('kpi-label').first()).toBeVisible();

  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth + 2;
  });
  expect(overflow).toBe(false);

  const label = page.getByTestId('kpi-label').first();
  const box = await label.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThan(12);
});

test('stress-dash-partial-error: one KPI error leaves rest usable', async ({
  page,
}) => {
  await mockDashboardApis(page, { kpiErrorId: 'revenue' });
  await page.goto('/');

  await expect(page.getByTestId('kpi-error')).toBeVisible();
  await expect(page.getByTestId('kpi-card-users')).toBeVisible();
  await expect(page.getByTestId('kpi-card-orders')).toBeVisible();
  await expect(page.getByTestId('management-actions')).toBeEnabled();
});

test('stress-dash-dense-kpi: dense KPI grid readable at laptop width', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/');

  const cards = page.getByTestId(/^kpi-card-/);
  await expect(cards).toHaveCount(4);

  for (const id of ['users', 'revenue', 'orders', 'uptime']) {
    const card = page.getByTestId(`kpi-card-${id}`);
    await expect(card).toBeVisible();
    const box = await card.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(100);
    await expect(card.getByTestId('kpi-value')).toBeVisible();
  }
});
