import { test } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { ForecastPage } from '../pages/forecast.page';
import { compareGridWithFooter } from '../utils/grid.utils';
import user from '../test-data/user.json';

test('Forecast Totals Validation', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const forecastPage = new ForecastPage(page);

  await page.goto('https://example.com');

  await loginPage.login(user.username, user.password);

  await page.waitForURL('**/dashboard/myHome');

  await forecastPage.openProjectFromList('Sample Project');

  // ✅ FIXED WAIT (AG Grid)
  await page.waitForSelector('.ag-root');
  await page.waitForSelector('.ag-row');

  // ✅ Validation
  await compareGridWithFooter(page);

});