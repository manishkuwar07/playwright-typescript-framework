import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async login(username: string, password: string) {
    await this.page.locator('[name="Username"]').fill(username);
    await this.page.locator('[name="Password"]').fill(password);
    await this.page.locator('[type="submit"]').click();
  }
}