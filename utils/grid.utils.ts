// utils/grid.utils.ts

import { expect, Page } from '@playwright/test';

export async function compareGridWithFooter(page: Page) {

  console.log('🚀 Starting Grid vs Footer Validation');

  // ✅ Step 1: Expand all groups properly
  await expandAllGroups(page);

  // ✅ Step 2: Get headers
  const headers = await page.locator('.ag-header-cell-text').allTextContents();

  const groupColIndex = headers.findIndex(h =>
    h.toLowerCase().includes('group')
  );

  if (groupColIndex === -1) {
    throw new Error('❌ Group column not found');
  }

  // ✅ Step 3: Identify value columns dynamically
  const valueCols = headers
    .map((h, i) => ({ name: h.toLowerCase(), index: i }))
    .filter(h =>
      h.name.includes('budget') ||
      h.name.includes('actual') ||
      h.name.includes('etc') ||
      h.name.includes('2026') // forecast months
    );

  console.log('📊 Value Columns:', valueCols);

  const rows = page.locator('.ag-center-cols-container .ag-row');
  const rowCount = await rows.count();

  console.log('📊 Total Rows:', rowCount);

  const totals: Record<string, Record<number, number>> = {};

  // ✅ Step 4: Loop rows
  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);

    const groupText = (await row.locator('.ag-cell').nth(groupColIndex).textContent())?.trim();

    if (!groupText || !groupText.includes('(')) continue;

    const category = groupText.split('(')[0].trim();

    if (!totals[category]) totals[category] = {};

    for (const col of valueCols) {
      const value = parseAmount(
        await row.locator('.ag-cell').nth(col.index).textContent()
      );

      totals[category][col.index] =
        (totals[category][col.index] || 0) + value;
    }
  }

  console.log('📊 Calculated Totals:', totals);

  // ✅ Step 5: Validate footer
  const footerRows = page.locator('.ag-floating-bottom-container .ag-row');

  const footerCount = await footerRows.count();

  for (let i = 0; i < footerCount; i++) {
    const row = footerRows.nth(i);

    const label = (await row.locator('.ag-cell').first().textContent())?.trim();

    if (!label) continue;

    const category = label.split('-').pop()?.trim();

    if (!category) continue;

    if (!totals[category]) {
      console.log(`⚠ No data for category: ${category}`);
      continue;
    }

    console.log(`\n🔍 Validating Category: ${category}`);

    for (const col of valueCols) {
      const footerValue = parseAmount(
        await row.locator('.ag-cell').nth(col.index).textContent()
      );

      const calculated = totals[category][col.index] || 0;

      console.log(
        `   Column: ${col.name} | UI: ${footerValue} | Calc: ${calculated}`
      );

      expect(footerValue).toBeCloseTo(calculated, 2);
    }
  }

  console.log('✅ Validation completed');
}


// 🔥 Expand + Scroll (CRITICAL)
async function expandAllGroups(page: Page) {

  const grid = page.locator('#myGridId .ag-body-viewport').first();

  let previousRowCount = 0;

  while (true) {

    // Expand visible collapsed groups only
    const expandBtns = page.locator('.ag-group-contracted:not(.ag-hidden)');
    const count = await expandBtns.count();

    for (let i = 0; i < count; i++) {
      await expandBtns.nth(i).click();
      await page.waitForTimeout(100);
    }

    const rows = page.locator('.ag-center-cols-container .ag-row');
    const currentRowCount = await rows.count();

    if (currentRowCount === previousRowCount) break;

    previousRowCount = currentRowCount;

    // Scroll down
    await grid.evaluate(el => el.scrollBy(0, 500));
    await page.waitForTimeout(500);
  }

  console.log('✅ All groups expanded');
}


// 💰 Helper
function parseAmount(val: string | null): number {
  if (!val) return 0;

  return Number(
    val
      .replace(/[$,]/g, '')
      .replace('-', '0')
      .trim()
  ) || 0;
}