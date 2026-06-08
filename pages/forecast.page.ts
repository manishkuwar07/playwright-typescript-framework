import { Page, expect } from '@playwright/test';

export class ForecastPage {

  constructor(private page: Page) {}

  private projectListIcon = 'a.material-icons.material-font-home.md-18.float-right.redirectButtons.mt-2';
  private gridRows = '.ag-center-cols-container .ag-row';

  async openProjectFromList(projectName: string) {

    // open project list
    const projectIcon = this.page.locator(this.projectListIcon);
    await projectIcon.waitFor({ state: 'visible' });
    await projectIcon.click();

    await this.page.waitForSelector(this.gridRows);

    // filter project
    const filterInput = this.page
      .locator('.ag-header-row.ag-header-row-column-filter input.ag-text-field-input')
      .first();

    await filterInput.fill(projectName);

    // wait for filtered row
    const projectRow = this.page
  .locator('.ag-pinned-left-cols-container .ag-row')
  .filter({ hasText: projectName })
  .first();

await expect(projectRow).toBeVisible();

const projectCell = projectRow.locator('[col-id="project_Name"]');

await projectCell.click({ force: true });

await this.page.waitForSelector('.ag-header', { timeout: 60000 });
  }
}